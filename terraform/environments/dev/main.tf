terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  # Uncomment to use remote state
  # backend "gcs" {
  #   bucket = "YOUR_PROJECT_ID-tfstate"
  #   prefix = "dev"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  env = "dev"
}

# ============================================================
# Enable required APIs
# ============================================================
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "sqladmin.googleapis.com",
    "storage.googleapis.com",
    "vpcaccess.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

# ============================================================
# Artifact Registry
# ============================================================
module "artifact_registry" {
  source = "../../modules/artifact_registry"

  region        = var.region
  repository_id = "${var.app_name}-${local.env}"
  description   = "Docker images for ${var.app_name} (${local.env})"

  cleanup_keep_count      = 3
  cleanup_older_than_days = 30

  depends_on = [google_project_service.apis]
}

# ============================================================
# Secret Manager
# ============================================================
module "secrets" {
  source = "../../modules/secret_manager"

  region = var.region

  secrets = [
    { id = "${var.app_name}-${local.env}-db-password" },
  ]

  accessor_service_accounts = compact([
    var.cloud_run_service_account_email,
  ])

  depends_on = [google_project_service.apis]
}

# ============================================================
# Cloud SQL (PostgreSQL)
# ============================================================
module "cloud_sql" {
  source = "../../modules/cloud_sql"

  instance_name    = "${var.app_name}-${local.env}"
  region           = var.region
  database_version = "POSTGRES_15"
  tier             = "db-f1-micro" # Cheapest: shared vCPU, 0.6GB RAM
  disk_size_gb     = 10
  enable_public_ip = true
  enable_backups   = false # Disable for dev to save cost

  deletion_protection = false # Allow easy teardown in dev

  authorized_networks = var.sql_authorized_networks

  databases = [var.app_name]

  users = [
    {
      name     = var.db_user
      password = var.db_password
    },
  ]

  depends_on = [google_project_service.apis]
}

# ============================================================
# Cloud Run (Backend API)
# ============================================================
module "cloud_run_backend" {
  source = "../../modules/cloud_run"

  service_name       = "${var.app_name}-api-${local.env}"
  region             = var.region
  container_image    = "${module.artifact_registry.repository_url}/backend:latest"
  cpu                = "1"
  memory             = "256Mi"
  min_instance_count = 0 # Scale to zero
  max_instance_count = 2

  container_port        = 8080
  allow_unauthenticated = true
  service_account_email = var.cloud_run_service_account_email

  env_vars = [
    { name = "NODE_ENV", value = "development" },
    { name = "DB_HOST", value = module.cloud_sql.public_ip },
    { name = "DB_NAME", value = var.app_name },
    { name = "DB_USER", value = var.db_user },
    { name = "CLOUD_SQL_CONNECTION_NAME", value = module.cloud_sql.connection_name },
  ]

  secret_env_vars = [
    {
      name      = "DB_PASSWORD"
      secret_id = "${var.app_name}-${local.env}-db-password"
      version   = "latest"
    },
  ]

  depends_on = [
    google_project_service.apis,
    module.artifact_registry,
    module.secrets,
  ]
}

# ============================================================
# Cloud Build (CI/CD trigger)
# ============================================================
module "cloud_build" {
  source = "../../modules/cloud_build"
  count  = var.github_config != null ? 1 : 0

  trigger_name = "${var.app_name}-${local.env}-deploy"
  region       = var.region

  github_config = var.github_config

  cloudbuild_yaml_path = "cloudbuild.yaml"
  included_files       = ["backend/**"]

  substitutions = {
    _REGION         = var.region
    _REPOSITORY     = module.artifact_registry.repository_id
    _SERVICE_NAME   = module.cloud_run_backend.service_name
    _REPOSITORY_URL = module.artifact_registry.repository_url
  }

  depends_on = [google_project_service.apis]
}

# ============================================================
# Cloud Storage
# ============================================================
module "storage_assets" {
  source = "../../modules/cloud_storage"

  bucket_name              = "${var.project_id}-${var.app_name}-${local.env}-assets"
  location                 = upper(var.region)
  storage_class            = "STANDARD"
  force_destroy            = true # Allow easy teardown in dev
  public_access_prevention = "enforced"
  versioning_enabled       = false

  lifecycle_age_days = 90 # Auto-delete old objects

  depends_on = [google_project_service.apis]
}

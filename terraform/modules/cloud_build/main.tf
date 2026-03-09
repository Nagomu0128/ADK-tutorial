# GitHub connection (must be created and authorized in GCP Console first)
# After creating in console, import with:
#   terraform import 'module.cloud_build[0].google_cloudbuildv2_connection.github' \
#     projects/PROJECT_ID/locations/REGION/connections/CONNECTION_NAME
resource "google_cloudbuildv2_connection" "github" {
  name     = var.github_config.connection_name
  location = var.region
  project  = var.project_id

  github_config {
  }

  lifecycle {
    ignore_changes = [
      github_config,
    ]
  }
}

# Link the GitHub repository
resource "google_cloudbuildv2_repository" "this" {
  name              = var.github_config.repo
  location          = var.region
  parent_connection = google_cloudbuildv2_connection.github.name
  remote_uri        = "https://github.com/${var.github_config.owner}/${var.github_config.repo}.git"
}

# Build trigger using 2nd gen repository
resource "google_cloudbuild_trigger" "this" {
  name     = var.trigger_name
  location = var.region

  repository_event_config {
    repository = google_cloudbuildv2_repository.this.id

    push {
      branch = var.github_config.branch_pattern
    }
  }

  filename      = var.cloudbuild_yaml_path
  substitutions = var.substitutions
}

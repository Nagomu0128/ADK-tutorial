resource "google_cloud_run_v2_service" "this" {
  name                = var.service_name
  location            = var.region
  ingress             = var.ingress
  deletion_protection = var.deletion_protection

  template {
    # Cost optimization: scale to zero, limit max instances
    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }

    containers {
      image = var.container_image

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
        cpu_idle          = true  # CPU is only allocated during request processing
        startup_cpu_boost = false
      }

      dynamic "ports" {
        for_each = var.container_port != null ? [var.container_port] : []

        content {
          container_port = ports.value
        }
      }

      dynamic "env" {
        for_each = var.env_vars

        content {
          name  = env.value.name
          value = env.value.value
        }
      }

      dynamic "env" {
        for_each = var.secret_env_vars

        content {
          name = env.value.name

          value_source {
            secret_key_ref {
              secret  = env.value.secret_id
              version = env.value.version
            }
          }
        }
      }
    }

    dynamic "vpc_access" {
      for_each = var.vpc_connector_id != null ? [var.vpc_connector_id] : []

      content {
        connector = vpc_access.value
        egress    = "PRIVATE_RANGES_ONLY"
      }
    }

    service_account                  = var.service_account_email
    max_instance_request_concurrency = var.max_concurrency
    timeout                          = var.timeout
  }
}

# Allow unauthenticated access if specified
resource "google_cloud_run_v2_service_iam_member" "public" {
  count = var.allow_unauthenticated ? 1 : 0

  name     = google_cloud_run_v2_service.this.name
  location = google_cloud_run_v2_service.this.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

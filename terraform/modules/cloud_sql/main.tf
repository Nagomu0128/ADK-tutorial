resource "google_sql_database_instance" "this" {
  name                = var.instance_name
  database_version    = var.database_version
  region              = var.region
  deletion_protection = var.deletion_protection

  settings {
    # db-f1-micro: shared vCPU, 0.6GB RAM — cheapest option
    tier              = var.tier
    edition           = "ENTERPRISE"
    availability_type = "ZONAL" # Single zone for cost savings (no HA)
    disk_type         = "PD_HDD"
    disk_size         = var.disk_size_gb
    disk_autoresize   = false # Prevent unexpected cost increases

    ip_configuration {
      ipv4_enabled = var.enable_public_ip

      dynamic "authorized_networks" {
        for_each = var.authorized_networks

        content {
          name  = authorized_networks.value.name
          value = authorized_networks.value.cidr
        }
      }

      private_network = var.private_network_id
    }

    backup_configuration {
      enabled                        = var.enable_backups
      point_in_time_recovery_enabled = false # Disable PITR to save cost
      transaction_log_retention_days = var.enable_backups ? 1 : null
      backup_retention_settings {
        retained_backups = var.enable_backups ? 3 : 1
      }
    }

    maintenance_window {
      day          = 7 # Sunday
      hour         = 3 # 3 AM
      update_track = "stable"
    }

    insights_config {
      query_insights_enabled = false # Disable to save cost
    }
  }
}

resource "google_sql_database" "this" {
  for_each = toset(var.databases)

  name     = each.value
  instance = google_sql_database_instance.this.name
}

resource "google_sql_user" "this" {
  for_each = { for u in var.users : u.name => u }

  name     = each.value.name
  instance = google_sql_database_instance.this.name
  password = sensitive(each.value.password)
}

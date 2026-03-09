resource "google_storage_bucket" "this" {
  name     = var.bucket_name
  location = var.location

  storage_class               = var.storage_class
  uniform_bucket_level_access = true
  force_destroy               = var.force_destroy
  public_access_prevention    = var.public_access_prevention

  dynamic "lifecycle_rule" {
    for_each = var.lifecycle_age_days != null ? [var.lifecycle_age_days] : []

    content {
      condition {
        age = lifecycle_rule.value
      }
      action {
        type = "Delete"
      }
    }
  }

  dynamic "cors" {
    for_each = var.cors_config != null ? [var.cors_config] : []

    content {
      origin          = cors.value.origins
      method          = cors.value.methods
      response_header = cors.value.response_headers
      max_age_seconds = cors.value.max_age_seconds
    }
  }

  versioning {
    enabled = var.versioning_enabled
  }
}

resource "google_storage_bucket_iam_member" "members" {
  for_each = { for m in var.iam_members : "${m.role}-${m.member}" => m }

  bucket = google_storage_bucket.this.name
  role   = each.value.role
  member = each.value.member
}

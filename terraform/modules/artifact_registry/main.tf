resource "google_artifact_registry_repository" "this" {
  location      = var.region
  repository_id = var.repository_id
  format        = "DOCKER"
  description   = var.description

  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"

    most_recent_versions {
      keep_count = var.cleanup_keep_count
    }
  }

  cleanup_policies {
    id     = "delete-old-untagged"
    action = "DELETE"

    condition {
      tag_state  = "UNTAGGED"
      older_than = "${var.cleanup_older_than_days * 24 * 3600}s"
    }
  }
}

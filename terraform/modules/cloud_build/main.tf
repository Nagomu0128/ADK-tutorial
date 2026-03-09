resource "google_cloudbuild_trigger" "this" {
  name     = var.trigger_name
  location = var.region

  dynamic "github" {
    for_each = var.github_config != null ? [var.github_config] : []

    content {
      owner = github.value.owner
      name  = github.value.repo

      push {
        branch = github.value.branch_pattern
      }
    }
  }

  filename        = var.cloudbuild_yaml_path
  included_files  = var.included_files
  service_account = var.service_account_id
  substitutions   = var.substitutions
}

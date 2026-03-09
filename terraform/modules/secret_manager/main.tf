resource "google_secret_manager_secret" "this" {
  for_each = { for s in var.secrets : s.id => s }

  secret_id = each.value.id

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  labels = each.value.labels
}

resource "google_secret_manager_secret_version" "this" {
  for_each = { for s in var.secrets : s.id => s if s.value != null }

  secret      = google_secret_manager_secret.this[each.key].id
  secret_data = each.value.value
}

# Grant access to specified service accounts
resource "google_secret_manager_secret_iam_member" "accessor" {
  for_each = { for pair in flatten([
    for s in var.secrets : [
      for sa in var.accessor_service_accounts : {
        key       = "${s.id}-${sa}"
        secret_id = s.id
        member    = "serviceAccount:${sa}"
      }
    ]
  ]) : pair.key => pair }

  secret_id = google_secret_manager_secret.this[each.value.secret_id].id
  role      = "roles/secretmanager.secretAccessor"
  member    = each.value.member
}

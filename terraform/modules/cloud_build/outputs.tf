output "trigger_id" {
  value = google_cloudbuild_trigger.this.trigger_id
}

output "trigger_name" {
  value = google_cloudbuild_trigger.this.name
}

output "connection_name" {
  value = google_cloudbuildv2_connection.github.name
}

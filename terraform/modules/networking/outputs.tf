output "vpc_connector_id" {
  value = var.create_vpc_connector ? google_vpc_access_connector.this[0].id : null
}

output "private_network_id" {
  value = var.create_private_service_connection ? "projects/${google_compute_global_address.private_ip[0].project}/global/networks/${var.network}" : null
}

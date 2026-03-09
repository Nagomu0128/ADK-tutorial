# VPC Connector for Cloud Run -> Cloud SQL private connectivity
resource "google_vpc_access_connector" "this" {
  count = var.create_vpc_connector ? 1 : 0

  name          = var.connector_name
  region        = var.region
  ip_cidr_range = var.connector_cidr
  network       = var.network

  # Minimum throughput for cost savings
  min_throughput = 200
  max_throughput = 300
}

# Private IP for Cloud SQL
resource "google_compute_global_address" "private_ip" {
  count = var.create_private_service_connection ? 1 : 0

  name          = "${var.connector_name}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = var.network
}

resource "google_service_networking_connection" "private" {
  count = var.create_private_service_connection ? 1 : 0

  network                 = var.network
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip[0].name]
}

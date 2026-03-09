variable "region" {
  type = string
}

variable "network" {
  type    = string
  default = "default"
}

variable "connector_name" {
  type    = string
  default = "vpc-connector"
}

variable "connector_cidr" {
  type    = string
  default = "10.8.0.0/28"
}

variable "create_vpc_connector" {
  type    = bool
  default = false
}

variable "create_private_service_connection" {
  type    = bool
  default = false
}

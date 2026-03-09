variable "instance_name" {
  type = string
}

variable "region" {
  type = string
}

variable "database_version" {
  type    = string
  default = "POSTGRES_15"
}

variable "tier" {
  type    = string
  default = "db-f1-micro" # Cheapest: shared vCPU, 0.6GB RAM
}

variable "disk_size_gb" {
  type    = number
  default = 10
}

variable "enable_public_ip" {
  type    = bool
  default = true
}

variable "private_network_id" {
  type    = string
  default = null
}

variable "authorized_networks" {
  type = list(object({
    name = string
    cidr = string
  }))
  default = []
}

variable "deletion_protection" {
  type    = bool
  default = true
}

variable "enable_backups" {
  type    = bool
  default = true
}

variable "databases" {
  type    = list(string)
  default = []
}

variable "users" {
  type = list(object({
    name     = string
    password = string
  }))
  default = []
}

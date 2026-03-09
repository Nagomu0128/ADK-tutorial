variable "project_id" {
  type        = string
  description = "GCP project ID"
}

variable "region" {
  type    = string
  default = "asia-northeast1"
}

variable "app_name" {
  type    = string
  default = "adk-tutorial"
}

variable "db_user" {
  type    = string
  default = "app"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "cloud_run_service_account_email" {
  type    = string
  default = null
}

variable "sql_authorized_networks" {
  type = list(object({
    name = string
    cidr = string
  }))
  default = []
}

variable "github_config" {
  type = object({
    owner          = string
    repo           = string
    branch_pattern = string
  })
  default = null
}

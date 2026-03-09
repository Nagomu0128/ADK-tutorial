variable "service_name" {
  type = string
}

variable "region" {
  type = string
}

variable "container_image" {
  type    = string
  default = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "container_port" {
  type    = number
  default = 8080
}

variable "cpu" {
  type    = string
  default = "1"
}

variable "memory" {
  type    = string
  default = "256Mi"
}

variable "min_instance_count" {
  type    = number
  default = 0 # Scale to zero for cost savings
}

variable "max_instance_count" {
  type    = number
  default = 1
}

variable "max_concurrency" {
  type    = number
  default = 80
}

variable "timeout" {
  type    = string
  default = "300s"
}

variable "ingress" {
  type    = string
  default = "INGRESS_TRAFFIC_ALL"
}

variable "env_vars" {
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "secret_env_vars" {
  type = list(object({
    name      = string
    secret_id = string
    version   = string
  }))
  default = []
}

variable "service_account_email" {
  type    = string
  default = null
}

variable "vpc_connector_id" {
  type    = string
  default = null
}

variable "allow_unauthenticated" {
  type    = bool
  default = false
}

variable "region" {
  type = string
}

variable "secrets" {
  type = list(object({
    id     = string
    value  = optional(string)
    labels = optional(map(string), {})
  }))
  default   = []
  sensitive = true
}

variable "accessor_service_accounts" {
  type    = list(string)
  default = []
}

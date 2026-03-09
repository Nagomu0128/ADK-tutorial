variable "bucket_name" {
  type = string
}

variable "location" {
  type    = string
  default = "ASIA-NORTHEAST1"
}

variable "storage_class" {
  type    = string
  default = "STANDARD"
}

variable "force_destroy" {
  type    = bool
  default = false
}

variable "public_access_prevention" {
  type    = string
  default = "enforced"
}

variable "versioning_enabled" {
  type    = bool
  default = false
}

variable "lifecycle_age_days" {
  type    = number
  default = null
}

variable "cors_config" {
  type = object({
    origins          = list(string)
    methods          = list(string)
    response_headers = list(string)
    max_age_seconds  = number
  })
  default = null
}

variable "iam_members" {
  type = list(object({
    role   = string
    member = string
  }))
  default = []
}

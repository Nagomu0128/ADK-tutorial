variable "region" {
  type = string
}

variable "repository_id" {
  type = string
}

variable "description" {
  type    = string
  default = ""
}

variable "cleanup_keep_count" {
  type    = number
  default = 3
}

variable "cleanup_older_than_days" {
  type    = number
  default = 30
}

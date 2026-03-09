variable "trigger_name" {
  type = string
}

variable "region" {
  type = string
}

variable "project_id" {
  type = string
}

variable "github_config" {
  type = object({
    connection_name = string
    owner           = string
    repo            = string
    branch_pattern  = string
  })
}

variable "cloudbuild_yaml_path" {
  type    = string
  default = "cloudbuild.yaml"
}

variable "included_files" {
  type    = list(string)
  default = []
}

variable "service_account_id" {
  type    = string
  default = null
}

variable "substitutions" {
  type    = map(string)
  default = {}
}

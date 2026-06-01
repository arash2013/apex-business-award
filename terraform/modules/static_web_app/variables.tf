variable "resource_group_name" { type = string }
variable "location"            { type = string }
variable "environment"         { type = string }
variable "sku_tier"            { type = string; default = "Free" }
variable "tags"                { type = map(string) }

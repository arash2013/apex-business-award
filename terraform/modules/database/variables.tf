variable "resource_group_name" { type = string }
variable "location"            { type = string }
variable "sku_name"            { type = string }
variable "admin_password"      { type = string; sensitive = true }
variable "tags"                { type = map(string) }

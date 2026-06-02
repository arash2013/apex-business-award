variable "resource_group_name"  { type = string }
variable "location"             { type = string }
variable "acr_login_server"     { type = string }
variable "acr_admin_username"   { type = string }
variable "acr_admin_password"   { type = string; sensitive = true }
variable "database_url"         { type = string; sensitive = true }
variable "redis_url"            { type = string; sensitive = true }
variable "image_tag"            { type = string; default = "latest" }
variable "tags"                 { type = map(string) }

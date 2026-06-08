variable "location" {
  description = "Primary Azure region"
  type        = string
  default     = "southcentralus"
}

variable "static_web_app_location" {
  description = "Azure region for Static Web Apps (limited availability)"
  type        = string
  default     = "centralus"
}

variable "db_sku" {
  description = "PostgreSQL Flexible Server SKU"
  type        = string
  default     = "GP_Standard_D2s_v3"
}

variable "db_admin_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}

variable "redis_sku" {
  description = "Azure Cache for Redis SKU (Basic, Standard, Premium)"
  type        = string
  default     = "Standard"
}

variable "static_web_app_sku" {
  description = "Static Web App tier (Free or Standard)"
  type        = string
  default     = "Standard"
}

variable "container_image_tag" {
  description = "Docker image tag for initial deployment (subsequent updates use az containerapp update)"
  type        = string
  default     = "latest"
}

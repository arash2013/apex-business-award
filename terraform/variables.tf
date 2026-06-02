variable "environment" {
  description = "Deployment environment"
  type        = string
  validation {
    condition     = var.environment == "prod"
    error_message = "environment must be 'prod'"
  }
}

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
  default     = "B_Standard_B1ms"
}

variable "db_admin_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}

variable "redis_sku" {
  description = "Azure Cache for Redis SKU (Basic, Standard, Premium)"
  type        = string
  default     = "Basic"
}

variable "static_web_app_sku" {
  description = "Static Web App tier (Free or Standard)"
  type        = string
  default     = "Free"
}

variable "container_image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

resource "azurerm_redis_cache" "redis" {
  name                = "apex-prod-redis"
  resource_group_name = var.resource_group_name
  location            = var.location
  capacity            = 1
  family              = var.sku_name == "Premium" ? "P" : "C"
  sku_name            = var.sku_name
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
  tags                = var.tags
}

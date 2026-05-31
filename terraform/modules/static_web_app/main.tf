resource "azurerm_static_web_app" "frontend" {
  name                = "apex-${var.environment}-swa"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku_tier            = var.sku_tier
  sku_size            = var.sku_tier
  tags                = var.tags
}

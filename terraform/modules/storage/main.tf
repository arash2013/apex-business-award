resource "azurerm_storage_account" "assets" {
  name                     = "apex${var.environment}assets"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "prod" ? "GRS" : "LRS"
  min_tls_version          = "TLS1_2"
  tags                     = var.tags
}

resource "azurerm_storage_container" "award_assets" {
  name                  = "award-assets"
  storage_account_name  = azurerm_storage_account.assets.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "public_badges" {
  name                  = "public-badges"
  storage_account_name  = azurerm_storage_account.assets.name
  container_access_type = "blob"
}

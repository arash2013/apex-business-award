resource "azurerm_postgresql_flexible_server" "db" {
  name                   = "apex-prod-pg"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "16"
  administrator_login    = "apexadmin"
  administrator_password = var.admin_password
  sku_name               = var.sku_name
  storage_mb             = 32768
  backup_retention_days  = 7
  zone                   = "1"
  tags                   = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "apex" {
  name      = "apex_prod"
  server_id = azurerm_postgresql_flexible_server.db.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

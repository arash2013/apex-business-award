output "fqdn" {
  value = azurerm_postgresql_flexible_server.db.fqdn
}

output "connection_string" {
  value     = "postgresql+asyncpg://apexadmin:${var.admin_password}@${azurerm_postgresql_flexible_server.db.fqdn}:5432/apex_prod"
  sensitive = true
}

output "account_name"          { value = azurerm_storage_account.assets.name }
output "primary_blob_endpoint" { value = azurerm_storage_account.assets.primary_blob_endpoint }
output "primary_access_key" {
  value     = azurerm_storage_account.assets.primary_access_key
  sensitive = true
}

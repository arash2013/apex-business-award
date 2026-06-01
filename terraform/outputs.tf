output "resource_group_name" {
  description = "Name of the main resource group"
  value       = azurerm_resource_group.main.name
}

output "static_web_app_url" {
  description = "Default hostname for the Next.js frontend"
  value       = module.static_web_app.default_hostname
}

output "api_fqdn" {
  description = "FQDN of the FastAPI Container App"
  value       = module.container_apps.api_fqdn
}

output "acr_login_server" {
  description = "Azure Container Registry login server"
  value       = module.container_registry.login_server
}

output "key_vault_uri" {
  description = "Key Vault URI for secret references"
  value       = module.key_vault.vault_uri
}

output "storage_account_name" {
  description = "Blob storage account name"
  value       = module.storage.account_name
}

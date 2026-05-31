resource "azurerm_key_vault" "kv" {
  name                        = "apex-${var.environment}-kv"
  resource_group_name         = var.resource_group_name
  location                    = var.location
  tenant_id                   = var.tenant_id
  sku_name                    = "standard"
  soft_delete_retention_days  = 7
  purge_protection_enabled    = var.environment == "prod"
  tags                        = var.tags
}

# Allow the current Terraform identity to manage secrets (for CI/CD)
resource "azurerm_key_vault_access_policy" "terraform" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = var.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  secret_permissions = ["Get", "List", "Set", "Delete", "Purge"]
}

data "azurerm_client_config" "current" {}

# Tests for the key_vault module — naming, purge protection, soft delete.

mock_provider "azurerm" {
  mock_data "azurerm_client_config" {
    defaults = {
      tenant_id = "00000000-0000-0000-0000-000000000001"
      object_id = "00000000-0000-0000-0000-000000000002"
    }
  }
}

variables {
  resource_group_name = "apex-prod-rg"
  location            = "southcentralus"
  tenant_id           = "00000000-0000-0000-0000-000000000001"
  tags                = { project = "apex-business-award", managed_by = "terraform" }
}

run "key_vault_name_is_prod" {
  command = plan

  module {
    source = "./modules/key_vault"
  }

  assert {
    condition     = azurerm_key_vault.kv.name == "apex-prod-kv"
    error_message = "Key Vault must be named apex-prod-kv, got: ${azurerm_key_vault.kv.name}"
  }
}

run "no_dev_in_name" {
  command = plan

  module {
    source = "./modules/key_vault"
  }

  assert {
    condition     = !strcontains(azurerm_key_vault.kv.name, "dev")
    error_message = "Key Vault name must not contain 'dev'"
  }
}

run "purge_protection_enabled" {
  command = plan

  module {
    source = "./modules/key_vault"
  }

  assert {
    condition     = azurerm_key_vault.kv.purge_protection_enabled == true
    error_message = "Purge protection must be enabled in prod to prevent accidental data loss"
  }
}

run "soft_delete_retention_is_7_days" {
  command = plan

  module {
    source = "./modules/key_vault"
  }

  assert {
    condition     = azurerm_key_vault.kv.soft_delete_retention_days == 7
    error_message = "Soft delete retention must be 7 days"
  }
}

run "sku_is_standard" {
  command = plan

  module {
    source = "./modules/key_vault"
  }

  assert {
    condition     = azurerm_key_vault.kv.sku_name == "standard"
    error_message = "Key Vault SKU must be standard"
  }
}

run "terraform_access_policy_has_required_permissions" {
  command = plan

  module {
    source = "./modules/key_vault"
  }

  assert {
    condition = contains(
      azurerm_key_vault_access_policy.terraform.secret_permissions,
      "Get"
    )
    error_message = "Terraform access policy must include Get permission"
  }

  assert {
    condition = contains(
      azurerm_key_vault_access_policy.terraform.secret_permissions,
      "Set"
    )
    error_message = "Terraform access policy must include Set permission"
  }
}

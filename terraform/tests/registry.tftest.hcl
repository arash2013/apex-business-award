# Tests for the container_registry module — naming, SKU, admin access.

mock_provider "azurerm" {}

variables {
  resource_group_name = "apex-prod-rg"
  location            = "southcentralus"
  tags                = { project = "apex-business-award", managed_by = "terraform" }
}

run "acr_name_is_prod" {
  command = plan

  module {
    source = "../modules/container_registry"
  }

  assert {
    condition     = azurerm_container_registry.acr.name == "apexprodacr"
    error_message = "ACR must be named apexprodacr, got: ${azurerm_container_registry.acr.name}"
  }
}

run "no_dev_in_name" {
  command = plan

  module {
    source = "../modules/container_registry"
  }

  assert {
    condition     = !strcontains(azurerm_container_registry.acr.name, "dev")
    error_message = "ACR name must not contain 'dev'"
  }
}

run "sku_is_basic" {
  command = plan

  module {
    source = "../modules/container_registry"
  }

  assert {
    condition     = azurerm_container_registry.acr.sku == "Basic"
    error_message = "ACR must use Basic SKU"
  }
}

run "admin_access_enabled" {
  command = plan

  module {
    source = "../modules/container_registry"
  }

  assert {
    condition     = azurerm_container_registry.acr.admin_enabled == true
    error_message = "ACR admin access must be enabled (required for Container Apps pull)"
  }
}

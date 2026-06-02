# Tests for the static_web_app module — naming and SKU tier.

mock_provider "azurerm" {}

variables {
  resource_group_name = "apex-prod-rg"
  location            = "centralus"
  sku_tier            = "Standard"
  tags                = { project = "apex-business-award", managed_by = "terraform" }
}

run "swa_name_is_prod" {
  command = plan

  module {
    source = "../modules/static_web_app"
  }

  assert {
    condition     = azurerm_static_web_app.frontend.name == "apex-prod-swa"
    error_message = "Static Web App must be named apex-prod-swa, got: ${azurerm_static_web_app.frontend.name}"
  }
}

run "no_dev_in_name" {
  command = plan

  module {
    source = "../modules/static_web_app"
  }

  assert {
    condition     = !strcontains(azurerm_static_web_app.frontend.name, "dev")
    error_message = "Static Web App name must not contain 'dev'"
  }
}

run "sku_tier_is_standard" {
  command = plan

  module {
    source = "../modules/static_web_app"
  }

  assert {
    condition     = azurerm_static_web_app.frontend.sku_tier == "Standard"
    error_message = "Prod SWA must use Standard tier (Free tier lacks custom domains and staging environments)"
  }
}

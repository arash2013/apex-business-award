# Tests for the root module — resource group name, location, and tags.

mock_provider "azurerm" {
  mock_data "azurerm_client_config" {
    defaults = {
      tenant_id = "00000000-0000-0000-0000-000000000001"
      object_id = "00000000-0000-0000-0000-000000000002"
    }
  }
}

variables {
  db_admin_password = "TestPassword123!"
}

run "resource_group_is_prod" {
  command = plan

  assert {
    condition     = azurerm_resource_group.main.name == "apex-prod-rg"
    error_message = "Resource group must be named apex-prod-rg, got: ${azurerm_resource_group.main.name}"
  }
}

run "resource_group_location" {
  command = plan

  assert {
    condition     = azurerm_resource_group.main.location == "southcentralus"
    error_message = "Resource group must be in southcentralus"
  }
}

run "no_dev_in_resource_group_name" {
  command = plan

  assert {
    condition     = !strcontains(azurerm_resource_group.main.name, "dev")
    error_message = "Resource group name must not contain 'dev' — single environment only"
  }
}

run "tags_contain_required_keys" {
  command = plan

  assert {
    condition     = local.tags["project"] == "apex-business-award"
    error_message = "tags must include project = apex-business-award"
  }

  assert {
    condition     = local.tags["managed_by"] == "terraform"
    error_message = "tags must include managed_by = terraform"
  }
}

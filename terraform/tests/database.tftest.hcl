# Tests for the database module — naming, version, charset, firewall rule.

mock_provider "azurerm" {}

variables {
  resource_group_name = "apex-prod-rg"
  location            = "southcentralus"
  sku_name            = "GP_Standard_D2s_v3"
  admin_password      = "TestPassword123!"
  tags                = { project = "apex-business-award", managed_by = "terraform" }
}

run "server_name_is_prod" {
  command = plan

  module {
    source = "./modules/database"
  }

  assert {
    condition     = azurerm_postgresql_flexible_server.db.name == "apex-prod-pg"
    error_message = "PostgreSQL server must be named apex-prod-pg, got: ${azurerm_postgresql_flexible_server.db.name}"
  }
}

run "database_name_is_apex_prod" {
  command = plan

  module {
    source = "./modules/database"
  }

  assert {
    condition     = azurerm_postgresql_flexible_server_database.apex.name == "apex_prod"
    error_message = "Database name must be apex_prod, got: ${azurerm_postgresql_flexible_server_database.apex.name}"
  }
}

run "no_dev_in_any_name" {
  command = plan

  module {
    source = "./modules/database"
  }

  assert {
    condition     = !strcontains(azurerm_postgresql_flexible_server.db.name, "dev")
    error_message = "Server name must not contain 'dev'"
  }

  assert {
    condition     = !strcontains(azurerm_postgresql_flexible_server_database.apex.name, "dev")
    error_message = "Database name must not contain 'dev'"
  }
}

run "postgres_version_is_16" {
  command = plan

  module {
    source = "./modules/database"
  }

  assert {
    condition     = azurerm_postgresql_flexible_server.db.version == "16"
    error_message = "PostgreSQL version must be 16"
  }
}

run "database_charset_is_utf8" {
  command = plan

  module {
    source = "./modules/database"
  }

  assert {
    condition     = azurerm_postgresql_flexible_server_database.apex.charset == "UTF8"
    error_message = "Database charset must be UTF8"
  }
}

run "azure_services_firewall_rule_exists" {
  command = plan

  module {
    source = "./modules/database"
  }

  assert {
    condition     = azurerm_postgresql_flexible_server_firewall_rule.allow_azure.start_ip_address == "0.0.0.0"
    error_message = "Firewall rule must allow Azure services (0.0.0.0)"
  }

  assert {
    condition     = azurerm_postgresql_flexible_server_firewall_rule.allow_azure.end_ip_address == "0.0.0.0"
    error_message = "Firewall rule must be Azure-services-only (0.0.0.0 to 0.0.0.0)"
  }
}

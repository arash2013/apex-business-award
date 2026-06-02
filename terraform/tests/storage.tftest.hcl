# Tests for the storage module — naming, GRS replication, TLS, container access types.

mock_provider "azurerm" {}

variables {
  resource_group_name = "apex-prod-rg"
  location            = "southcentralus"
  tags                = { project = "apex-business-award", managed_by = "terraform" }
}

run "storage_account_name_is_prod" {
  command = plan

  module {
    source = "../modules/storage"
  }

  assert {
    condition     = azurerm_storage_account.assets.name == "apexprodassets"
    error_message = "Storage account must be named apexprodassets, got: ${azurerm_storage_account.assets.name}"
  }
}

run "no_dev_in_name" {
  command = plan

  module {
    source = "../modules/storage"
  }

  assert {
    condition     = !strcontains(azurerm_storage_account.assets.name, "dev")
    error_message = "Storage account name must not contain 'dev'"
  }
}

run "replication_is_grs" {
  command = plan

  module {
    source = "../modules/storage"
  }

  assert {
    condition     = azurerm_storage_account.assets.account_replication_type == "GRS"
    error_message = "Prod storage must use GRS (geo-redundant) replication, not LRS"
  }
}

run "minimum_tls_version_is_1_2" {
  command = plan

  module {
    source = "../modules/storage"
  }

  assert {
    condition     = azurerm_storage_account.assets.min_tls_version == "TLS1_2"
    error_message = "Storage account must enforce TLS 1.2 minimum"
  }
}

run "award_assets_container_is_private" {
  command = plan

  module {
    source = "../modules/storage"
  }

  assert {
    condition     = azurerm_storage_container.award_assets.container_access_type == "private"
    error_message = "award-assets container must be private"
  }
}

run "public_badges_container_allows_blob_read" {
  command = plan

  module {
    source = "../modules/storage"
  }

  assert {
    condition     = azurerm_storage_container.public_badges.container_access_type == "blob"
    error_message = "public-badges container must allow anonymous blob read"
  }
}

# Tests for the redis module — naming, TLS enforcement, SSL port.

mock_provider "azurerm" {}

variables {
  resource_group_name = "apex-prod-rg"
  location            = "southcentralus"
  sku_name            = "Standard"
  tags                = { project = "apex-business-award", managed_by = "terraform" }
}

run "redis_name_is_prod" {
  command = plan

  module {
    source = "./modules/redis"
  }

  assert {
    condition     = azurerm_redis_cache.redis.name == "apex-prod-redis"
    error_message = "Redis cache must be named apex-prod-redis, got: ${azurerm_redis_cache.redis.name}"
  }
}

run "no_dev_in_name" {
  command = plan

  module {
    source = "./modules/redis"
  }

  assert {
    condition     = !strcontains(azurerm_redis_cache.redis.name, "dev")
    error_message = "Redis name must not contain 'dev'"
  }
}

run "non_ssl_port_disabled" {
  command = plan

  module {
    source = "./modules/redis"
  }

  assert {
    condition     = azurerm_redis_cache.redis.enable_non_ssl_port == false
    error_message = "Non-SSL port (6379) must be disabled; use SSL port 6380 only"
  }
}

run "minimum_tls_version_is_1_2" {
  command = plan

  module {
    source = "./modules/redis"
  }

  assert {
    condition     = azurerm_redis_cache.redis.minimum_tls_version == "1.2"
    error_message = "Redis must enforce TLS 1.2 minimum"
  }
}

run "sku_is_standard_c1" {
  command = plan

  module {
    source = "./modules/redis"
  }

  assert {
    condition     = azurerm_redis_cache.redis.sku_name == "Standard"
    error_message = "Prod Redis must use Standard SKU (with replication)"
  }

  assert {
    condition     = azurerm_redis_cache.redis.capacity == 1
    error_message = "Prod Redis must be capacity 1 (C1)"
  }
}

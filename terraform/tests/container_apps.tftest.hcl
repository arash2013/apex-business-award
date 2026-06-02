# Tests for the container_apps module — naming, scaling, ingress, KEDA.

mock_provider "azurerm" {}

variables {
  resource_group_name = "apex-prod-rg"
  location            = "southcentralus"
  acr_login_server    = "apexprodacr.azurecr.io"
  acr_admin_username  = "apexprodacr"
  acr_admin_password  = "test-acr-password"
  database_url        = "postgresql+asyncpg://apexadmin:pass@host:5432/apex_prod"
  redis_url           = "redis://:key@host:6380/0?ssl=true"
  tags                = { project = "apex-business-award", managed_by = "terraform" }
}

run "api_name_is_prod" {
  command = plan

  module {
    source = "../modules/container_apps"
  }

  assert {
    condition     = azurerm_container_app.api.name == "apex-prod-api"
    error_message = "API Container App must be named apex-prod-api, got: ${azurerm_container_app.api.name}"
  }
}

run "worker_name_is_prod" {
  command = plan

  module {
    source = "../modules/container_apps"
  }

  assert {
    condition     = azurerm_container_app.worker.name == "apex-prod-worker"
    error_message = "Worker Container App must be named apex-prod-worker, got: ${azurerm_container_app.worker.name}"
  }
}

run "no_dev_in_any_name" {
  command = plan

  module {
    source = "../modules/container_apps"
  }

  assert {
    condition     = !strcontains(azurerm_container_app.api.name, "dev")
    error_message = "API Container App name must not contain 'dev'"
  }

  assert {
    condition     = !strcontains(azurerm_container_app.worker.name, "dev")
    error_message = "Worker Container App name must not contain 'dev'"
  }

  assert {
    condition     = !strcontains(azurerm_container_app_environment.env.name, "dev")
    error_message = "Container App Environment name must not contain 'dev'"
  }

  assert {
    condition     = !strcontains(azurerm_log_analytics_workspace.logs.name, "dev")
    error_message = "Log Analytics Workspace name must not contain 'dev'"
  }
}

run "api_has_external_ingress_on_port_8000" {
  command = plan

  module {
    source = "../modules/container_apps"
  }

  assert {
    condition     = azurerm_container_app.api.ingress[0].external_enabled == true
    error_message = "API Container App must have external ingress enabled"
  }

  assert {
    condition     = azurerm_container_app.api.ingress[0].target_port == 8000
    error_message = "API Container App must expose port 8000"
  }
}

run "api_scaling_is_prod" {
  command = plan

  module {
    source = "../modules/container_apps"
  }

  assert {
    condition     = azurerm_container_app.api.template[0].min_replicas == 1
    error_message = "API min_replicas must be 1 (always-on for prod)"
  }

  assert {
    condition     = azurerm_container_app.api.template[0].max_replicas == 5
    error_message = "API max_replicas must be 5"
  }
}

run "worker_scales_to_zero" {
  command = plan

  module {
    source = "../modules/container_apps"
  }

  assert {
    condition     = azurerm_container_app.worker.template[0].min_replicas == 0
    error_message = "Worker min_replicas must be 0 to allow scale-to-zero"
  }

  assert {
    condition     = azurerm_container_app.worker.template[0].max_replicas == 3
    error_message = "Worker max_replicas must be 3"
  }
}

run "environment_var_is_prod" {
  command = plan

  module {
    source = "../modules/container_apps"
  }

  assert {
    condition = anytrue([
      for env in azurerm_container_app.api.template[0].container[0].env :
      env.name == "ENVIRONMENT" && env.value == "prod"
    ])
    error_message = "API Container App must have ENVIRONMENT=prod"
  }
}

resource "azurerm_log_analytics_workspace" "logs" {
  name                = "apex-${var.environment}-logs"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = var.tags
}

resource "azurerm_container_app_environment" "env" {
  name                       = "apex-${var.environment}-cae"
  resource_group_name        = var.resource_group_name
  location                   = var.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.logs.id
  tags                       = var.tags
}

# FastAPI Backend
resource "azurerm_container_app" "api" {
  name                         = "apex-${var.environment}-api"
  resource_group_name          = var.resource_group_name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"
  tags                         = var.tags

  registry {
    server               = var.acr_login_server
    username             = var.acr_admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.acr_admin_password
  }
  secret {
    name  = "database-url"
    value = var.database_url
  }
  secret {
    name  = "redis-url"
    value = var.redis_url
  }

  template {
    min_replicas = var.environment == "prod" ? 1 : 0
    max_replicas = var.environment == "prod" ? 5 : 2

    container {
      name   = "api"
      image  = "${var.acr_login_server}/apex-api:${var.image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }
      env {
        name        = "REDIS_URL"
        secret_name = "redis-url"
      }
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 8000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }
}

# Celery Worker
resource "azurerm_container_app" "worker" {
  name                         = "apex-${var.environment}-worker"
  resource_group_name          = var.resource_group_name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"
  tags                         = var.tags

  registry {
    server               = var.acr_login_server
    username             = var.acr_admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.acr_admin_password
  }
  secret {
    name  = "database-url"
    value = var.database_url
  }
  secret {
    name  = "redis-url"
    value = var.redis_url
  }

  template {
    # Scale to zero when Redis queue is empty
    min_replicas = 0
    max_replicas = 3

    container {
      name    = "worker"
      image   = "${var.acr_login_server}/apex-api:${var.image_tag}"
      cpu     = 1.0
      memory  = "2Gi"
      command = ["celery", "-A", "workers.celery_app", "worker", "--loglevel=info"]

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }
      env {
        name        = "REDIS_URL"
        secret_name = "redis-url"
      }
    }

    # KEDA scaler on Redis list depth
    custom_scale_rule {
      name             = "redis-queue-depth"
      custom_rule_type = "redis"
      metadata = {
        listName    = "celery"
        listLength  = "5"
        address     = "redis-url"
      }
    }
  }
}

terraform {
  required_version = ">= 1.6"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.95"
    }
  }

  backend "azurerm" {
    resource_group_name  = "apex-tfstate-rg"
    storage_account_name = "apextfstateprod"
    container_name       = "tfstate"
    key                  = "apex.tfstate"
  }
}

provider "azurerm" {
  features {}
  subscription_id = "bab197e5-e20e-4b6c-9677-6c0c6ee35ece"
  tenant_id       = "e00eceaf-88af-4797-8ef0-caff93fcfa81"
}

resource "azurerm_resource_group" "main" {
  name     = "apex-prod-rg"
  location = var.location
  tags     = local.tags
}

locals {
  tags = {
    project    = "apex-business-award"
    managed_by = "terraform"
  }
}

# ── Modules ──────────────────────────────────────────────────────────────────

module "container_registry" {
  source              = "./modules/container_registry"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
}

module "database" {
  source              = "./modules/database"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  sku_name            = var.db_sku
  admin_password      = var.db_admin_password
  tags                = local.tags
}

module "redis" {
  source              = "./modules/redis"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  sku_name            = var.redis_sku
  tags                = local.tags
}

module "key_vault" {
  source              = "./modules/key_vault"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  tags                = local.tags
}

module "storage" {
  source              = "./modules/storage"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
}

module "static_web_app" {
  source              = "./modules/static_web_app"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.static_web_app_location
  sku_tier            = var.static_web_app_sku
  tags                = local.tags
}

module "container_apps" {
  source              = "./modules/container_apps"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  acr_login_server    = module.container_registry.login_server
  acr_admin_username  = module.container_registry.admin_username
  acr_admin_password  = module.container_registry.admin_password
  database_url        = module.database.connection_string
  redis_url           = module.redis.connection_string
  image_tag           = var.container_image_tag
  tags                = local.tags
}

data "azurerm_client_config" "current" {}

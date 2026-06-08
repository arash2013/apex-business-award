output "hostname" {
  value = azurerm_redis_cache.redis.hostname
}

output "connection_string" {
  value     = "redis://:${azurerm_redis_cache.redis.primary_access_key}@${azurerm_redis_cache.redis.hostname}:6380/0?ssl=true"
  sensitive = true
}

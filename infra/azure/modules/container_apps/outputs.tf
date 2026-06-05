output "api_fqdn"    { value = azurerm_container_app.api.ingress[0].fqdn }
output "worker_id"  { value = azurerm_container_app.worker.id }

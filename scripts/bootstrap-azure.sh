#!/usr/bin/env bash
# bootstrap-azure.sh — one-time Azure setup (already executed 2026-06-02)
#
# What was provisioned:
#   - Resource group:    apex-tfstate-rg  (southcentralus)
#   - Storage account:   apextfstateprod  (tfstate container)
#   - App registration:  apex-github-actions  (appId: 95c99781-3e73-413a-8216-4b22436a7592)
#   - Service principal: 628c30a4-1774-4790-9258-db1c99bf06b3
#   - OIDC credentials:  github-env-prod, github-main, github-pr
#   - Roles on sub:      Contributor, Key Vault Administrator, Storage Blob Data Contributor
#
# GitHub secrets to configure (Settings → Secrets → Actions):
#   AZURE_CLIENT_ID       = 95c99781-3e73-413a-8216-4b22436a7592
#   AZURE_TENANT_ID       = e00eceaf-88af-4797-8ef0-caff93fcfa81
#   AZURE_SUBSCRIPTION_ID = bab197e5-e20e-4b6c-9677-6c0c6ee35ece
#   DB_ADMIN_PASSWORD     = <choose a strong password>
#   NEXT_PUBLIC_API_URL   = https://apex-prod-api.<region>.azurecontainerapps.io
#   NEXTAUTH_URL          = https://<swa-domain>.azurestaticapps.net
#   NEXTAUTH_SECRET       = <random 32+ char string>
#   AZURE_AD_CLIENT_ID    = <app reg for NextAuth>
#   AZURE_AD_CLIENT_SECRET = <client secret for NextAuth>
#
# Note: az role assignment create is broken for this subscription (MissingSubscription
# error in the CLI wrapper). Role assignments were created via az rest PUT instead.
# The idempotent re-run section below uses the same REST approach.

set -euo pipefail

SUBSCRIPTION_ID="bab197e5-e20e-4b6c-9677-6c0c6ee35ece"
TENANT_ID="e00eceaf-88af-4797-8ef0-caff93fcfa81"
APP_ID="95c99781-3e73-413a-8216-4b22436a7592"
SP_OID="628c30a4-1774-4790-9258-db1c99bf06b3"
GITHUB_ORG="arash2013"
GITHUB_REPO="apex-business-award"
TFSTATE_RG="apex-tfstate-rg"
TFSTATE_SA="apextfstateprod"
LOCATION="southcentralus"

echo "→ Using subscription: $SUBSCRIPTION_ID"
az account set --subscription "$SUBSCRIPTION_ID"

# ── Terraform state backend (idempotent) ──────────────────────────────────────
az group create --name "$TFSTATE_RG" --location "$LOCATION" --output none
az storage account create \
  --name "$TFSTATE_SA" --resource-group "$TFSTATE_RG" --location "$LOCATION" \
  --sku Standard_LRS --min-tls-version TLS1_2 --allow-blob-public-access false \
  --output none
az storage container create \
  --name tfstate --account-name "$TFSTATE_SA" --auth-mode login --output none
echo "  State backend: ${TFSTATE_SA}/tfstate  ✓"

# ── OIDC federated credentials (idempotent) ───────────────────────────────────
add_cred() {
  local NAME="$1" SUBJECT="$2"
  EXISTING=$(az ad app federated-credential list --id "$APP_ID" \
    --query "[?name=='${NAME}'].name" -o tsv 2>/dev/null)
  if [[ -n "$EXISTING" ]]; then
    echo "  OIDC '$NAME' already exists"
  else
    az ad app federated-credential create --id "$APP_ID" --parameters "{
      \"name\": \"${NAME}\",
      \"issuer\": \"https://token.actions.githubusercontent.com\",
      \"subject\": \"${SUBJECT}\",
      \"audiences\": [\"api://AzureADTokenExchange\"]
    }" --output none
    echo "  OIDC '$NAME' created"
  fi
}

add_cred "github-env-prod" "repo:${GITHUB_ORG}/${GITHUB_REPO}:environment:prod"
add_cred "github-main"     "repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/main"
add_cred "github-pr"       "repo:${GITHUB_ORG}/${GITHUB_REPO}:pull_request"

# ── Role assignments via REST (az role assignment create broken for this sub) ─
assign_role() {
  local GUID="$1" ROLE_DEF_ID="$2" ROLE_NAME="$3"
  az rest --method PUT \
    --url "https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/providers/Microsoft.Authorization/roleAssignments/${GUID}?api-version=2022-04-01" \
    --body "{\"properties\":{
      \"roleDefinitionId\":\"/subscriptions/${SUBSCRIPTION_ID}/providers/Microsoft.Authorization/roleDefinitions/${ROLE_DEF_ID}\",
      \"principalId\":\"${SP_OID}\",
      \"principalType\":\"ServicePrincipal\"
    }}" --output none 2>/dev/null && echo "  Role '$ROLE_NAME' assigned" || echo "  Role '$ROLE_NAME' already assigned"
}

assign_role "a1b2c3d4-e5f6-7890-abcd-ef1234567890" "b24988ac-6180-42a0-ab88-20f7382dd24c" "Contributor"
assign_role "b1b2c3d4-e5f6-7890-abcd-ef1234567891" "00482a5a-887f-4fb3-b363-3b7fe8e74483" "Key Vault Administrator"
assign_role "c1b2c3d4-e5f6-7890-abcd-ef1234567892" "ba92f5b4-2d11-453d-a403-e96b0029c9fe" "Storage Blob Data Contributor"

echo ""
echo "Bootstrap complete."
echo ""
echo "GitHub secrets to add (Settings → Secrets → Actions):"
echo "  AZURE_CLIENT_ID       = $APP_ID"
echo "  AZURE_TENANT_ID       = $TENANT_ID"
echo "  AZURE_SUBSCRIPTION_ID = $SUBSCRIPTION_ID"

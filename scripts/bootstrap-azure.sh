#!/usr/bin/env bash
# bootstrap-azure.sh — one-time setup for Apex Azure infrastructure
#
# Run this once from a terminal where you are already logged in with:
#   az login
#
# What it does:
#   1. Sets the active subscription
#   2. Creates the Terraform remote-state storage account
#   3. Creates an App Registration (service principal) for GitHub Actions OIDC
#   4. Adds federated credentials for the "prod" GitHub Actions environment
#   5. Assigns Contributor + Key Vault Administrator roles on the subscription
#   6. Prints the values you need to add as GitHub repository secrets
set -euo pipefail

SUBSCRIPTION_ID="bab197e5-e20e-4b6c-9677-6c0c6ee35ece"
GITHUB_ORG="arash2013"
GITHUB_REPO="apex-business-award"
APP_DISPLAY_NAME="apex-github-actions"

TFSTATE_RG="apex-tfstate-rg"
TFSTATE_SA="apextfstateprod"   # must be globally unique, 3-24 chars, lowercase
TFSTATE_CONTAINER="tfstate"
LOCATION="southcentralus"

# ── 1. Set subscription ───────────────────────────────────────────────────────
echo "→ Setting active subscription..."
az account set --subscription "$SUBSCRIPTION_ID"
TENANT_ID=$(az account show --query tenantId -o tsv)
echo "  Tenant: $TENANT_ID  Subscription: $SUBSCRIPTION_ID"

# ── 2. Terraform state storage ────────────────────────────────────────────────
echo "→ Creating Terraform state resource group and storage..."
az group create \
  --name "$TFSTATE_RG" \
  --location "$LOCATION" \
  --output none

az storage account create \
  --name "$TFSTATE_SA" \
  --resource-group "$TFSTATE_RG" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --min-tls-version TLS1_2 \
  --allow-blob-public-access false \
  --output none

az storage container create \
  --name "$TFSTATE_CONTAINER" \
  --account-name "$TFSTATE_SA" \
  --auth-mode login \
  --output none

echo "  State backend: ${TFSTATE_SA}/${TFSTATE_CONTAINER}"

# ── 3. App Registration (service principal) ───────────────────────────────────
echo "→ Creating App Registration '$APP_DISPLAY_NAME'..."

# Reuse if it already exists
EXISTING_APP_ID=$(az ad app list \
  --display-name "$APP_DISPLAY_NAME" \
  --query "[0].appId" -o tsv 2>/dev/null || true)

if [[ -n "$EXISTING_APP_ID" ]]; then
  APP_ID="$EXISTING_APP_ID"
  echo "  Reusing existing app: $APP_ID"
else
  APP_ID=$(az ad app create \
    --display-name "$APP_DISPLAY_NAME" \
    --query appId -o tsv)
  echo "  Created app: $APP_ID"
fi

# Ensure a service principal exists for this app
SP_OBJECT_ID=$(az ad sp show --id "$APP_ID" --query id -o tsv 2>/dev/null || \
  az ad sp create --id "$APP_ID" --query id -o tsv)
echo "  Service principal object ID: $SP_OBJECT_ID"

# ── 4. Federated credentials (OIDC) ──────────────────────────────────────────
echo "→ Configuring OIDC federated credentials..."

add_federated_credential() {
  local CRED_NAME="$1"
  local SUBJECT="$2"

  EXISTING=$(az ad app federated-credential list \
    --id "$APP_ID" \
    --query "[?name=='${CRED_NAME}'].name" -o tsv 2>/dev/null || true)

  if [[ -n "$EXISTING" ]]; then
    echo "  Credential '${CRED_NAME}' already exists, skipping."
  else
    az ad app federated-credential create \
      --id "$APP_ID" \
      --parameters "{
        \"name\": \"${CRED_NAME}\",
        \"issuer\": \"https://token.actions.githubusercontent.com\",
        \"subject\": \"${SUBJECT}\",
        \"description\": \"GitHub Actions — ${CRED_NAME}\",
        \"audiences\": [\"api://AzureADTokenExchange\"]
      }" \
      --output none
    echo "  Created credential '${CRED_NAME}'  subject=${SUBJECT}"
  fi
}

# Jobs that use 'environment: prod' in the workflow
add_federated_credential \
  "github-env-prod" \
  "repo:${GITHUB_ORG}/${GITHUB_REPO}:environment:prod"

# Push to main without an environment (fallback / infrastructure workflows)
add_federated_credential \
  "github-main" \
  "repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/main"

# Pull requests (terraform-plan triggers on PRs)
add_federated_credential \
  "github-pr" \
  "repo:${GITHUB_ORG}/${GITHUB_REPO}:pull_request"

# ── 5. Role assignments ───────────────────────────────────────────────────────
echo "→ Assigning roles on subscription scope..."

SCOPE="/subscriptions/${SUBSCRIPTION_ID}"

assign_role() {
  local ROLE="$1"
  EXISTING=$(az role assignment list \
    --assignee "$SP_OBJECT_ID" \
    --role "$ROLE" \
    --scope "$SCOPE" \
    --query "[0].id" -o tsv 2>/dev/null || true)
  if [[ -n "$EXISTING" ]]; then
    echo "  Role '${ROLE}' already assigned, skipping."
  else
    az role assignment create \
      --assignee-object-id "$SP_OBJECT_ID" \
      --assignee-principal-type ServicePrincipal \
      --role "$ROLE" \
      --scope "$SCOPE" \
      --output none
    echo "  Assigned role '${ROLE}'"
  fi
}

assign_role "Contributor"
assign_role "Key Vault Administrator"

# Needed to read/write tfstate blob
assign_role "Storage Blob Data Contributor"

# ── 6. Output GitHub secrets ──────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║  Add these as GitHub repository secrets (Settings → Secrets → Actions)"
echo "╠══════════════════════════════════════════════════════════════════════╣"
printf "║  %-28s  %s\n" "AZURE_CLIENT_ID"       "$APP_ID"
printf "║  %-28s  %s\n" "AZURE_TENANT_ID"       "$TENANT_ID"
printf "║  %-28s  %s\n" "AZURE_SUBSCRIPTION_ID" "$SUBSCRIPTION_ID"
echo "╠══════════════════════════════════════════════════════════════════════╣"
echo "║  Also add these secrets (values come from your own config):          "
echo "║    DB_ADMIN_PASSWORD       — strong password for PostgreSQL          "
echo "║    NEXT_PUBLIC_API_URL     — https://apex-prod-api.<fqdn>            "
echo "║    NEXTAUTH_URL            — https://<your-swa-domain>               "
echo "║    NEXTAUTH_SECRET         — random 32+ char secret                  "
echo "║    AZURE_AD_CLIENT_ID      — app reg for NextAuth                    "
echo "║    AZURE_AD_CLIENT_SECRET  — client secret for NextAuth              "
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Bootstrap complete."

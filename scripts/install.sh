#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/NSJLUCAS/emby-request-ui.git}"
APP_DIR="${APP_DIR:-$HOME/emby-request-ui}"

APP_PORT="${APP_PORT:-5900}"
POSTGRES_DB="${POSTGRES_DB:-emby_request}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
ADMIN_SESSION_SECRET="${ADMIN_SESSION_SECRET:-}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
TELEGRAM_CONFIG_SECRET="${TELEGRAM_CONFIG_SECRET:-}"

if [[ -z "${POSTGRES_PASSWORD}" ]]; then
  POSTGRES_PASSWORD="$(openssl rand -hex 16 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)"
fi

if [[ -z "${ADMIN_SESSION_SECRET}" ]]; then
  ADMIN_SESSION_SECRET="$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 64)"
fi

if [[ -z "${TELEGRAM_CONFIG_SECRET}" ]]; then
  TELEGRAM_CONFIG_SECRET="$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 64)"
fi

if command -v sudo >/dev/null 2>&1 && [[ "$(id -u)" -ne 0 ]]; then
  SUDO="sudo"
else
  SUDO=""
fi

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This installer currently supports Ubuntu/Debian only."
  exit 1
fi

echo "==> Installing base packages..."
$SUDO apt-get update -y
$SUDO apt-get install -y ca-certificates curl git gnupg

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker..."
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  $SUDO sh /tmp/get-docker.sh
fi

echo "==> Starting Docker service..."
$SUDO systemctl enable docker
$SUDO systemctl start docker

if docker info >/dev/null 2>&1; then
  DOCKER=(docker)
else
  DOCKER=($SUDO docker)
fi

if [[ -d "${APP_DIR}/.git" ]]; then
  echo "==> Project exists, pulling latest code..."
  git -C "${APP_DIR}" pull --ff-only origin main
else
  echo "==> Cloning project..."
  git clone "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"

if [[ ! -f ".env" ]]; then
  touch .env
fi

ensure_env_var() {
  local key="$1"
  local value="$2"
  local file="$3"

  if ! grep -q "^${key}=" "${file}"; then
    echo "${key}=${value}" >> "${file}"
  fi
}

echo "==> Preparing .env..."
ensure_env_var "APP_PORT" "${APP_PORT}" ".env"
ensure_env_var "POSTGRES_DB" "${POSTGRES_DB}" ".env"
ensure_env_var "POSTGRES_USER" "${POSTGRES_USER}" ".env"
ensure_env_var "POSTGRES_PASSWORD" "${POSTGRES_PASSWORD}" ".env"
ensure_env_var "ADMIN_SESSION_SECRET" "${ADMIN_SESSION_SECRET}" ".env"
ensure_env_var "TELEGRAM_BOT_TOKEN" "${TELEGRAM_BOT_TOKEN}" ".env"
ensure_env_var "TELEGRAM_CHAT_ID" "${TELEGRAM_CHAT_ID}" ".env"
ensure_env_var "TELEGRAM_CONFIG_SECRET" "${TELEGRAM_CONFIG_SECRET}" ".env"

echo "==> Starting services with Docker Compose..."
"${DOCKER[@]}" compose up -d --build

HOST_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
if [[ -z "${HOST_IP}" ]]; then
  HOST_IP="<YOUR_SERVER_IP>"
fi

echo ""
echo "Install complete."
echo "Open: http://${HOST_IP}:${APP_PORT}"
echo "Admin login: /admin/login"
echo "Default admin account: amdin / admin"
echo ""
echo "Tip: edit .env to change APP_PORT or Telegram settings, then run:"
echo "  ${DOCKER[*]} compose up -d --build"

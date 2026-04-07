#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/emby-request-ui}"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  echo "Project directory not found: ${APP_DIR}"
  echo "Run install first."
  exit 1
fi

if command -v sudo >/dev/null 2>&1 && [[ "$(id -u)" -ne 0 ]]; then
  SUDO="sudo"
else
  SUDO=""
fi

if docker info >/dev/null 2>&1; then
  DOCKER=(docker)
else
  DOCKER=($SUDO docker)
fi

cd "${APP_DIR}"

echo "==> Pulling latest code..."
git pull --ff-only origin main

echo "==> Rebuilding and restarting..."
"${DOCKER[@]}" compose up -d --build

echo "==> Recent app logs:"
"${DOCKER[@]}" compose logs --tail=80 app

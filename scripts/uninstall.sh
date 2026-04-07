#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/emby-request-ui}"
PURGE_DATA="${PURGE_DATA:-1}"
FORCE="${FORCE:-0}"

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

echo "Target project directory: ${APP_DIR}"
if [[ "${PURGE_DATA}" == "1" ]]; then
  echo "Mode: FULL uninstall (containers + volumes + project files)"
else
  echo "Mode: SOFT uninstall (containers + project files, keep volumes)"
fi

if [[ "${FORCE}" != "1" ]]; then
  echo ""
  echo "WARNING: This action may permanently delete database data."
  read -r -p "Type YES to continue: " CONFIRM
  if [[ "${CONFIRM}" != "YES" ]]; then
    echo "Cancelled."
    exit 0
  fi
fi

if [[ -f "${APP_DIR}/docker-compose.yml" ]]; then
  cd "${APP_DIR}"
  if [[ "${PURGE_DATA}" == "1" ]]; then
    "${DOCKER[@]}" compose down -v --remove-orphans || true
  else
    "${DOCKER[@]}" compose down --remove-orphans || true
  fi
fi

if [[ -d "${APP_DIR}" ]]; then
  $SUDO rm -rf "${APP_DIR}"
fi

echo "Uninstall complete."

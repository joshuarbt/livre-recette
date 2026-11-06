#!/usr/bin/env bash
# Durable environment setup for app-cuisine (runs once, baked into the build snapshot).
# Installs Docker, fuse-overlayfs, the Supabase CLI, and project dependencies.
set -euo pipefail

SUPABASE_CLI_VERSION="2.116.0"

echo "==> Installing system packages (docker, fuse-overlayfs)"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
# docker.io provides the daemon + CLI; fuse-overlayfs lets Docker run nested (no privileged mknod).
# --force-confold keeps existing conffiles so fuse3's /etc/fuse.conf prompt can't block the install.
sudo apt-get install -y -qq \
  -o Dpkg::Options::="--force-confold" \
  -o Dpkg::Options::="--force-confdef" \
  docker.io fuse-overlayfs curl ca-certificates

echo "==> Installing Supabase CLI ${SUPABASE_CLI_VERSION}"
if ! command -v supabase >/dev/null 2>&1; then
  ARCH="$(dpkg --print-architecture)"
  TMP_DEB="$(mktemp --suffix=.deb)"
  curl -fsSL -o "${TMP_DEB}" \
    "https://github.com/supabase/cli/releases/download/v${SUPABASE_CLI_VERSION}/supabase_${SUPABASE_CLI_VERSION}_linux_${ARCH}.deb"
  sudo dpkg -i "${TMP_DEB}"
  rm -f "${TMP_DEB}"
fi
supabase --version

echo "==> Installing Node dependencies"
cd "$(dirname "$0")/.."
npm ci

echo "==> install.sh complete"

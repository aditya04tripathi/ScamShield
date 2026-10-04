#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
[[ $EUID -eq 0 ]] || { echo 'Run this script as root on the VPS.' >&2; exit 1; }
for tool in docker ss flock curl; do command -v "$tool" >/dev/null; done
[[ -f .env ]] || { echo 'Copy .env.example to .env and configure JWT_SECRET_KEY.' >&2; exit 1; }
# Check interpolation before changing the port registry or starting containers.
docker compose config --quiet
secret=$(sed -n 's/^JWT_SECRET_KEY=//p' .env)
[[ ${#secret} -ge 32 && "$secret" != change-me* ]] || { echo 'Set a random JWT_SECRET_KEY of at least 32 characters.' >&2; exit 1; }
chmod 600 .env
exec 9>/root/ports.csv.lock
flock 9
touch /root/ports.csv
appname=scamshield
port=$(awk -F, -v app="$appname" '$1==app { print $2 }' /root/ports.csv)
if [[ -z "$port" ]]; then
  for ((port=3000; port<=65535; port++)); do
    if ! awk -F, -v port="$port" '$2==port { found=1 } END { exit !found }' /root/ports.csv && \
       [[ -z $(ss -H -lntu "sport = :$port") ]]; then
      printf '%s,%s\n' "$appname" "$port" >> /root/ports.csv
      break
    fi
  done
fi
[[ "$port" =~ ^[0-9]+$ && $port -ge 3000 && $port -le 65535 ]] || { echo 'Invalid port registry assignment.' >&2; exit 1; }
if grep -q '^APP_PORT=' .env; then
  sed -i "s/^APP_PORT=.*/APP_PORT=$port/" .env
else
  printf '\nAPP_PORT=%s\n' "$port" >> .env
fi
flock -u 9
# Only run pre-built images: no server-side builds, and no database volume pruning.
docker compose pull
docker compose up -d --wait --wait-timeout 300
if command -v firewall-cmd >/dev/null && firewall-cmd --state >/dev/null 2>&1; then
  firewall-cmd --permanent --add-port="$port/tcp"
  firewall-cmd --add-port="$port/tcp"
fi
curl --fail --silent --show-error "http://127.0.0.1:$port/" -o /dev/null
docker image prune -f
printf 'ScamShield is healthy on port %s. Point the Cloudflare tunnel at http://127.0.0.1:%s\n' "$port" "$port"

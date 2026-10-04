# Fedora VPS deployment

ScamShield runs pre-built Next.js and CPU inference images with MongoDB. Ollama runs as a native systemd service on the host. Classifier weights are fetched into the backend image in GitHub Actions; the server does not build the application. MongoDB and the backend SQLite database use persistent named volumes. Container logs rotate at 10 MB × 3 files per service.

## Publish images

Push to `main` or `dev` to publish native AMD64 images. The Docker Build & Publish workflow can optionally build ARM64 on `ubuntu-24.04-arm` and merge the native images. No QEMU is used. Image names are `ghcr.io/aditya04tripathi/scamshield-frontend` and `ghcr.io/aditya04tripathi/scamshield-backend`. Tags include the full commit SHA, branch name, and `latest` on main. Deploy using the full commit SHA to keep both services on the same revision.

## Native Ollama

Install Ollama using its official Linux installer and enable its systemd service. On Fedora's i3-5005U / 16 GB host, use `granite3.1-moe:3b` (Q4_K_M, approximately 2 GB). CPU inference is appropriate for this machine's older GPUs. Limit context to 4096, loaded models to one, and parallel requests to one. Bind Ollama to the Docker host bridge IP rather than the LAN; do not open port 11434 in the external firewall. Set `OLLAMA_BASE_URL=http://host.docker.internal:11434` in the deployment environment. The daemon must start after Docker creates its bridge.

```bash
ollama pull granite3.1-moe:3b
```

## Start ScamShield

Copy `docker-compose.yml`, `deploy.sh`, and `.env.example` to `/root/scamshield`. Copy `.env.example` to `.env`, generate a JWT secret using `openssl rand -hex 32`, and set `IMAGE_TAG` to the published commit SHA. For private GHCR images, authenticate Docker with a token that can read those packages. Never commit `.env` or registry credentials.

```bash
cd /root/scamshield
chmod 600 .env
./deploy.sh
```

The script reserves the next unused port in `/root/ports.csv` (reusing an existing ScamShield assignment), pulls images, waits for service health, opens only the frontend TCP port in firewalld, and removes dangling images. It does not install or modify Nginx. Backend, MongoDB, and Ollama are not published to the LAN.

Point the existing Cloudflare tunnel for `shield.adityatripathi.dev` directly to `http://127.0.0.1:<allocated-port>`. `APP_BIND_ADDRESS` defaults to `0.0.0.0` for LAN access; set it to `127.0.0.1` if only the local tunnel should access the app.

## Operations

```bash
docker compose ps
docker compose logs --tail 100
journalctl -u ollama --since '10 minutes ago'
df -h /
```

To roll back, set `IMAGE_TAG` to a previous full SHA and rerun `deploy.sh`. Back up MongoDB and the backend database volumes before schema changes. Never prune volumes to free image storage. Inference startup can take a few minutes while classifiers load. A healthy API confirms successful model initialization but does not validate scan quality; perform a scan after deployment.

# Migración a VPS con Docker Compose

## Abyssal ERP — De Vercel + Render a VPS propia

---

## 1. Arquitectura objetivo

```
                    ┌──────────────┐
                    │   Caddy      │  Proxy reverso + SSL (Let's Encrypt)
                    │  :443 / :80  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Frontend │ │   API    │ │    DB    │
        │ Next.js  │ │ FastAPI  │ │PostgreSQL│
        │ :3000    │ │ :8000    │ │ :5432    │
        └──────────┘ └──────────┘ └──────────┘
              │            │
              └──── API ───┘
           (desde el navegador)
```

| Componente | Puerto interno | Puerto expuesto |
|---|---|---|
| `caddy` | 80, 443 | 80, 443 |
| `frontend` | 3000 | ❌ (solo interno) |
| `api` | 8000 | ❌ (solo interno) |
| `db` | 5432 | ❌ (solo interno) |

---

## 2. Archivos a crear

### 2.1 `Dockerfile` (raíz del proyecto) — Frontend Next.js

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/next.config.mjs ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

**Multi-stage build:** La primera etapa compila, la segunda solo tiene los artefactos (imagen más pequeña).

---

### 2.2 `docker-compose.yml` (raíz del proyecto)

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${PG_USER:-abyssal}
      POSTGRES_PASSWORD: ${PG_PASSWORD}
      POSTGRES_DB: ${PG_DB:-abyssal_erp}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PG_USER:-abyssal}"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: ./backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql+asyncpg://${PG_USER:-abyssal}:${PG_PASSWORD}@db:5432/${PG_DB:-abyssal_erp}
      SECRET_KEY: ${SECRET_KEY}
      CORS_ORIGINS: https://${DOMAIN}
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: .
      args:
        NEXT_PUBLIC_API_URL: https://${DOMAIN}/api/v1
    restart: unless-stopped
    depends_on:
      - api

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - frontend
      - api

volumes:
  pgdata:
  caddy_data:
  caddy_config:
```

---

### 2.3 `Caddyfile` (raíz del proyecto)

```
tudominio.com {
    log {
        output file /data/logs/access.log
    }

    @api {
        path /api/*
    }

    handle @api {
        reverse_proxy api:8000
    }

    handle {
        reverse_proxy frontend:3000
    }
}
```

Caddy maneja SSL automáticamente con Let's Encrypt. Reemplazar `tudominio.com` con el dominio real antes de desplegar.

---

### 2.4 `.env` (raíz del proyecto)

```bash
# Seguridad
SECRET_KEY=<generar con: openssl rand -hex 32>

# Base de datos
PG_USER=abyssal
PG_PASSWORD=<contraseña_segura>
PG_DB=abyssal_erp

# Dominio
DOMAIN=tu-dominio.com
```

**Generar secrets en el VPS:**
```bash
openssl rand -hex 32   # SECRET_KEY
openssl rand -hex 16   # PG_PASSWORD
```

---

## 3. Backend — Ajustes necesarios

### 3.1 `backend/app/config.py`

Cambiar el default de `cors_origins` para que no incluya la URL de Vercel:

```python
# Antes (línea 9):
cors_origins: str = "http://localhost:3000,https://pescaderia-app.vercel.app"

# Después:
cors_origins: str = "http://localhost:3000"
```

---

## 4. Pasos en el VPS

### 4.1 Requisitos mínimos

| Recurso | Mínimo | Recomendado |
|---|---|---|
| RAM | 2 GB | 4 GB |
| CPU | 2 cores | 2 cores |
| Disco | 20 GB SSD | 30 GB SSD |
| SO | Ubuntu 22.04+ | Ubuntu 24.04 |
| Docker | 24+ | 27+ |
| Docker Compose | v2 | v2 |

### 4.2 Instalación paso a paso

```bash
# 1. Conectarse al VPS
ssh root@tu-vps-ip

# 2. Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar

# 3. Clonar el repositorio
git clone https://github.com/champagnejesus/pescaderia_app.git
cd pescaderia_app

# 4. Crear archivos de Docker (los del plan)
# Copiar Dockerfile, docker-compose.yml, Caddyfile al directorio raíz

# 5. Configurar variables de entorno
cp .env.example .env
nano .env
# Completar: SECRET_KEY, PG_PASSWORD, DOMAIN

# 6. Configurar DNS
# Crear registro A: tudominio.com -> IP del VPS

# 7. Levantar servicios
docker compose up -d

# 8. Ejecutar migraciones de base de datos
docker compose exec api alembic upgrade head

# 9. (Opcional) Poblar datos de prueba
docker compose exec api python seed_db.py

# 10. Verificar
docker compose logs -f
```

---

## 5. Comandos útiles

| Acción | Comando |
|---|---|
| Iniciar todo | `docker compose up -d` |
| Detener todo | `docker compose down` |
| Ver logs en vivo | `docker compose logs -f` |
| Reconstruir y reiniciar | `docker compose up -d --build` |
| Actualizar código | `git pull && docker compose up -d --build` |
| Backup de base de datos | `docker compose exec -T db pg_dump -U abyssal abyssal_erp > backup.sql` |
| Restaurar base de datos | `docker compose exec -T db psql -U abyssal abyssal_erp < backup.sql` |
| Acceder a la DB | `docker compose exec db psql -U abyssal -d abyssal_erp` |
| Ejecutar migraciones | `docker compose exec api alembic upgrade head` |
| Ejecutar seed | `docker compose exec api python seed_db.py` |

---

## 6. Estructura final del proyecto

```
pescaderia_app/
├── .env                    # Variables de produccion (NUEVO)
├── .env.example            # Template de variables (NUEVO)
├── .gitignore
├── Dockerfile              # Frontend Next.js (NUEVO)
├── docker-compose.yml      # Orquestador completo (NUEVO)
├── Caddyfile               # Proxy reverso + SSL (NUEVO)
├── next.config.mjs
├── package.json
├── MIGRAR_A_VPS.md         # Este documento
├── src/                    # Frontend (sin cambios)
├── backend/
│   ├── Dockerfile          # Ya existe
│   ├── docker-compose.yml  # Ya existe (solo para dev local)
│   ├── requirements.txt
│   └── app/
│       ├── config.py       # Ajustar CORS default
│       └── ...
└── public/
```

---

## 7. Seguridad

| Medida | Implementación |
|---|---|
| **SSL/TLS** | Caddy + Let's Encrypt automático |
| **Secret Key fuerte** | `openssl rand -hex 32` en producción |
| **Base de datos aislada** | Sin puerto expuesto, solo accesible desde la red interna de Docker |
| **API aislada** | Sin puerto expuesto, solo a través de Caddy |
| **CORS** | Restringido al dominio real |
| **Contraseña DB** | Generada con `openssl rand -hex 16` |

---

## 8. Rollback

```bash
# Volver a versión anterior del código
git checkout <commit-anterior>
docker compose up -d --build

# Restaurar backup de base de datos
docker compose exec -T db psql -U abyssal abyssal_erp < backup.sql
```

---

## 9. Resumen de archivos

| Archivo | Acción | Propósito |
|---|---|---|
| `Dockerfile` | Crear | Build + serve del frontend Next.js |
| `docker-compose.yml` | Crear | Orquestar db + api + frontend + caddy |
| `Caddyfile` | Crear | Proxy reverso con SSL automático |
| `.env.example` | Crear | Template de variables de entorno |
| `backend/app/config.py` | Modificar | Quitar URL de Vercel del CORS default |

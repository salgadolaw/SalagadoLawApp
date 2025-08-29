# syntax=docker/dockerfile:1

########## STAGE 1: Build Angular ##########
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NG_ENV=production
RUN npm run build -- --configuration ${NG_ENV}

########## STAGE 2: Nginx runtime ##########
FROM nginx:1.27-alpine AS runtime
# RUTAS RELATIVAS AL CONTEXTO (la raíz del repo), no a la ubicación del Dockerfile
COPY nginx.conf.template /etc/nginx/templates/app.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN adduser -D -H -u 10101 app \
 && chmod +x /entrypoint.sh \
 && sed -i 's/user  nginx;/user  app;/' /etc/nginx/nginx.conf

# Copia robusta del build Angular
COPY --from=build /app/dist /tmp/dist
RUN set -eux; \
  if ls -d /tmp/dist/*/browser >/dev/null 2>&1; then \
    cp -r /tmp/dist/*/browser/* /usr/share/nginx/html/; \
  elif [ -f /tmp/dist/index.html ]; then \
    cp -r /tmp/dist/* /usr/share/nginx/html/; \
  else \
    FIRST="$(find /tmp/dist -mindepth 1 -maxdepth 1 -type d | head -n 1)"; \
    cp -r "$FIRST"/* /usr/share/nginx/html/; \
  fi

ENV N8N_BASE=https://webhook.salgadoimmigrationlaw.com/webhook
ENTRYPOINT ["/entrypoint.sh"]

#!/bin/sh
set -e
envsubst '$N8N_BASE' < /etc/nginx/templates/app.conf.template > /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'

#!/usr/bin/env sh
set -eu

envsubst '${API_HOST} ${API_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
envsubst '${API_HOST} ${API_PORT}' < /etc/nginx/nginx.dist.conf.template > /etc/nginx/nginx.dist.conf

exec "$@"

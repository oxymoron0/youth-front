#!/bin/sh
# Generate env-config.js from VITE_* environment variables at container startup.
ENV_FILE=/usr/share/nginx/html/env-config.js

echo "window.__ENV__ = {" > "$ENV_FILE"
env | grep '^VITE_' | while IFS='=' read -r key value; do
  echo "  \"$key\": \"$value\"," >> "$ENV_FILE"
done
echo "};" >> "$ENV_FILE"

exec "$@"

#!/bin/sh

cat > /app/env-config.js << EOF
window.__ENV__ = {
  VITE_GOOGLE_CLIENT_ID: "${VITE_GOOGLE_CLIENT_ID}",
  VITE_CALLBACK_URI: "${VITE_CALLBACK_URI}",
  VITE_API_URL: "${VITE_API_URL}"
};
EOF

echo "Runtime env config written"
tail -f /dev/null
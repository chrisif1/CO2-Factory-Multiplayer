#!/bin/sh
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
 echo "Bitte Node.js LTS von https://nodejs.org installieren."
 exit 1
fi
exec node server.js


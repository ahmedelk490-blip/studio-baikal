#!/usr/bin/env bash
# Runs ON the Hostinger host after deploy.tgz (the standalone build) is uploaded to ~/domains/$SITE/.
# Swaps the app in, publishes static files to public_html for LiteSpeed, makes sure Passenger is set up,
# restarts. Data lives in ~/baikal-data and is never touched. Usage: bash remote.sh <site-domain>
set -e
SITE=$1; D=~/domains/$SITE; NODE=/opt/alt/alt-nodejs22/root/bin/node
export PATH=/opt/alt/alt-nodejs22/root/bin:$PATH
mkdir -p ~/baikal-data "$D/nodejs"
cd "$D"
rm -rf nodejs.new nodejs.old && mkdir nodejs.new && tar -xzf deploy.tgz -C nodejs.new && rm deploy.tgz
# sharp ships per-platform binaries; make sure the Linux one is there (the build may come from any OS)
if [ ! -d nodejs.new/node_modules/@img/sharp-linux-x64 ]; then
  V=$(node -p "require('./nodejs.new/node_modules/sharp/package.json').version" 2>/dev/null || echo 0.35.5)
  (cd nodejs.new && npm install --no-save --no-audit --no-fund --os=linux --cpu=x64 "sharp@$V" >/dev/null 2>&1 || true)
fi
mkdir -p nodejs.new/tmp
mv nodejs nodejs.old && mv nodejs.new nodejs
# static files straight from LiteSpeed (hashed build files, photos, hero frames)
mkdir -p public_html/_next && rm -rf public_html/_next/static && cp -r "$(ls -d nodejs/.next*/static | head -1)" public_html/_next/static
cp -r nodejs/public/. public_html/
rm -f public_html/default.php
# Passenger block + cache policy, written once
if ! grep -q PassengerAppRoot public_html/.htaccess 2>/dev/null; then
  cat > public_html/.htaccess <<EOF
PassengerAppRoot $D/nodejs
PassengerAppType node
PassengerNodejs $NODE
PassengerStartupFile start.js
PassengerBaseURI /
PassengerAppEnv production
PassengerRestartDir $D/nodejs/tmp
SetEnv LSNODE_CONSOLE_LOG console.log

# Pages change on every deploy: never cache HTML or RSC payloads. Hashed build files, photos and frames: a year.
<IfModule mod_headers.c>
  SetEnvIf Request_URI "^/(_next/static|projects|brand|hero-frames|models|video|fonts)/" BK_STATIC=1
  Header always set Cache-Control "no-cache, no-store, must-revalidate" env=!BK_STATIC
  Header always set Cache-Control "public, max-age=31536000, immutable" env=BK_STATIC
</IfModule>
EOF
fi
touch nodejs/tmp/restart.txt
rm -rf nodejs.old
echo SHIPPED

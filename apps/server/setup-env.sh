#!/bin/bash

# DEJA.js Server Environment Setup Script
echo "🚂 Setting up DEJA.js Server Environment..."

# Check if .env file exists
if [ -f ".env" ]; then
    echo "📝 .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file with proper configuration
cat > .env << 'EOF'
# Layout Configuration
LAYOUT_ID=betatrack

# MQTT Configuration - Using localhost
ENABLE_MQTT=true
MQTT_BROKER=mqtt://localhost
MQTT_PORT=1883

# WebSocket Configuration
ENABLE_WS=true
VITE_WS_PORT=8082
WS_ID=DEJA.js

# Firebase (for Cloud features)
ENABLE_DEJACLOUD=false
EOF

echo "✅ Environment file created successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "   • Layout ID: betatrack"
echo "   • MQTT: ENABLED on localhost:1883"
echo "   • WebSocket: ENABLED on port 8082"
echo "   • DEJA Cloud: DISABLED"
echo ""
echo "⚠️  IMPORTANT: You need a local MQTT broker running on localhost:1883"
echo "💡 To start a local MQTT broker, run: pnpm mosquitto"
echo "💡 Or install and start Mosquitto manually"
echo ""
echo "🚀 You can now start the server with: pnpm start"

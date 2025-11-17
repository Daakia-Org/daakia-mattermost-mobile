#!/bin/bash
# Setup Staging Configuration
# Usage: ./scripts/build-staging.sh
# This only updates configs and generates assets - you build manually

set -e

echo "🔧 Setting up Staging configuration..."

# Ensure staging override exists
mkdir -p assets/override
cat > assets/override/config.json << 'EOF'
{
    "DefaultServerUrl": "https://konnect-staging.daakia.ai/",
    "WebsiteURL": "https://konnect-staging.daakia.ai/",
    "ServerNoticeURL": "https://konnect-staging.daakia.ai/",
    "MobileNoticeURL": "https://konnect-staging.daakia.ai/"
}
EOF

echo "✅ Staging override config created"

# Generate assets (will merge base + override)
echo "📦 Generating assets..."
node scripts/generate-assets.js

# Verify the config was merged correctly
if grep -q "konnect-staging.daakia.ai" dist/assets/config.json; then
    echo "✅ Staging config verified in dist/assets/config.json"
    echo ""
    echo "✅ Ready! Configs are updated for Staging."
    echo "   Now you can build manually for iOS/Android."
else
    echo "❌ Error: Staging config not found in generated assets"
    exit 1
fi


#!/bin/bash
# Setup Production Configuration
# Usage: ./scripts/build-production.sh
# This only updates configs and generates assets - you build manually

set -e

echo "🔧 Setting up Production configuration..."

# Remove staging override (use base config only)
if [ -f "assets/override/config.json" ]; then
    rm -f assets/override/config.json
    echo "✅ Removed staging override (using production config)"
fi

# Generate assets (will use base only)
echo "📦 Generating assets..."
node scripts/generate-assets.js

# Verify the config is production
if grep -q "konnect.daakia.ai" dist/assets/config.json && ! grep -q "konnect-staging.daakia.ai" dist/assets/config.json; then
    echo "✅ Production config verified in dist/assets/config.json"
    echo ""
    echo "✅ Ready! Configs are updated for Production."
    echo "   Now you can build manually for iOS/Android."
else
    echo "❌ Error: Production config not found in generated assets"
    exit 1
fi


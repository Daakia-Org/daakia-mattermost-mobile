# Build Environments Guide

This project supports building for **Staging** and **Production** environments with different server URLs.

## Configuration Structure

- **`assets/base/config.json`** - Production configuration (default)
  - DefaultServerUrl: `https://konnect.daakia.ai`
  
- **`assets/override/config.json`** - Staging overrides
  - DefaultServerUrl: `https://konnect-staging.daakia.ai/`
  - This file overrides only the specified fields from base config

## How It Works

The `generate-assets.js` script merges `assets/base/` with `assets/override/`:
- If a file exists in both, JSON files are merged (override takes precedence)
- The result is placed in `dist/assets/` which is used by both iOS and Android builds

## Building for Staging

### Setup Staging Config:
```bash
./scripts/build-staging.sh
```

**What it does:**
1. Creates/updates `assets/override/config.json` with staging URLs
2. Generates assets (merges base + override) via `node scripts/generate-assets.js`
3. Verifies staging config is present
4. **You build manually** for iOS/Android after this

## Building for Production

### Setup Production Config:
```bash
./scripts/build-production.sh
```

**What it does:**
1. Removes `assets/override/config.json` (if exists)
2. Generates assets (uses base config only) via `node scripts/generate-assets.js`
3. Verifies production config is present
4. **You build manually** for iOS/Android after this

## Manual Method

If you prefer to build manually:

### Staging:
```bash
# 1. Ensure staging override exists
mkdir -p assets/override
cat > assets/override/config.json << 'EOF'
{
    "DefaultServerUrl": "https://konnect-staging.daakia.ai/",
    "WebsiteURL": "https://konnect-staging.daakia.ai/",
    "ServerNoticeURL": "https://konnect-staging.daakia.ai/",
    "MobileNoticeURL": "https://konnect-staging.daakia.ai/"
}
EOF

# 2. Generate assets
node scripts/generate-assets.js

# 3. Build
# Android:
cd android && ./gradlew bundleRelease

# iOS:
cd ios && xcodebuild -workspace Mattermost.xcworkspace -scheme Mattermost -configuration Release
```

### Production:
```bash
# 1. Remove override
rm -f assets/override/config.json

# 2. Generate assets
node scripts/generate-assets.js

# 3. Build (same as above)
```

## Verifying Configuration

After generating assets, verify the config:
```bash
# Check which environment is configured
grep "DefaultServerUrl" dist/assets/config.json

# Should show:
# - Staging: "https://konnect-staging.daakia.ai/"
# - Production: "https://konnect.daakia.ai"
```

## Important Notes

- ✅ Works for both **iOS and Android** (same config file)
- ✅ Always run `node scripts/generate-assets.js` after changing configs
- ✅ The override file only needs to contain fields you want to override
- ✅ All other config values come from `assets/base/config.json`

## Current Configuration

- **Production**: `https://konnect.daakia.ai`
- **Staging**: `https://konnect-staging.daakia.ai/`


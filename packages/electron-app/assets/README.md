# PowerPak Desktop - Icon Assets

## Required Icons

This directory should contain the following icon assets for the PowerPak Desktop application:

### Application Icons

1. **icon.png** (512x512)
   - Master icon file for Linux builds
   - Used as source for generating other formats
   - Should be a high-quality PNG with transparency
   - Recommended: PowerPak logo with gradient background

2. **icon.icns** (macOS)
   - Generated from icon.png using `electron-icon-builder` or similar tool
   - Contains multiple sizes (16x16 to 512x512@2x)
   - Required for macOS DMG packaging

3. **icon.ico** (Windows)
   - Generated from icon.png using `electron-icon-builder` or similar tool
   - Contains multiple sizes (16x16, 32x32, 48x48, 256x256)
   - Required for Windows NSIS/portable packaging

### System Tray Icons

4. **tray-icon.png** (32x32)
   - Small icon for system tray
   - Should be simple, monochrome-friendly design
   - Will be resized to 16x16 in code for optimal display
   - Recommended: "P" logo or simplified PowerPak mark

5. **tray-icon@2x.png** (64x64) - Optional
   - High-DPI version for Retina displays
   - Same design as tray-icon.png, just 2x resolution

## Generating Icons

### Option 1: Using electron-icon-builder

```bash
npm install -g electron-icon-builder

# Generate all formats from master icon.png
electron-icon-builder --input=./icon.png --output=./
```

### Option 2: Manual Tools

- **macOS**: Use `iconutil` (built into macOS)
- **Windows**: Use ImageMagick or online converters
- **Linux**: Just use icon.png directly

## Placeholder Icons

For development/demo purposes, you can:

1. Create a simple colored square PNG (512x512) in any graphics tool
2. Add "PowerPak" text or "P" letter
3. Use the generation tools above to create all formats

## Icon Design Guidelines

- **Colors**: Use PowerPak brand colors (gradient from primary to accent)
- **Style**: Modern, professional, tech-forward
- **Simplicity**: Icon should be recognizable at 16x16 size
- **Transparency**: Use transparent background for app icons
- **Tray Icon**: Should work well in both light and dark system trays

## Current Status

⚠️ **Placeholder icons needed for demo**

The application is currently built but lacks icon assets. Before packaging for distribution:

1. Create or commission icon.png (master file)
2. Generate platform-specific formats (icns, ico)
3. Create tray-icon.png for system tray
4. Test icons across all platforms (macOS, Windows, Linux)

## Testing Icons

After adding icons:

```bash
# Rebuild the app
npm run build

# Test in development mode
npm run dev

# Package for distribution
npm run package
```

Check that:
- App icon appears in dock/taskbar
- Tray icon is visible and crisp
- Icons scale well at different sizes
- Transparency works correctly

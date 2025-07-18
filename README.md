# SearchIQS Cleaner - Safari Extension

A Safari extension that automatically removes unwanted dialog boxes and overlays from www.searchiqs.com for a cleaner browsing experience.

## What It Does

This extension automatically detects and removes two specific unwanted elements from the SearchIQS website:

1. **Dialog Box**: The modal dialog with classes `ui-dialog ui-corner-all ui-widget ui-widget-content ui-front ui-dialog-buttons ui-draggable ui-resizable`
2. **Overlay**: The background overlay with classes `ui-widget-overlay ui-front`

The extension works silently in the background - no user interaction required.

## Installation Instructions

### For Development/Testing

1. **Enable Developer Features in Safari**:
   - Open Safari
   - Go to **Safari > Settings > Advanced**
   - Check **"Show features for web developers"**

2. **Allow Unsigned Extensions**:
   - Go to **Safari > Settings > Developer** 
   - Check **"Allow unsigned extensions"**

3. **Build the Extension**:
   - Open `IQSer.xcodeproj` in Xcode
   - Select the **macOS (App)** scheme
   - Press **Cmd+R** to build and run
   - The app will launch briefly (you can close it immediately)

4. **Enable in Safari**:
   - Open Safari
   - Go to **Safari > Settings > Extensions**
   - Find **"SearchIQS Cleaner"** and turn it ON
   - When prompted, allow it to access www.searchiqs.com

### For Distribution (App Store)

To distribute this extension publicly:

1. **Prepare for App Store**:
   - Join the Apple Developer Program ($99/year)
   - Configure signing certificates in Xcode
   - Update version numbers as needed

2. **Archive and Upload**:
   - In Xcode: **Product > Archive**
   - Use **Organizer** to validate and upload to App Store Connect
   - Complete app metadata and submit for review

## How to Use

1. Navigate to https://www.searchiqs.com in Safari
2. The extension automatically detects and removes unwanted dialogs/overlays
3. Check the browser console (Developer Tools) to see removal logs if needed

## Troubleshooting

### Extension Not Working
- Verify the extension is enabled in Safari Settings > Extensions
- Make sure you're on www.searchiqs.com (not just searchiqs.com)
- Check that you've allowed the extension to access the website

### No Elements Being Removed
- Open Web Inspector (right-click > Inspect Element)
- Go to Console tab and look for "SearchIQS Cleaner" messages
- The extension only removes elements if they exist on the page

### Development Issues
- Make sure "Allow unsigned extensions" is enabled in Safari Developer settings
- Rebuild the project in Xcode if you make changes
- Clear Safari cache if changes aren't appearing

## Technical Details

- **Manifest Version**: 3 (latest Safari Web Extensions standard)
- **Permissions**: `activeTab` (minimal permissions for security)
- **Target Domain**: `*://www.searchiqs.com/*`
- **Content Script Timing**: `document_end` with MutationObserver for dynamic content

## File Structure

```
Shared (Extension)/Resources/
├── manifest.json          # Extension configuration
├── content.js             # Main functionality (DOM manipulation)
├── background.js          # Minimal background script
├── _locales/en/messages.json  # Localization
└── images/                # Extension icons
```

## Development Notes

- The extension uses CSS selectors to target specific elements
- MutationObserver watches for dynamically loaded content
- Console logging helps with debugging
- Works entirely through content scripts (no complex background processes)

## Privacy

This extension:
- ✅ Only accesses www.searchiqs.com
- ✅ Only removes specified DOM elements
- ✅ Does not collect or transmit any user data
- ✅ Does not track browsing behavior
- ✅ Uses minimal permissions (`activeTab` only) 
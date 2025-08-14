# SearchIQS Cleaner - Safari Extension

A Safari extension that automatically removes unwanted dialog boxes and overlays from www.searchiqs.com for a cleaner browsing experience, restores normal right-click functionality, and enables disabled form fields.

## What It Does

This extension automatically detects and removes unwanted elements from the SearchIQS website:

1. **Dialog Box**: The modal dialog with classes `ui-dialog ui-corner-all ui-widget ui-widget-content ui-front ui-dialog-buttons ui-draggable ui-resizable`
2. **Overlay**: The background overlay with classes `ui-widget-overlay ui-front`
3. **Right-Click Blocking**: Disables the annoying "Action not allowed on this page" popup and restores normal browser context menu functionality
4. **Party2Name Input Field**: Enables the "Party2Name" input field by removing the `disabled` attribute and `aspNetDisabled` class

The extension works silently in the background - no user interaction required.

## Features

### ✅ DOM Element Removal
- Automatically removes unwanted dialog boxes and overlays
- Uses MutationObserver to catch dynamically loaded elements
- Works immediately on page load and for content loaded later

### ✅ Right-Click Restoration
- Prevents "Action not allowed on this page" popup
- Restores normal browser context menu (copy, paste, inspect element, etc.)
- Handles multiple blocking methods (contextmenu, mousedown, mouseup events)
- Re-enables text selection that may have been disabled

### ✅ Form Field Enhancement
- Automatically enables the Party2Name input field (`ContentPlaceHolder1_txtParty2Name`)
- Removes `disabled="disabled"` attribute to make the field editable
- Removes `aspNetDisabled` class for proper styling
- Works on page load and dynamically loaded content

## Installation Instructions

### For Development/Testing

1. **Enable Developer Features in Safari**:
   - Open Safari
   - Go to **Safari > Settings > Advanced**
   - Check **"Show features for web developers"**

2. **⚠️ CRITICAL: Allow Unsigned Extensions**:
   - Go to **Safari > Settings > Developer** 
   - ✅ Check **"Allow unsigned extensions"**
   - **🚨 Without this step, the extension will NOT appear in Safari's Extensions list!**

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
2. The extension automatically:
   - Detects and removes unwanted dialogs/overlays
   - Restores normal right-click functionality
   - Enables the Party2Name input field for editing
3. Check the browser console (Developer Tools) to see modification logs if needed

## Troubleshooting

### ⚠️ Extension Not Appearing in Safari Extensions List
**This is the #1 most common issue!**

- ✅ **MUST HAVE**: Go to **Safari > Settings > Developer** and check **"Allow unsigned extensions"**
- ✅ **MUST HAVE**: Go to **Safari > Settings > Advanced** and check **"Show features for web developers"**
- 🔄 **Restart Safari** completely (Cmd+Q, then reopen) after enabling these settings
- 🔨 **Rebuild** the project in Xcode if you made changes
- ⚙️ Check that the extension is registered: `pluginkit -m | grep IQSer` should show `Tablemate.IQSer.Extension(1.0)`

### Extension Not Working
- Verify the extension is enabled in Safari Settings > Extensions
- Make sure you're on www.searchiqs.com (not just searchiqs.com)
- Check that you've allowed the extension to access the website

### No Elements Being Removed
- Open Web Inspector (right-click > Inspect Element)
- Go to Console tab and look for "SearchIQS Cleaner" messages
- The extension only removes elements if they exist on the page

### Right-Click Still Not Working
- Try refreshing the page after enabling the extension
- Check the console for "SearchIQS Cleaner: Restored right-click functionality" messages
- Some pages may have multiple layers of protection that require a page refresh

### Development Issues
- Make sure "Allow unsigned extensions" is enabled in Safari Developer settings
- Rebuild the project in Xcode if you make changes
- Clear Safari cache if changes aren't appearing
- Try `pluginkit -r` to reset the plugin registry if extensions aren't registering

## Technical Details

- **Manifest Version**: 3 (latest Safari Web Extensions standard)
- **Permissions**: `activeTab` (minimal permissions for security)
- **Target Domain**: `*://www.searchiqs.com/*`
- **Content Script Timing**: `document_end` with MutationObserver for dynamic content
- **Right-Click Protection**: Event capture phase interception with `stopImmediatePropagation()`

## File Structure

```
Shared (Extension)/Resources/
├── manifest.json          # Extension configuration
├── content.js             # Main functionality (DOM manipulation + right-click restoration)
├── background.js          # Minimal background script
├── _locales/en/messages.json  # Localization
└── images/                # Extension icons
```

## Development Notes

- The extension uses CSS selectors and element IDs to target specific elements
- MutationObserver watches for dynamically loaded content
- Right-click restoration uses event capture phase to intercept before page handlers
- Form field modification removes disabled attributes and unwanted CSS classes
- Console logging helps with debugging
- Works entirely through content scripts (no complex background processes)

## Privacy

This extension:
- ✅ Only accesses www.searchiqs.com
- ✅ Only removes specified DOM elements and restores browser functionality
- ✅ Does not collect or transmit any user data
- ✅ Does not track browsing behavior
- ✅ Uses minimal permissions (`activeTab` only) 
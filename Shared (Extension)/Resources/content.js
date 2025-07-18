// SearchIQS Cleaner - Content Script
// Removes unwanted dialog boxes and overlays from www.searchiqs.com
// Also restores normal right-click functionality

console.log('SearchIQS Cleaner: Content script loaded');

// Function to remove unwanted elements
function removeUnwantedElements() {
    let removedCount = 0;

    // Target 1: Dialog box with specific classes
    const dialogSelector = 'div[role="dialog"].ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-dialog-buttons.ui-draggable.ui-resizable';
    const dialogs = document.querySelectorAll(dialogSelector);

    dialogs.forEach(dialog => {
        console.log('SearchIQS Cleaner: Removing dialog element', dialog);
        dialog.remove();
        removedCount++;
    });

    // Target 2: Widget overlay
    const overlaySelector = 'div.ui-widget-overlay.ui-front';
    const overlays = document.querySelectorAll(overlaySelector);

    overlays.forEach(overlay => {
        console.log('SearchIQS Cleaner: Removing overlay element', overlay);
        overlay.remove();
        removedCount++;
    });

    if (removedCount > 0) {
        console.log(`SearchIQS Cleaner: Successfully removed ${removedCount} unwanted elements`);
    }

    return removedCount;
}

// Function to restore normal right-click behavior
function enableRightClick() {
    // Remove any existing contextmenu event listeners by cloning elements
    // This is a more aggressive approach that removes all existing handlers

    // Method 1: Prevent the custom context menu event from firing
    document.addEventListener('contextmenu', function (e) {
        // Stop the event from being handled by the page's JavaScript
        e.stopImmediatePropagation();
        // Allow the default browser context menu
        // Don't preventDefault() - we want the normal menu
        console.log('SearchIQS Cleaner: Restored right-click functionality');
    }, true); // Use capture phase to intercept before page handlers

    // Method 2: Also handle any attempts to disable right-click via other events
    ['mousedown', 'mouseup', 'selectstart'].forEach(eventType => {
        document.addEventListener(eventType, function (e) {
            if (e.button === 2) { // Right mouse button
                e.stopImmediatePropagation();
                console.log(`SearchIQS Cleaner: Prevented ${eventType} interference with right-click`);
            }
        }, true);
    });

    // Method 3: Remove common CSS that disables text selection (which can affect right-click)
    const style = document.createElement('style');
    style.textContent = `
        * {
            -webkit-user-select: auto !important;
            -moz-user-select: auto !important;
            -ms-user-select: auto !important;
            user-select: auto !important;
        }
    `;
    document.head.appendChild(style);

    console.log('SearchIQS Cleaner: Right-click protection enabled');
}

// Function to check for and remove elements immediately
function initialCleanup() {
    console.log('SearchIQS Cleaner: Performing initial cleanup');
    removeUnwantedElements();
    enableRightClick();
}

// Function to set up MutationObserver for dynamically added elements
function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;

        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any added nodes are elements (not text nodes)
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        shouldCheck = true;
                        break;
                    }
                }
            }
        });

        if (shouldCheck) {
            console.log('SearchIQS Cleaner: DOM mutation detected, checking for unwanted elements');
            removeUnwantedElements();
        }
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('SearchIQS Cleaner: MutationObserver set up successfully');
}

// Main execution
function init() {
    console.log('SearchIQS Cleaner: Initializing on', window.location.href);

    // Perform initial cleanup
    initialCleanup();

    // Set up observer for dynamic content
    setupMutationObserver();

    // Also run cleanup after a short delay in case elements load asynchronously
    setTimeout(() => {
        console.log('SearchIQS Cleaner: Running delayed cleanup check');
        removeUnwantedElements();
    }, 1000);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

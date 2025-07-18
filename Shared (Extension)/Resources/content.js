// SearchIQS Cleaner - Content Script
// Removes unwanted dialog boxes and overlays from www.searchiqs.com

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

// Function to check for and remove elements immediately
function initialCleanup() {
    console.log('SearchIQS Cleaner: Performing initial cleanup');
    removeUnwantedElements();
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

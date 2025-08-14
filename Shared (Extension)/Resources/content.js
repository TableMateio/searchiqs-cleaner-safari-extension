// SearchIQS Cleaner - Content Script
// Removes unwanted dialog boxes and overlays from www.searchiqs.com
// Also restores normal right-click functionality
// Provides Airtable integration panel for tax surplus records

console.log('SearchIQS Cleaner: Content script loaded v2.0 - WITH AIRTABLE PANEL');

// ===== AIRTABLE CONFIGURATION =====
const AIRTABLE_CONFIG = {
    API_TOKEN: 'patfh1nE1aiynmwSR.fa34b0313c95f1e33b318a07be673b416d82b5bac740ffec673580bd2fd92aac',
    BASE_ID: 'appZMhZh6hDrzAnuV',
    TABLE_ID: 'tblhq8mn3e6u4Ta39',
    DEFAULT_VIEW_ID: 'viwr9ZPuSbniamu0C',
    BASE_URL: 'https://api.airtable.com/v0',
    FIELDS: [
        'Last (From Owner)',
        'First (From Owner)', 
        'Company Name',
        'SBL',
        'County',
        'City',
        'First Line Address',
        'Full Address'
    ]
};
console.log('SearchIQS Cleaner: Airtable config embedded in content script');

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

// Function to modify the Party2Name input field
function modifyParty2NameInput() {
    const inputElement = document.getElementById('ContentPlaceHolder1_txtParty2Name');

    if (inputElement) {
        let modified = false;

        // Remove the disabled attribute
        if (inputElement.hasAttribute('disabled')) {
            inputElement.removeAttribute('disabled');
            console.log('SearchIQS Cleaner: Removed disabled attribute from Party2Name input');
            modified = true;
        }

        // Remove 'aspNetDisabled' from the class attribute
        if (inputElement.classList.contains('aspNetDisabled')) {
            inputElement.classList.remove('aspNetDisabled');
            console.log('SearchIQS Cleaner: Removed aspNetDisabled class from Party2Name input');
            modified = true;
        }

        if (modified) {
            console.log('SearchIQS Cleaner: Successfully modified Party2Name input field');
        }

        return modified;
    }

    return false;
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

// Function to create the Airtable panel trigger button
function createAirtableTrigger() {
    console.log('SearchIQS Cleaner: Creating Airtable trigger button...');
    
    const trigger = document.createElement('div');
    trigger.id = 'airtable-panel-trigger';
    trigger.innerHTML = '📋';
    trigger.title = 'Open Airtable Panel';
    trigger.style.cssText = `
        position: fixed !important;
        top: 10px !important;
        left: 10px !important;
        width: 40px !important;
        height: 40px !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        z-index: 999999 !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: white !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        user-select: none !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;
    
    trigger.addEventListener('click', () => {
        alert('Airtable panel clicked! This confirms the trigger button is working. Full panel coming next...');
        console.log('SearchIQS Cleaner: Trigger button clicked successfully!');
    });
    
    trigger.addEventListener('mouseenter', () => {
        trigger.style.transform = 'translateY(-2px)';
        trigger.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
    });
    
    trigger.addEventListener('mouseleave', () => {
        trigger.style.transform = 'translateY(0)';
        trigger.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
    
    document.body.appendChild(trigger);
    console.log('SearchIQS Cleaner: ✅ Airtable trigger button created and added to page!');
}

// Function to check for and remove elements immediately
function initialCleanup() {
    console.log('SearchIQS Cleaner: Performing initial cleanup');
    removeUnwantedElements();
    modifyParty2NameInput();
    enableRightClick();
    createAirtableTrigger();
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
            modifyParty2NameInput();
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
    console.log('SearchIQS Cleaner: Initializing v2.0 WITH AIRTABLE PANEL on', window.location.href);
    console.log('SearchIQS Cleaner: 🚀 NEW VERSION - EXPECT AIRTABLE PANEL TRIGGER BUTTON!');

    // Perform initial cleanup
    initialCleanup();

    // Set up observer for dynamic content
    setupMutationObserver();

    // Also run cleanup after a short delay in case elements load asynchronously
    setTimeout(() => {
        console.log('SearchIQS Cleaner: Running delayed cleanup check');
        removeUnwantedElements();
        modifyParty2NameInput();
    }, 1000);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

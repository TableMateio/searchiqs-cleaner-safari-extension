// SearchIQS Cleaner - Content Script
// Removes unwanted dialog boxes and overlays from www.searchiqs.com
// Also restores normal right-click functionality
// Provides Airtable integration panel for tax surplus records

console.log('SearchIQS Cleaner: Content script loaded v2.5 - FIELD COPYING FIXED + AUTO-CLOSE DISABLED');

// ===== GLOBAL COPY FUNCTION (must be first) =====
function copyFieldData(event, fieldValue) {
    event.stopPropagation();

    console.log('SearchIQS Cleaner: copyFieldData called with:', fieldValue);

    navigator.clipboard.writeText(fieldValue).then(() => {
        const element = event.target;
        const originalBg = element.style.backgroundColor;
        const originalText = element.innerHTML;

        element.style.backgroundColor = '#e8f5e8';
        element.innerHTML = `${fieldValue} ✓`;

        setTimeout(() => {
            element.style.backgroundColor = originalBg;
            element.innerHTML = originalText;
        }, 1500);

        console.log('SearchIQS Cleaner: Successfully copied to clipboard:', fieldValue);

    }).catch(error => {
        console.error('SearchIQS Cleaner: Failed to copy field data:', error);
    });
}

// Make it globally accessible
window.copyFieldData = copyFieldData;
console.log('SearchIQS Cleaner: copyFieldData function defined and attached to window');

// ===== AIRTABLE CONFIGURATION =====
const AIRTABLE_CONFIG = {
    API_TOKEN: 'patfh1nE1aiynmwSR.fa34b0313c95f1e33b318a07be673b416d82b5bac740ffec673580bd2fd92aac',
    BASE_ID: 'appZMhZh6hDrzAnuV',
    TABLE_ID: 'tblhq8mn3e6u4Ta39',
    DEFAULT_VIEW_ID: 'viwr9ZPuSbniamu0C',
    BASE_URL: 'https://api.airtable.com/v0',
    FIELDS: [
        'Foreclosure',  // Use this as the record name
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
console.log('SearchIQS Cleaner: Airtable config embedded in content script v2.5');

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

// ===== AIRTABLE PANEL CLASS =====
class AirtablePanel {
    constructor() {
        this.isOpen = false;
        this.records = [];
        this.filteredRecords = [];
        this.currentView = AIRTABLE_CONFIG.DEFAULT_VIEW_ID;
        this.views = [];
        this.isLoading = false;

        this.init();
    }

    init() {
        this.createPanelHTML();
        this.attachEventListeners();
        this.loadViews();
        this.loadRecords();
    }

    createPanelHTML() {
        // Create trigger button
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
        document.body.appendChild(trigger);

        // Create side panel
        const panel = document.createElement('div');
        panel.id = 'airtable-panel';
        panel.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: -350px !important;
            width: 350px !important;
            height: 100vh !important;
            background: #ffffff !important;
            border-right: 1px solid #e1e5e9 !important;
            box-shadow: 2px 0 20px rgba(0, 0, 0, 0.08) !important;
            z-index: 999998 !important;
            transition: left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
            display: flex !important;
            flex-direction: column !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        `;

        panel.innerHTML = `
            <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-bottom: 1px solid #e1e5e9;">
                <button id="panel-close" style="position: absolute; top: 15px; right: 15px; background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
                <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 10px 0; color: white;">Tax Surplus Records</h2>
                <p style="font-size: 14px; opacity: 0.9; margin: 0;">Click any record to copy to clipboard</p>
            </div>
            
            <div style="padding: 20px; border-bottom: 1px solid #f0f0f0;">
                <div style="position: relative; margin-bottom: 15px;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; font-size: 16px;">🔍</span>
                    <input type="text" id="record-search" placeholder="Search records..." style="width: 100%; padding: 12px 16px 12px 40px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 14px; box-sizing: border-box;">
                </div>
                
                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">View:</label>
                    <select id="view-dropdown" style="width: 100%; padding: 10px 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 14px; background: white; box-sizing: border-box;">
                        <option value="${AIRTABLE_CONFIG.DEFAULT_VIEW_ID}">Focus (Default)</option>
                    </select>
                </div>
            </div>
            
            <div id="panel-content" style="flex: 1; overflow-y: auto; padding: 0;">
                <div style="padding: 40px 20px; text-align: center; color: #666;">Loading records...</div>
            </div>
        `;

        document.body.appendChild(panel);

        this.triggerEl = trigger;
        this.panelEl = panel;
        this.contentEl = panel.querySelector('#panel-content');
        this.searchEl = panel.querySelector('#record-search');
        this.viewDropdownEl = panel.querySelector('#view-dropdown');
    }

    attachEventListeners() {
        // Trigger button click
        this.triggerEl.addEventListener('click', () => this.togglePanel());

        // Hover effects for trigger
        this.triggerEl.addEventListener('mouseenter', () => {
            this.triggerEl.style.transform = 'translateY(-2px)';
            this.triggerEl.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
        });

        this.triggerEl.addEventListener('mouseleave', () => {
            this.triggerEl.style.transform = 'translateY(0)';
            this.triggerEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });

        // Close button click
        this.panelEl.querySelector('#panel-close').addEventListener('click', () => this.closePanel());

        // Search input
        this.searchEl.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // View dropdown change
        this.viewDropdownEl.addEventListener('change', (e) => this.handleViewChange(e.target.value));

        // Click outside to close (DISABLED - uncomment to re-enable)
        // document.addEventListener('click', (e) => {
        //     if (this.isOpen && 
        //         !this.panelEl.contains(e.target) && 
        //         !this.triggerEl.contains(e.target)) {
        //         this.closePanel();
        //     }
        // });
    }

    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        this.isOpen = true;
        this.panelEl.style.left = '0';
        this.triggerEl.style.display = 'none';
        console.log('SearchIQS Cleaner: Airtable panel opened');
    }

    closePanel() {
        this.isOpen = false;
        this.panelEl.style.left = '-350px';
        this.triggerEl.style.display = 'flex';
        console.log('SearchIQS Cleaner: Airtable panel closed');
    }

    async loadViews() {
        // For now, just use the default view
        console.log('SearchIQS Cleaner: Using default view configuration');
    }

    async loadRecords() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const baseUrl = `${AIRTABLE_CONFIG.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_ID}`;
            console.log('SearchIQS Cleaner: Loading records from Focus view...');

            // Build URL with view parameter to get only Focus view records
            let url = new URL(baseUrl);
            url.searchParams.append('view', this.currentView);
            url.searchParams.append('maxRecords', '100'); // Get more records from the view

            console.log('SearchIQS Cleaner: Fetching from Focus view:', url.toString());

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_CONFIG.API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('SearchIQS Cleaner: Error response:', errorText);

                // If the view ID is wrong, don't fall back to all records - show error instead
                if (response.status === 422) {
                    throw new Error(`View access failed. The Focus view (${this.currentView}) may not exist or may not be accessible. Please check the view ID in config.`);
                }

                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            this.handleSuccessfulResponse(data);

        } catch (error) {
            console.error('SearchIQS Cleaner: Error loading records:', error);
            this.showError(`Failed to load records. This might be due to field name mismatches or view access issues. Check console for details.`);
        } finally {
            this.isLoading = false;
        }
    }

    handleSuccessfulResponse(data) {
        this.records = data.records || [];
        this.filteredRecords = [...this.records];

        console.log(`SearchIQS Cleaner: Loaded ${this.records.length} records`);

        // Show available fields for debugging and future field name correction
        if (this.records.length > 0) {
            const availableFields = Object.keys(this.records[0].fields);
            console.log('SearchIQS Cleaner: Available fields:', availableFields);

            // Check which of our configured fields actually exist
            const missingFields = AIRTABLE_CONFIG.FIELDS.filter(field => !availableFields.includes(field));
            if (missingFields.length > 0) {
                console.warn('SearchIQS Cleaner: These configured fields do not exist:', missingFields);
            }
        }

        this.renderRecords();
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm) {
            this.filteredRecords = [...this.records];
        } else {
            this.filteredRecords = this.records.filter(record => {
                const fields = record.fields;
                // Search across ALL available fields, not just configured ones
                return Object.values(fields).some(value => {
                    return value && value.toString().toLowerCase().includes(searchTerm);
                });
            });
        }

        this.renderRecords();
    }

    handleViewChange(viewId) {
        if (viewId !== this.currentView) {
            this.currentView = viewId;
            this.loadRecords();
            console.log('SearchIQS Cleaner: Changed to view:', viewId);
        }
    }

    renderRecords() {
        if (this.filteredRecords.length === 0) {
            this.showEmpty();
            return;
        }

        const listHTML = this.filteredRecords.map(record => {
            const fields = record.fields;

            // Use the original fields you wanted, checking available field names from your Airtable
            const foreclosure = fields['Foreclosure'] || '';
            const lastName = fields['Last (From Owner)'] || fields['Last (from Owner)'] || '';
            const firstName = fields['First (From Owner)'] || fields['First (from Owner)'] || '';
            const company = fields['Company Name'] || fields['Company'] || '';
            const sbl = fields['SBL'] || '';
            const county = fields['County'] || '';
            const city = fields['City'] || '';
            const firstLineAddress = fields['First Line Address'] || fields['Address'] || fields['Location'] || '';
            const fullAddress = fields['Full Address'] || fields['Complete Address'] || '';

            // Create formatted name combinations you requested
            const firstLast = firstName && lastName ? `${firstName} ${lastName}` : '';
            const lastFirst = firstName && lastName ? `${lastName} ${firstName}` : '';

            // Use Foreclosure as the display name, fallback to names, then other meaningful fields
            let displayName = foreclosure;
            if (!displayName && (firstName || lastName)) {
                displayName = [firstName, lastName].filter(n => n).join(' ');
            }
            if (!displayName) displayName = firstLineAddress;
            if (!displayName) displayName = `${city} - ${sbl}`;
            if (!displayName) displayName = 'Record ' + record.id.substring(0, 8);

            return `
                <li style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0; transition: background-color 0.2s; position: relative; list-style: none;" 
                    data-record-id="${record.id}"
                    onmouseover="this.style.backgroundColor='#f8f9fb'"
                    onmouseout="this.style.backgroundColor=''">
                    <div class="copy-field" data-copy-value="${this.escapeHtml(displayName)}" style="font-size: 16px; font-weight: 600; color: #2c3e50; margin: 0 0 8px 0; cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(displayName)}</div>
                    ${company ? `<div style="font-size: 14px; color: #667eea; margin: 0 0 8px 0; font-weight: 500; cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" class="copy-field" data-copy-value="${this.escapeHtml(company)}" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(company)}</div>` : ''}
                    <div style="font-size: 13px; color: #666; line-height: 1.4;">
                        ${firstName ? `<div style="margin: 2px 0;"><strong>First:</strong> <span class="field-data copy-field" data-copy-value="${this.escapeHtml(firstName)}" style="cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(firstName)}</span></div>` : ''}
                        ${lastName ? `<div style="margin: 2px 0;"><strong>Last:</strong> <span class="field-data copy-field" data-copy-value="${this.escapeHtml(lastName)}" style="cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(lastName)}</span></div>` : ''}
                        ${firstLast ? `<div style="margin: 2px 0;"><strong>First Last:</strong> <span class="field-data copy-field" data-copy-value="${this.escapeHtml(firstLast)}" style="cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(firstLast)}</span></div>` : ''}
                        ${lastFirst ? `<div style="margin: 2px 0;"><strong>Last First:</strong> <span class="field-data copy-field" data-copy-value="${this.escapeHtml(lastFirst)}" style="cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(lastFirst)}</span></div>` : ''}
                        ${sbl ? `<div style="margin: 2px 0;"><strong>SBL:</strong> <span class="field-data copy-field" data-copy-value="${this.escapeHtml(sbl)}" style="cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(sbl)}</span></div>` : ''}
                        ${county ? `<div style="margin: 2px 0;"><strong>County:</strong> <span class="field-data copy-field" data-copy-value="${this.escapeHtml(county)}" style="cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(county)}</span></div>` : ''}
                        ${city ? `<div style="margin: 2px 0;"><strong>City:</strong> <span class="field-data copy-field" data-copy-value="${this.escapeHtml(city)}" style="cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(city)}</span></div>` : ''}
                        ${firstLineAddress ? `<div style="margin: 2px 0;"><strong>Address:</strong> <span class="field-data copy-field" data-copy-value="${this.escapeHtml(firstLineAddress)}" style="cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(firstLineAddress)}</span></div>` : ''}
                        ${fullAddress && fullAddress !== firstLineAddress ? `<div style="margin: 2px 0;"><strong>Full Address:</strong> <span class="field-data copy-field" data-copy-value="${this.escapeHtml(fullAddress)}" style="cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e3f2fd'" onmouseout="this.style.backgroundColor=''">${this.escapeHtml(fullAddress)}</span></div>` : ''}
                    </div>
                </li>
            `;
        }).join('');

        this.contentEl.innerHTML = `<ul style="padding: 0; margin: 0; list-style: none;">${listHTML}</ul>`;

        // Add event delegation for copy functionality
        this.setupCopyEventListeners();
    }

    setupCopyEventListeners() {
        // Remove existing listeners to avoid duplicates
        this.contentEl.removeEventListener('click', this.copyClickHandler);

        // Create bound handler
        this.copyClickHandler = (event) => {
            if (event.target.classList.contains('copy-field')) {
                const fieldValue = event.target.getAttribute('data-copy-value');
                if (fieldValue) {
                    this.handleFieldCopy(event, fieldValue);
                }
            }
        };

        // Add new listener
        this.contentEl.addEventListener('click', this.copyClickHandler);
    }

    handleFieldCopy(event, fieldValue) {
        event.stopPropagation();

        console.log('SearchIQS Cleaner: Copying field data:', fieldValue);

        navigator.clipboard.writeText(fieldValue).then(() => {
            const element = event.target;
            const originalBg = element.style.backgroundColor;
            const originalText = element.innerHTML;

            element.style.backgroundColor = '#e8f5e8';
            element.innerHTML = `${fieldValue} ✓`;

            setTimeout(() => {
                element.style.backgroundColor = originalBg;
                element.innerHTML = originalText;
            }, 1500);

            console.log('SearchIQS Cleaner: Successfully copied to clipboard:', fieldValue);

        }).catch(error => {
            console.error('SearchIQS Cleaner: Failed to copy field data:', error);
        });
    }

    handleRecordClick(recordElement) {
        const recordId = recordElement.dataset.recordId;
        const record = this.records.find(r => r.id === recordId);

        if (record) {
            this.copyRecordToClipboard(record, recordElement);
        }
    }



    async copyRecordToClipboard(record, element) {
        const fields = record.fields;

        // Format the record data for clipboard
        const recordText = [
            fields['Last (From Owner)'] || '',
            fields['First (From Owner)'] || '',
            fields['Company Name'] || '',
            fields['SBL'] || '',
            fields['County'] || '',
            fields['City'] || '',
            fields['First Line Address'] || '',
            fields['Full Address'] || ''
        ].filter(value => value).join(' | ');

        try {
            await navigator.clipboard.writeText(recordText);

            // Visual feedback
            element.style.backgroundColor = '#e8f5e8';
            element.innerHTML += '<span style="position: absolute; top: 50%; right: 20px; transform: translateY(-50%); color: #4caf50; font-size: 12px; font-weight: 600;">✓ Copied!</span>';

            setTimeout(() => {
                element.style.backgroundColor = '';
                const copyIndicator = element.querySelector('span[style*="Copied"]');
                if (copyIndicator) copyIndicator.remove();
            }, 2000);

            console.log('SearchIQS Cleaner: Copied record to clipboard:', recordText);

        } catch (error) {
            console.error('SearchIQS Cleaner: Failed to copy to clipboard:', error);
        }
    }

    showLoading() {
        this.contentEl.innerHTML = '<div style="padding: 40px 20px; text-align: center; color: #666;">Loading records...</div>';
    }

    showError(message) {
        this.contentEl.innerHTML = `<div style="padding: 20px; color: #e74c3c; text-align: center; font-size: 14px;">${this.escapeHtml(message)}</div>`;
    }

    showEmpty() {
        const message = this.searchEl.value.trim() ?
            'No records found matching your search.' :
            'No records available.';
        this.contentEl.innerHTML = `<div style="padding: 40px 20px; text-align: center; color: #999; font-size: 14px;">${message}</div>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}



// Function to create the Airtable panel
function createAirtablePanel() {
    console.log('SearchIQS Cleaner: Creating full Airtable panel...');
    window.airtablePanel = new AirtablePanel();
    console.log('SearchIQS Cleaner: ✅ v2.5 Airtable panel created - Field copying fixed!');
}

// Function to check for and remove elements immediately
function initialCleanup() {
    console.log('SearchIQS Cleaner: Performing initial cleanup');
    removeUnwantedElements();
    modifyParty2NameInput();
    enableRightClick();
    createAirtablePanel();
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
    console.log('SearchIQS Cleaner: Initializing v2.5 WITH FIXED FIELD COPYING on', window.location.href);
    console.log('SearchIQS Cleaner: 🚀 v2.5 - FIELD COPYING WORKS + NO AUTO-CLOSE!');

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

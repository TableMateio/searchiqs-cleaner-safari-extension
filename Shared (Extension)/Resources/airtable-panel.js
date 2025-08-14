// Airtable Panel - SearchIQS Extension
// Provides a collapsible side panel with Airtable data integration

console.log('SearchIQS Cleaner: Airtable panel script loaded');

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
        document.body.appendChild(trigger);
        
        // Create side panel
        const panel = document.createElement('div');
        panel.id = 'airtable-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <button class="panel-close" title="Close Panel">×</button>
                <h2 class="panel-title">Tax Surplus Records</h2>
                <p class="panel-subtitle">Click any record to copy to clipboard</p>
            </div>
            
            <div class="panel-controls">
                <div class="search-container">
                    <span class="search-icon">🔍</span>
                    <input type="text" class="search-input" placeholder="Search records..." id="record-search">
                </div>
                
                <div class="view-selector">
                    <label for="view-dropdown">View:</label>
                    <select class="view-dropdown" id="view-dropdown">
                        <option value="${AIRTABLE_CONFIG.DEFAULT_VIEW_ID}">Focus (Default)</option>
                    </select>
                </div>
            </div>
            
            <div class="panel-content">
                <div class="loading">Loading records...</div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        this.triggerEl = trigger;
        this.panelEl = panel;
        this.contentEl = panel.querySelector('.panel-content');
        this.searchEl = panel.querySelector('#record-search');
        this.viewDropdownEl = panel.querySelector('#view-dropdown');
    }
    
    attachEventListeners() {
        // Trigger button click
        this.triggerEl.addEventListener('click', () => this.togglePanel());
        
        // Close button click
        this.panelEl.querySelector('.panel-close').addEventListener('click', () => this.closePanel());
        
        // Search input
        this.searchEl.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // View dropdown change
        this.viewDropdownEl.addEventListener('change', (e) => this.handleViewChange(e.target.value));
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.panelEl.contains(e.target) && 
                !this.triggerEl.contains(e.target)) {
                this.closePanel();
            }
        });
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
        this.panelEl.classList.add('open');
        this.triggerEl.style.display = 'none';
        console.log('SearchIQS Cleaner: Airtable panel opened');
    }
    
    closePanel() {
        this.isOpen = false;
        this.panelEl.classList.remove('open');
        this.triggerEl.style.display = 'flex';
        console.log('SearchIQS Cleaner: Airtable panel closed');
    }
    
    async loadViews() {
        try {
            const response = await fetch(
                `${AIRTABLE_CONFIG.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_ID}/views`,
                {
                    headers: {
                        'Authorization': `Bearer ${AIRTABLE_CONFIG.API_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                this.views = data.views || [];
                this.populateViewDropdown();
                console.log('SearchIQS Cleaner: Loaded Airtable views', this.views);
            }
        } catch (error) {
            console.error('SearchIQS Cleaner: Error loading views:', error);
            // Continue with default view if views loading fails
        }
    }
    
    populateViewDropdown() {
        this.viewDropdownEl.innerHTML = '';
        
        this.views.forEach(view => {
            const option = document.createElement('option');
            option.value = view.id;
            option.textContent = view.name;
            option.selected = view.id === this.currentView;
            this.viewDropdownEl.appendChild(option);
        });
    }
    
    async loadRecords() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            const url = new URL(`${AIRTABLE_CONFIG.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_ID}`);
            url.searchParams.append('view', this.currentView);
            
            // Only request the fields we need
            AIRTABLE_CONFIG.FIELDS.forEach(field => {
                url.searchParams.append('fields[]', field);
            });
            
            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_CONFIG.API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.records = data.records || [];
            this.filteredRecords = [...this.records];
            this.renderRecords();
            
            console.log(`SearchIQS Cleaner: Loaded ${this.records.length} records from Airtable`);
            
        } catch (error) {
            console.error('SearchIQS Cleaner: Error loading records:', error);
            this.showError(`Failed to load records: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }
    
    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredRecords = [...this.records];
        } else {
            this.filteredRecords = this.records.filter(record => {
                const fields = record.fields;
                return AIRTABLE_CONFIG.FIELDS.some(fieldName => {
                    const value = fields[fieldName];
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
            const lastName = fields['Last (From Owner)'] || '';
            const firstName = fields['First (From Owner)'] || '';
            const company = fields['Company Name'] || '';
            const sbl = fields['SBL'] || '';
            const county = fields['County'] || '';
            const city = fields['City'] || '';
            const firstLineAddress = fields['First Line Address'] || '';
            const fullAddress = fields['Full Address'] || '';
            
            const displayName = [firstName, lastName].filter(n => n).join(' ') || 'Unnamed Record';
            
            return `
                <li class="record-item" data-record-id="${record.id}">
                    <div class="record-name">${this.escapeHtml(displayName)}</div>
                    ${company ? `<div class="record-company">${this.escapeHtml(company)}</div>` : ''}
                    <div class="record-details">
                        ${sbl ? `<div class="record-detail"><strong>SBL:</strong> ${this.escapeHtml(sbl)}</div>` : ''}
                        ${county ? `<div class="record-detail"><strong>County:</strong> ${this.escapeHtml(county)}</div>` : ''}
                        ${city ? `<div class="record-detail"><strong>City:</strong> ${this.escapeHtml(city)}</div>` : ''}
                        ${firstLineAddress ? `<div class="record-detail"><strong>Address:</strong> ${this.escapeHtml(firstLineAddress)}</div>` : ''}
                        ${fullAddress && fullAddress !== firstLineAddress ? `<div class="record-detail"><strong>Full Address:</strong> ${this.escapeHtml(fullAddress)}</div>` : ''}
                    </div>
                </li>
            `;
        }).join('');
        
        this.contentEl.innerHTML = `<ul class="records-list">${listHTML}</ul>`;
        
        // Attach click listeners to record items
        this.contentEl.querySelectorAll('.record-item').forEach(item => {
            item.addEventListener('click', () => this.handleRecordClick(item));
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
            element.classList.add('copied');
            setTimeout(() => {
                element.classList.remove('copied');
            }, 2000);
            
            console.log('SearchIQS Cleaner: Copied record to clipboard:', recordText);
            
        } catch (error) {
            console.error('SearchIQS Cleaner: Failed to copy to clipboard:', error);
            
            // Fallback for older browsers
            this.fallbackCopyToClipboard(recordText);
        }
    }
    
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            console.log('SearchIQS Cleaner: Copied using fallback method');
        } catch (error) {
            console.error('SearchIQS Cleaner: Fallback copy failed:', error);
        }
        
        document.body.removeChild(textArea);
    }
    
    showLoading() {
        this.contentEl.innerHTML = '<div class="loading">Loading records...</div>';
    }
    
    showError(message) {
        this.contentEl.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
    }
    
    showEmpty() {
        const message = this.searchEl.value.trim() ? 
            'No records found matching your search.' : 
            'No records available.';
        this.contentEl.innerHTML = `<div class="empty">${message}</div>`;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the panel when the script loads
let airtablePanel;

function initializeAirtablePanel() {
    if (!airtablePanel && typeof AIRTABLE_CONFIG !== 'undefined') {
        airtablePanel = new AirtablePanel();
        console.log('SearchIQS Cleaner: Airtable panel initialized');
    }
}

// Initialize immediately if config is already loaded, otherwise wait a bit
if (typeof AIRTABLE_CONFIG !== 'undefined') {
    initializeAirtablePanel();
} else {
    setTimeout(initializeAirtablePanel, 100);
}

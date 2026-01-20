// Theme Manager
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.init();
    }

    init() {
        // Check for saved theme preference or default to system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

        this.setTheme(theme, false);

        // Listen for theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light', true);
            }
        });
    }

    setTheme(theme, announce = false) {
        const icon = this.themeToggle.querySelector('span');
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            icon.textContent = '☀️';
            this.themeToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.documentElement.removeAttribute('data-theme');
            icon.textContent = '🌙';
            this.themeToggle.setAttribute('aria-pressed', 'false');
        }

        // Update charts if they exist
        this.updateChartColors(theme);

        if (announce) {
            this.announceThemeChange(theme);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme, true);
        localStorage.setItem('theme', newTheme);
    }

    announceThemeChange(theme) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Theme changed to ${theme} mode`;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    updateChartColors(theme) {
        // Update Chart.js default colors based on theme
        if (typeof Chart !== 'undefined') {
            const isDark = theme === 'dark';
            Chart.defaults.color = isDark ? '#A1A1AA' : '#52525B';
            Chart.defaults.borderColor = isDark ? '#27272A' : '#E4E4E7';

            // Update existing charts
            const charts = [
                window.scenarioChart,
                window.vestingOptionsChart,
                window.vestingValueChart,
                window.portfolioChart,
                window.exitChart
            ];

            charts.forEach(chart => {
                if (chart && chart.options && chart.options.scales) {
                    Object.keys(chart.options.scales).forEach(scaleKey => {
                        const scale = chart.options.scales[scaleKey];
                        if (scale.title) scale.title.color = isDark ? '#FAFAFA' : '#18181B';
                        if (scale.ticks) scale.ticks.color = isDark ? '#A1A1AA' : '#52525B';
                        if (scale.grid) scale.grid.color = isDark ? '#27272A' : '#E4E4E7';
                    });
                    chart.update();
                }
            });
        }
    }
}

// Data Management
class DataManager {
    constructor() {
        this.data = {
            version: 1,
            grants: [],
            scenarios: [],
            settings: {
                currentStockPrice: 50,
                taxRate: 30
            },
            lastUpdated: new Date().toISOString()
        };
        this.loadData();
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('stockOptionsData');
            if (savedData) {
                this.data = JSON.parse(savedData);
                this.updateLastSavedDisplay();
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    saveData() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            localStorage.setItem('stockOptionsData', JSON.stringify(this.data));
            this.updateLastSavedDisplay();
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    updateLastSavedDisplay() {
        const lastSavedEl = document.getElementById('last-saved');
        if (lastSavedEl && this.data.lastUpdated) {
            const date = new Date(this.data.lastUpdated);
            lastSavedEl.textContent = `Last saved: ${date.toLocaleString()}`;
        }
    }

    // Debounced save
    debouncedSave = debounce(() => this.saveData(), 500);

    getGrants() {
        return this.data.grants || [];
    }

    addGrant(grant) {
        grant.id = Date.now().toString();
        this.data.grants.push(grant);
        this.debouncedSave();
        return grant;
    }

    updateGrant(id, grant) {
        const index = this.data.grants.findIndex(g => g.id === id);
        if (index !== -1) {
            this.data.grants[index] = { ...grant, id };
            this.debouncedSave();
        }
    }

    deleteGrant(id) {
        this.data.grants = this.data.grants.filter(g => g.id !== id);
        this.debouncedSave();
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.removeItem('stockOptionsData');
            this.data = {
                version: 1,
                grants: [],
                scenarios: [],
                settings: {
                    currentStockPrice: 50,
                    taxRate: 30
                },
                lastUpdated: new Date().toISOString()
            };
            location.reload();
        }
    }
}

// Helper function: debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize data manager
let dataManager;

// Initialize when DOM is ready
let themeManager;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize managers
    themeManager = new ThemeManager();
    dataManager = new DataManager();

    // Form submission
    document.getElementById('calculator-form').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateOptions();
    });

    // Set default grant date to today
    document.getElementById('grantDate').valueAsDate = new Date();
    document.getElementById('grant-grant-date').valueAsDate = new Date();

    // Vesting form submission
    document.getElementById('vesting-form').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateVestingTimeline();
    });

    // RSU form submission
    document.getElementById('rsu-form').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateRSU();
    });

    // Grant form submission
    document.getElementById('grant-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveGrant();
    });

    // Exit scenario form submission
    document.getElementById('exit-scenario-form').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateExitScenario();
    });

    // Auto-calculate RSU on input change
    const rsuInputs = document.querySelectorAll('#rsu-tab input[type="number"]');
    rsuInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (document.getElementById('rsu-results').classList.contains('show')) {
                calculateRSU();
            }
        });
    });

    // Auto-calculate on input change
    const inputs = document.querySelectorAll('#simple-tab input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (document.getElementById('results').classList.contains('show')) {
                calculateOptions();
            }
        });
    });

    // Keyboard navigation for tabs
    document.querySelectorAll('.tab').forEach((tab, index, tabs) => {
        tab.addEventListener('keydown', (e) => {
            let newIndex;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                newIndex = (index + 1) % tabs.length;
                tabs[newIndex].focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                newIndex = (index - 1 + tabs.length) % tabs.length;
                tabs[newIndex].focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tab.click();
            }
        });
    });

    // Load portfolio if there are grants
    if (dataManager.getGrants().length > 0) {
        renderPortfolio();
    }
});

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
}

// Tab switching
function switchTab(tabName, event) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
    });

    const activeTab = event ? event.target : document.getElementById(tabName + '-tab-btn');
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
    activeTab.setAttribute('tabindex', '0');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('grant-modal');
    if (event.target == modal) {
        closeGrantModal();
    }
};


// Portfolio Management Functions
function showGrantModal(grantId = null) {
    const modal = document.getElementById('grant-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('grant-form');

    if (grantId) {
        const grant = dataManager.getGrants().find(g => g.id === grantId);
        if (grant) {
            modalTitle.textContent = 'Edit Grant';
            document.getElementById('grant-id').value = grant.id;
            document.getElementById('grant-name').value = grant.name;
            document.getElementById('grant-num-options').value = grant.numOptions;
            document.getElementById('grant-strike-price').value = grant.strikePrice;
            document.getElementById('grant-grant-date').value = grant.grantDate;
            document.getElementById('grant-vesting-period').value = grant.vestingPeriod;
            document.getElementById('grant-cliff-period').value = grant.cliffPeriod;
            document.getElementById('grant-vesting-frequency').value = grant.vestingFrequency;
        }
    } else {
        modalTitle.textContent = 'Add Grant';
        form.reset();
        document.getElementById('grant-id').value = '';
        document.getElementById('grant-grant-date').valueAsDate = new Date();
    }

    modal.classList.add('show');
}

function closeGrantModal() {
    document.getElementById('grant-modal').classList.remove('show');
    document.getElementById('grant-form').reset();
}

function saveGrant() {
    const grantId = document.getElementById('grant-id').value;
    const grant = {
        name: document.getElementById('grant-name').value,
        numOptions: parseInt(document.getElementById('grant-num-options').value),
        strikePrice: parseFloat(document.getElementById('grant-strike-price').value),
        grantDate: document.getElementById('grant-grant-date').value,
        vestingPeriod: parseFloat(document.getElementById('grant-vesting-period').value),
        cliffPeriod: parseFloat(document.getElementById('grant-cliff-period').value),
        vestingFrequency: document.getElementById('grant-vesting-frequency').value
    };

    if (grantId) {
        dataManager.updateGrant(grantId, grant);
    } else {
        dataManager.addGrant(grant);
    }

    closeGrantModal();
    renderPortfolio();
}

function deleteGrant(grantId) {
    if (confirm('Are you sure you want to delete this grant?')) {
        dataManager.deleteGrant(grantId);
        renderPortfolio();
    }
}

function calculateVestedOptions(grant) {
    const grantDate = new Date(grant.grantDate);
    const now = new Date();
    const monthsElapsed = (now.getFullYear() - grantDate.getFullYear()) * 12 + (now.getMonth() - grantDate.getMonth());
    const totalMonths = grant.vestingPeriod * 12;
    const cliffMonths = grant.cliffPeriod * 12;

    if (monthsElapsed < cliffMonths) {
        return 0;
    }

    const vestPercentage = Math.min(1, monthsElapsed / totalMonths);
    return Math.floor(grant.numOptions * vestPercentage);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderPortfolio() {
    const grants = dataManager.getGrants();
    const grantsList = document.getElementById('grants-list');

    if (grants.length === 0) {
        grantsList.innerHTML = '<p style="text-align: center; color: var(--color-text-tertiary); padding: var(--space-8);">No grants added yet. Click "+ Add Grant" to get started.</p>';
        document.getElementById('aggregate-summary').style.display = 'none';
        document.getElementById('portfolio-chart-container').style.display = 'none';
        return;
    }

    let totalOptions = 0;
    let totalVested = 0;
    let weightedStrike = 0;
    const currentPrice = parseFloat(document.getElementById('currentPrice')?.value || 50);

    grants.forEach(grant => {
        const vested = calculateVestedOptions(grant);
        totalOptions += grant.numOptions;
        totalVested += vested;
        weightedStrike += grant.strikePrice * grant.numOptions;
    });

    const avgStrike = weightedStrike / totalOptions;
    const combinedValue = totalVested * Math.max(0, currentPrice - avgStrike);

    document.getElementById('agg-total-grants').textContent = grants.length;
    document.getElementById('agg-total-options').textContent = totalOptions.toLocaleString();
    document.getElementById('agg-vested-options').textContent = totalVested.toLocaleString();
    document.getElementById('agg-avg-strike').textContent = formatCurrency(avgStrike);
    document.getElementById('agg-combined-value').textContent = formatCurrency(combinedValue);
    document.getElementById('aggregate-summary').style.display = 'block';

    grantsList.innerHTML = grants.map(grant => {
        const vested = calculateVestedOptions(grant);
        const unvested = grant.numOptions - vested;
        const vestedPercent = (vested / grant.numOptions * 100).toFixed(1);

        return '<div class="grant-card"><div class="grant-header"><span class="grant-name">' + escapeHtml(grant.name) + '</span><div class="grant-actions"><button class="icon-button" onclick="showGrantModal('' + grant.id + '')" aria-label="Edit grant">✏️</button><button class="icon-button" onclick="deleteGrant('' + grant.id + '')" aria-label="Delete grant">🗑️</button></div></div><div class="grant-details"><div class="grant-detail"><span class="grant-detail-label">Total Options</span><span class="grant-detail-value">' + grant.numOptions.toLocaleString() + '</span></div><div class="grant-detail"><span class="grant-detail-label">Strike Price</span><span class="grant-detail-value">' + formatCurrency(grant.strikePrice) + '</span></div><div class="grant-detail"><span class="grant-detail-label">Vested</span><span class="grant-detail-value">' + vested.toLocaleString() + ' (' + vestedPercent + '%)</span></div><div class="grant-detail"><span class="grant-detail-label">Unvested</span><span class="grant-detail-value">' + unvested.toLocaleString() + '</span></div><div class="grant-detail"><span class="grant-detail-label">Grant Date</span><span class="grant-detail-value">' + new Date(grant.grantDate).toLocaleDateString() + '</span></div><div class="grant-detail"><span class="grant-detail-label">Vesting</span><span class="grant-detail-value">' + grant.vestingPeriod + 'y, ' + grant.cliffPeriod + 'y cliff</span></div></div></div>';
    }).join('');

    createPortfolioChart(grants);
}

// Export function
function exportToCSV() {
    const grants = dataManager.getGrants();
    if (grants.length === 0) {
        alert('No grants to export. Please add some grants first.');
        return;
    }

    let csv = 'Grant Name,Number of Options,Strike Price,Grant Date,Vesting Period (years),Cliff Period (years),Vesting Frequency,Vested Options,Unvested Options
';

    grants.forEach(grant => {
        const vested = calculateVestedOptions(grant);
        const unvested = grant.numOptions - vested;
        csv += '"' + grant.name + '",' + grant.numOptions + ',' + grant.strikePrice + ',' + grant.grantDate + ',' + grant.vestingPeriod + ',' + grant.cliffPeriod + ',' + grant.vestingFrequency + ',' + vested + ',' + unvested + '
';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock-options-portfolio.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

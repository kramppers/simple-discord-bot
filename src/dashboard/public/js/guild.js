// Guild Dashboard JavaScript functionality
class GuildManager {
    constructor(guildId) {
        this.guildId = guildId;
        this.init();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    init() {
        console.log(`🏠 Guild Manager initialized for guild: ${this.guildId}`);
        this.loadGuildStats();
        this.setupCharts();
        this.initializeSettings();
    }

    setupEventListeners() {
        // Settings toggles
        document.querySelectorAll('.setting-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => this.handleSettingChange(e));
        });

        // Command configuration
        document.querySelectorAll('.command-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => this.handleCommandToggle(e));
        });

        // Quick action buttons
        document.querySelectorAll('.guild-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleGuildAction(e));
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-guild-stats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshGuildStats());
        }

        // Search functionality
        const searchInput = document.getElementById('member-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterMembers(e.target.value));
        }

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e));
        });
    }

    async loadGuildStats() {
        try {
            const response = await fetch(`/api/guild/${this.guildId}/stats`);
            if (!response.ok) throw new Error('Failed to fetch guild stats');
            
            const stats = await response.json();
            this.updateStatsDisplay(stats);
            this.updateCharts(stats);
        } catch (error) {
            console.error('Error loading guild stats:', error);
            this.showNotification('Eroare la încărcarea statisticilor serverului', 'error');
        }
    }

    updateStatsDisplay(stats) {
        // Update member count
        const memberCountElement = document.getElementById('member-count');
        if (memberCountElement) {
            memberCountElement.textContent = stats.memberCount.toLocaleString();
        }

        // Update channel count
        const channelCountElement = document.getElementById('channel-count');
        if (channelCountElement) {
            channelCountElement.textContent = stats.channelCount.toLocaleString();
        }

        // Update role count
        const roleCountElement = document.getElementById('role-count');
        if (roleCountElement) {
            roleCountElement.textContent = stats.roleCount.toLocaleString();
        }

        // Update emoji count
        const emojiCountElement = document.getElementById('emoji-count');
        if (emojiCountElement) {
            emojiCountElement.textContent = stats.emojiCount.toLocaleString();
        }

        // Update boost status
        if (stats.boostLevel > 0) {
            this.updateBoostDisplay(stats.boostLevel, stats.boostCount);
        }
    }

    updateBoostDisplay(level, count) {
        const boostContainer = document.getElementById('boost-container');
        if (boostContainer) {
            boostContainer.style.display = 'block';
            boostContainer.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                            <i class="fas fa-rocket text-pink-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">Server Boost</h3>
                            <p class="text-gray-600">Nivel ${level} • ${count} boost-uri</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                            <i class="fas fa-star mr-1"></i>
                            Boosted
                        </span>
                    </div>
                </div>
            `;
        }
    }

    setupCharts() {
        // Initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.createMemberActivityChart();
            this.createCommandUsageChart();
        }
    }

    createMemberActivityChart() {
        const ctx = document.getElementById('member-activity-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'],
                datasets: [{
                    label: 'Membri Activi',
                    data: [65, 78, 82, 75, 89, 95, 88],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    createCommandUsageChart() {
        const ctx = document.getElementById('command-usage-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Moderare', 'Economie', 'Muzică', 'Jocuri', 'Altele'],
                datasets: [{
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: ['#ef4444', '#f59e0b', '#ec4899', '#10b981', '#6b7280']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    updateCharts(stats) {
        // Update charts with real data if available
        // This would typically involve updating Chart.js instances
    }

    async handleSettingChange(event) {
        const setting = event.target.dataset.setting;
        const enabled = event.target.checked;
        
        try {
            const response = await fetch(`/api/guild/${this.guildId}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setting, enabled })
            });

            if (response.ok) {
                this.showNotification(`Setarea "${setting}" a fost ${enabled ? 'activată' : 'dezactivată'}`, 'success');
                this.updateSettingUI(setting, enabled);
            } else {
                throw new Error('Failed to update setting');
            }
        } catch (error) {
            console.error('Error updating setting:', error);
            this.showNotification('Eroare la actualizarea setării', 'error');
            event.target.checked = !enabled; // Revert the change
        }
    }

    async handleCommandToggle(event) {
        const command = event.target.dataset.command;
        const enabled = event.target.checked;
        
        try {
            const response = await fetch(`/api/guild/${this.guildId}/commands`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command, enabled })
            });

            if (response.ok) {
                this.showNotification(`Comanda "${command}" a fost ${enabled ? 'activată' : 'dezactivată'}`, 'success');
            } else {
                throw new Error('Failed to update command');
            }
        } catch (error) {
            console.error('Error updating command:', error);
            this.showNotification('Eroare la actualizarea comenzii', 'error');
            event.target.checked = !enabled; // Revert the change
        }
    }

    handleGuildAction(event) {
        const action = event.currentTarget.dataset.action;
        
        switch (action) {
            case 'manage-members':
                this.openMemberManagement();
                break;
            case 'manage-channels':
                this.openChannelManagement();
                break;
            case 'manage-roles':
                this.openRoleManagement();
                break;
            case 'view-logs':
                this.openLogsViewer();
                break;
            default:
                console.log('Unknown guild action:', action);
        }
    }

    openMemberManagement() {
        this.showNotification('Gestionarea membrilor va fi implementată în curând', 'info');
    }

    openChannelManagement() {
        this.showNotification('Gestionarea canalelor va fi implementată în curând', 'info');
    }

    openRoleManagement() {
        this.showNotification('Gestionarea rolurilor va fi implementată în curând', 'info');
    }

    openLogsViewer() {
        this.showNotification('Vizualizatorul de log-uri va fi implementat în curând', 'info');
    }

    switchTab(event) {
        const targetTab = event.currentTarget.dataset.tab;
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show target tab content
        const targetContent = document.getElementById(`${targetTab}-tab`);
        if (targetContent) {
            targetContent.style.display = 'block';
        }
        
        // Add active class to clicked tab button
        event.currentTarget.classList.add('active');
    }

    filterMembers(searchTerm) {
        const memberRows = document.querySelectorAll('.member-row');
        const searchTermLower = searchTerm.toLowerCase();

        memberRows.forEach(row => {
            const memberName = row.querySelector('.member-name')?.textContent?.toLowerCase() || '';
            const memberRole = row.querySelector('.member-role')?.textContent?.toLowerCase() || '';
            
            if (memberName.includes(searchTermLower) || memberRole.includes(searchTermLower)) {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    }

    async refreshGuildStats() {
        const refreshBtn = document.getElementById('refresh-guild-stats');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizare...';
            refreshBtn.disabled = true;
        }

        try {
            await this.loadGuildStats();
            this.showNotification('Statisticile serverului au fost actualizate', 'success');
        } catch (error) {
            this.showNotification('Eroare la actualizarea statisticilor', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizează';
                refreshBtn.disabled = false;
            }
        }
    }

    startRealTimeUpdates() {
        // Real-time updates every 30 seconds
        setInterval(() => {
            this.loadGuildStats();
        }, 30 * 1000);
    }

    initializeSettings() {
        // Load current settings from server
        this.loadGuildSettings();
    }

    async loadGuildSettings() {
        try {
            const response = await fetch(`/api/guild/${this.guildId}/settings`);
            if (!response.ok) throw new Error('Failed to fetch guild settings');
            
            const settings = await response.json();
            this.updateSettingsUI(settings);
        } catch (error) {
            console.error('Error loading guild settings:', error);
        }
    }

    updateSettingsUI(settings) {
        // Update all setting toggles based on server response
        Object.entries(settings).forEach(([setting, enabled]) => {
            const toggle = document.querySelector(`[data-setting="${setting}"]`);
            if (toggle) {
                toggle.checked = enabled;
            }
        });
    }

    updateSettingUI(setting, enabled) {
        // Update UI elements related to a specific setting
        const statusElement = document.querySelector(`[data-setting-status="${setting}"]`);
        if (statusElement) {
            statusElement.textContent = enabled ? 'Active' : 'Inactive';
            statusElement.className = `text-sm font-medium ${enabled ? 'text-green-500' : 'text-red-500'}`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="flex items-center p-4 rounded-lg shadow-lg">
                <i class="fas fa-${this.getNotificationIcon(type)} mr-3 text-${this.getNotificationColor(type)}"></i>
                <span class="text-gray-800">${message}</span>
                <button class="ml-auto text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
            background: white;
            border-left: 4px solid ${this.getNotificationBorderColor(type)};
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: 'green-500',
            error: 'red-500',
            warning: 'yellow-500',
            info: 'blue-500'
        };
        return colors[type] || 'blue-500';
    }

    getNotificationBorderColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }
}

// Initialize guild manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const guildId = document.querySelector('[data-guild-id]')?.dataset.guildId;
    if (guildId) {
        window.guildManager = new GuildManager(guildId);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuildManager;
}

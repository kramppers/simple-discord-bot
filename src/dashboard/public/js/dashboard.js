// Dashboard JavaScript functionality
class DashboardManager {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    init() {
        console.log('🚀 Dashboard Manager initialized');
        this.loadGuildStats();
        this.updateSystemHealth();
        this.setupTooltips();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('guild-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterGuilds(e.target.value));
        }

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e));
        });

        // Settings toggles
        document.querySelectorAll('.setting-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => this.handleSettingChange(e));
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-stats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshStats());
        }
    }

    async loadGuildStats() {
        try {
            const response = await fetch('/api/guilds');
            if (!response.ok) throw new Error('Failed to fetch guilds');
            
            const guilds = await response.json();
            this.updateGuildCount(guilds.length);
            this.updateBotStats();
        } catch (error) {
            console.error('Error loading guild stats:', error);
            this.showNotification('Eroare la încărcarea statisticilor', 'error');
        }
    }

    async updateBotStats() {
        try {
            const response = await fetch('/api/bot/stats');
            if (!response.ok) throw new Error('Failed to fetch bot stats');
            
            const stats = await response.json();
            this.updateBotStatus(stats);
        } catch (error) {
            console.error('Error updating bot stats:', error);
        }
    }

    async updateSystemHealth() {
        try {
            const response = await fetch('/api/bot/health');
            if (!response.ok) throw new Error('Failed to fetch system health');
            
            const data = await response.json();
            if (data.success) {
                this.updateHealthDisplay(data.health);
            }
        } catch (error) {
            console.error('Error updating system health:', error);
        }
    }

    updateHealthDisplay(health) {
        // Update memory usage
        const memoryUsage = document.getElementById('memory-usage');
        const memoryPercentage = document.getElementById('memory-percentage');
        if (memoryUsage) memoryUsage.textContent = health.memory.used;
        if (memoryPercentage) memoryPercentage.textContent = `${health.memory.percentage}%`;

        // Update CPU usage
        const cpuUsage = document.getElementById('cpu-usage');
        const cpuStatus = document.getElementById('cpu-status');
        if (cpuUsage) cpuUsage.textContent = health.cpu.usage;
        if (cpuStatus) cpuStatus.textContent = health.cpu.status;

        // Update database status
        const dbStatus = document.getElementById('db-status');
        const dbLatency = document.getElementById('db-latency');
        if (dbStatus) dbStatus.textContent = health.database.status;
        if (dbLatency) dbLatency.textContent = health.database.latency;

        // Update uptime and ping
        const uptime = document.getElementById('uptime');
        const ping = document.getElementById('ping');
        if (uptime) uptime.textContent = health.uptime;
        if (ping) ping.textContent = health.ping;
    }

    updateBotStatus(stats) {
        const statusElement = document.getElementById('bot-status');
        const memberCountElement = document.getElementById('total-members');
        const guildCountElement = document.getElementById('total-guilds');

        if (statusElement) {
            statusElement.textContent = stats.status;
            statusElement.className = `text-${stats.status === 'Online' ? 'green' : 'red'}-500 font-semibold`;
        }

        if (memberCountElement) {
            memberCountElement.textContent = stats.totalMembers?.toLocaleString() || '0';
        }

        if (guildCountElement) {
            guildCountElement.textContent = stats.totalGuilds || '0';
        }
    }

    filterGuilds(searchTerm) {
        const guildCards = document.querySelectorAll('.guild-card');
        const searchTermLower = searchTerm.toLowerCase();

        guildCards.forEach(card => {
            const guildName = card.querySelector('.guild-name')?.textContent?.toLowerCase() || '';
            const guildId = card.querySelector('.guild-id')?.textContent?.toLowerCase() || '';
            
            if (guildName.includes(searchTermLower) || guildId.includes(searchTermLower)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    handleQuickAction(event) {
        const action = event.currentTarget.dataset.action;
        
        switch (action) {
            case 'add-bot':
                this.openInviteModal();
                break;
            case 'settings':
                this.openSettingsModal();
                break;
            case 'help':
                this.openHelpModal();
                break;
            case 'bot-editor':
                this.openBotEditor();
                break;
            case 'command-editor':
                this.openCommandEditor();
                break;
            case 'deploy-commands':
                this.deployCommands();
                break;
            case 'create-backup':
                this.createBackup();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    async handleSettingChange(event) {
        const setting = event.target.dataset.setting;
        const enabled = event.target.checked;
        
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setting, enabled })
            });

            if (response.ok) {
                this.showNotification(`Setarea "${setting}" a fost ${enabled ? 'activată' : 'dezactivată'}`, 'success');
            } else {
                throw new Error('Failed to update setting');
            }
        } catch (error) {
            console.error('Error updating setting:', error);
            this.showNotification('Eroare la actualizarea setării', 'error');
            event.target.checked = !enabled; // Revert the change
        }
    }

    openInviteModal() {
        const botId = document.querySelector('[data-bot-id]')?.dataset.botId;
        if (botId) {
            const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands`;
            window.open(inviteUrl, '_blank');
        }
    }

    openSettingsModal() {
        // Implementation for settings modal
        this.showNotification('Modalul de setări va fi implementat în curând', 'info');
    }

    openHelpModal() {
        // Implementation for help modal
        this.showNotification('Modalul de ajutor va fi implementat în curând', 'info');
    }

    openBotEditor() {
        // Implementation for bot editor
        this.showNotification('Editorul bot-ului va fi implementat în curând', 'info');
    }

    openCommandEditor() {
        // Implementation for command editor
        this.showNotification('Editorul comenzilor va fi implementat în curând', 'info');
    }

    async deployCommands() {
        try {
            const response = await fetch('/api/bot/deploy-commands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                this.showNotification(data.message, 'success');
            } else {
                throw new Error('Failed to deploy commands');
            }
        } catch (error) {
            console.error('Error deploying commands:', error);
            this.showNotification('Eroare la deploy-ul comenzilor', 'error');
        }
    }

    async createBackup() {
        try {
            const response = await fetch('/api/bot/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                this.showNotification(data.message, 'success');
            } else {
                throw new Error('Failed to create backup');
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showNotification('Eroare la crearea backup-ului', 'error');
        }
    }

    async refreshStats() {
        const refreshBtn = document.getElementById('refresh-stats');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizare...';
            refreshBtn.disabled = true;
        }

        try {
            await this.loadGuildStats();
            await this.updateBotStats();
            await this.updateSystemHealth();
            this.showNotification('Statisticile au fost actualizate', 'success');
        } catch (error) {
            this.showNotification('Eroare la actualizarea statisticilor', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizează';
                refreshBtn.disabled = false;
            }
        }
    }

    startAutoRefresh() {
        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.loadGuildStats();
            this.updateBotStats();
            this.updateSystemHealth();
        }, 5 * 60 * 1000);
    }

    setupTooltips() {
        // Initialize tooltips for elements with data-tooltip attribute
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => this.showTooltip(e));
            element.addEventListener('mouseleave', () => this.hideTooltip());
        });
    }

    showTooltip(event) {
        const tooltipText = event.target.dataset.tooltip;
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.textContent = tooltipText;
        tooltip.style.cssText = `
            position: absolute;
            background: #1f2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
        `;

        document.body.appendChild(tooltip);
        
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip-popup');
        if (tooltip) {
            tooltip.remove();
        }
    }

    initializeCharts() {
        // Initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.createGuildGrowthChart();
            this.createActivityChart();
        }
    }

    createGuildGrowthChart() {
        const ctx = document.getElementById('guild-growth-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun'],
                datasets: [{
                    label: 'Servere',
                    data: [12, 19, 25, 32, 38, 45],
                    borderColor: '#5865f2',
                    backgroundColor: 'rgba(88, 101, 242, 0.1)',
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

    createActivityChart() {
        const ctx = document.getElementById('activity-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Moderare', 'Economie', 'Muzică', 'Jocuri'],
                datasets: [{
                    data: [35, 25, 25, 15],
                    backgroundColor: ['#ef4444', '#f59e0b', '#ec4899', '#10b981']
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

    updateGuildCount(count) {
        const countElement = document.getElementById('guild-count');
        if (countElement) {
            countElement.textContent = count;
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
}

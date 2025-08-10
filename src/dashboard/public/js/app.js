// Main Dashboard Application JavaScript
class DashboardApp {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupNotifications();
    }

    init() {
        console.log('Dashboard App initialized');
        this.addLoadingStates();
        this.setupThemeToggle();
        this.initializeTooltips();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('guild-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }

        // Sort functionality
        const sortSelect = document.getElementById('sort-guilds');
        if (sortSelect) {
            sortSelect.addEventListener('change', this.handleSort.bind(this));
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-stats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.refreshStats.bind(this));
        }

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('[data-mobile-menu]');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }
    }

    setupNotifications() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification-container';
        this.notificationContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(this.notificationContainer);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type} slide-up`;
        
        const icon = this.getNotificationIcon(type);
        const color = this.getNotificationColor(type);
        
        notification.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="${icon} text-${color}-400"></i>
                    </div>
                    <div class="ml-3 w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">${message}</p>
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button class="notification-close bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-discord-blurple">
                            <span class="sr-only">Close</span>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        this.notificationContainer.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        return notification;
    }

    removeNotification(notification) {
        notification.classList.add('slide-down');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: 'green',
            error: 'red',
            warning: 'yellow',
            info: 'blue'
        };
        return colors[type] || 'blue';
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const guildCards = document.querySelectorAll('[data-guild-name]');
        
        guildCards.forEach(card => {
            const guildName = card.getAttribute('data-guild-name').toLowerCase();
            const guildDescription = card.getAttribute('data-guild-description')?.toLowerCase() || '';
            
            if (guildName.includes(searchTerm) || guildDescription.includes(searchTerm)) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });

        // Update guild count
        const visibleGuilds = Array.from(guildCards).filter(card => 
            card.style.display !== 'none'
        ).length;
        
        const guildCount = document.getElementById('guild-count');
        if (guildCount) {
            guildCount.textContent = visibleGuilds;
        }
    }

    handleSort(event) {
        const sortBy = event.target.value;
        const guildsContainer = document.querySelector('.guilds-grid');
        
        if (!guildsContainer) return;

        const guildCards = Array.from(guildsContainer.children);
        
        guildCards.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    const nameA = a.getAttribute('data-guild-name') || '';
                    const nameB = b.getAttribute('data-guild-name') || '';
                    return nameA.localeCompare(nameB);
                
                case 'members':
                    const membersA = parseInt(a.getAttribute('data-guild-members') || '0');
                    const membersB = parseInt(b.getAttribute('data-guild-members') || '0');
                    return membersB - membersA;
                
                case 'recent':
                    const dateA = new Date(a.getAttribute('data-guild-created') || '');
                    const dateB = new Date(b.getAttribute('data-guild-created') || '');
                    return dateB - dateA;
                
                default:
                    return 0;
            }
        });

        // Re-append sorted cards
        guildCards.forEach(card => {
            guildsContainer.appendChild(card);
            card.classList.add('bounce-in');
        });
    }

    async refreshStats() {
        const refreshBtn = document.getElementById('refresh-stats');
        if (!refreshBtn) return;

        // Add loading state
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Actualizare...';
        refreshBtn.disabled = true;

        try {
            // Fetch updated stats
            const response = await fetch('/api/bot/stats');
            const stats = await response.json();

            // Update bot status
            const botStatus = document.getElementById('bot-status');
            if (botStatus) {
                botStatus.textContent = stats.status;
                botStatus.className = `text-${stats.status === 'Online' ? 'green' : 'red'}-500 font-semibold`;
            }

            // Update total guilds and members
            const totalGuilds = document.getElementById('total-guilds');
            const totalMembers = document.getElementById('total-members');
            
            if (totalGuilds) totalGuilds.textContent = stats.totalGuilds;
            if (totalMembers) totalMembers.textContent = stats.totalMembers;

            this.showNotification('Statisticile au fost actualizate cu succes!', 'success');
        } catch (error) {
            console.error('Error refreshing stats:', error);
            this.showNotification('Eroare la actualizarea statisticilor', 'error');
        } finally {
            // Restore button state
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }
    }

    addLoadingStates() {
        // Add loading states to buttons
        const buttons = document.querySelectorAll('button[data-loading]');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.dataset.loading === 'true') return;
                
                button.dataset.loading = 'true';
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Se procesează...';
                button.disabled = true;

                // Re-enable after a delay (you can adjust this based on your needs)
                setTimeout(() => {
                    button.dataset.loading = 'false';
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            });
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        // Check for saved theme preference or default to 'light'
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.classList.toggle('dark-mode', currentTheme === 'dark');
        
        // Update toggle button
        this.updateThemeToggleIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark-mode');
            const theme = isDark ? 'dark' : 'light';
            
            localStorage.setItem('theme', theme);
            this.updateThemeToggleIcon(theme);
            this.showNotification(`Tema ${theme === 'dark' ? 'întunecată' : 'deschisă'} activată`, 'info');
        });
    }

    updateThemeToggleIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.querySelector('[data-mobile-menu-content]');
        if (mobileMenu) {
            mobileMenu.classList.toggle('hidden');
        }
    }

    initializeTooltips() {
        // Initialize tooltips for elements with data-tooltip attribute
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip.bind(this));
            element.addEventListener('mouseleave', this.hideTooltip.bind(this));
        });
    }

    showTooltip(event) {
        const element = event.target;
        const tooltipText = element.getAttribute('data-tooltip');
        
        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded text-center whitespace-nowrap';
        tooltip.textContent = tooltipText;
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(tooltip);
        element.tooltipElement = tooltip;
    }

    hideTooltip(event) {
        const element = event.target;
        if (element.tooltipElement) {
            element.tooltipElement.remove();
            element.tooltipElement = null;
        }
    }

    // Utility method to format numbers
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Utility method to format dates
    formatDate(date) {
        return new Intl.DateTimeFormat('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }

    // Method to add skeleton loading
    showSkeletonLoading(container, count = 3) {
        if (!container) return;

        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card mb-4';
            container.appendChild(skeleton);
        }
    }

    // Method to hide skeleton loading
    hideSkeletonLoading(container) {
        if (!container) return;
        
        const skeletons = container.querySelectorAll('.skeleton-card');
        skeletons.forEach(skeleton => skeleton.remove());
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardApp;
}

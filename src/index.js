const AKCAppManager = {
  // Core Components
  components: {
    projectManager: null,
    customerManager: null,
    estimateManager: null,
    timeTracker: null,
    dashboard: null,
    vendorManager: null,
    subcontractorManager: null,
    systemSettings: null
  },

  // Initialize the application
  init() {
    try {
      // Initialize core services
      AuthManager.init();
      ErrorHandler.init();
      NotificationSystem.init();

      // Initialize all components
      this.initializeComponents();

      // Render initial view based on URL or default
      this.handleRouting();

      // Set up event listeners
      this.setupEventListeners();

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'AKCAppManager.init'
      });
    }
  },

  initializeComponents() {
    this.components = {
      projectManager: new ProjectManager(),
      customerManager: new CustomerManager(),
      estimateManager: new EstimateManager(),
      timeTracker: new TimeTracker(),
      dashboard: new DashboardManager(),
      vendorManager: new VendorManager(),
      subcontractorManager: new SubcontractorManager(),
      systemSettings: new SystemSettingsManager()
    };
  },

  handleRouting() {
    const routes = {
      '/': () => this.renderDashboard(),
      '/projects': () => this.renderProjects(),
      '/customers': () => this.renderCustomers(),
      '/estimates': () => this.renderEstimates(),
      '/time': () => this.renderTimeTracking(),
      '/vendors': () => this.renderVendors(),
      '/subcontractors': () => this.renderSubcontractors(),
      '/settings': () => this.renderSettings()
    };

    const path = window.location.hash.substring(1) || '/';
    const route = routes[path] || routes['/'];
    route();
  },

  setupEventListeners() {
    // Handle navigation
    window.addEventListener('hashchange', () => this.handleRouting());

    // Handle authentication changes
    document.addEventListener('authStateChanged', (e) => {
      if (!e.detail.isAuthenticated) {
        this.renderLogin();
      }
    });
  },

  // Render Methods
  renderDashboard() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = this.components.dashboard.render();
    this.components.dashboard.initializeCharts();
  },

  renderProjects() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = this.components.projectManager.render();
  },

  // ... similar render methods for other components

  renderNavigation() {
    return `
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <img class="h-8 w-auto" src="logo.png" alt="AKC">
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                ${this.renderNavigationLinks()}
              </div>
            </div>
            <div class="flex items-center">
              ${this.renderUserMenu()}
            </div>
          </div>
        </div>
      </nav>
    `;
  }
};

// Initialize app when Google Apps Script loads
google.script.run
  .withSuccessHandler(() => {
    AKCAppManager.init();
  })
  .withFailureHandler((error) => {
    ErrorHandler.handleError(error, {
      context: 'App Initialization'
    });
  })
  .validateUserAccess();
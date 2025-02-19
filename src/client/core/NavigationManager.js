class NavigationManager {
  static config = {
    primary: [
      {
        label: 'Dashboard',
        route: '/',
        icon: 'home',
        permission: 'VIEW_DASHBOARD'
      },
      {
        label: 'Customers',
        route: '/customers',
        icon: 'users',
        permission: 'VIEW_CUSTOMERS'
      },
      {
        label: 'Projects',
        route: '/projects',
        icon: 'briefcase',
        permission: 'VIEW_PROJECTS'
      },
      {
        label: 'Estimates',
        route: '/estimates',
        icon: 'file-text',
        permission: 'VIEW_ESTIMATES'
      },
      {
        label: 'Time Logs',
        route: '/time-logs',
        icon: 'clock',
        permission: 'VIEW_TIME_LOGS'
      },
      {
        label: 'Materials',
        route: '/materials',
        icon: 'package',
        permission: 'VIEW_MATERIALS'
      },
      {
        label: 'Subcontractors',
        route: '/subcontractors',
        icon: 'users-group',
        permission: 'VIEW_SUBCONTRACTORS'
      }
    ],
    workflows: {
      estimateCreation: {
        steps: ['customerSelection', 'projectDetails', 'estimateDetails', 'review'],
        allowBack: true,
        validateStep: true
      }
    }
  };

  static init() {
    this.setupEventListeners();
    this.setupWorkspaceLayout();
    this.handleInitialRoute();
  }

  static setupWorkspaceLayout() {
    document.body.innerHTML = `
      <div class="h-screen flex overflow-hidden bg-gray-100">
        <!-- Sidebar -->
        <div class="hidden md:flex md:flex-shrink-0">
          <div class="flex flex-col w-64">
            ${this.renderSidebar()}
          </div>
        </div>

        <!-- Main Content -->
        <div class="flex flex-col w-0 flex-1 overflow-hidden">
          <!-- Top Navigation Bar -->
          ${this.renderTopNav()}

          <!-- Main Content Area -->
          <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div class="py-6">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <!-- Content gets mounted here -->
                <div id="main-content"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    `;
  }

  static renderSidebar() {
    return `
      <div class="flex flex-col h-full bg-gray-800">
        <!-- Logo -->
        <div class="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <img class="h-8 w-auto" src="/assets/logo.png" alt="Logo">
        </div>

        <!-- Navigation -->
        <div class="flex-1 flex flex-col overflow-y-auto">
          <nav class="flex-1 px-2 py-4 space-y-1">
            ${this.config.primary
              .filter(item => AuthManager.hasPermission(item.permission))
              .map(item => this.renderNavItem(item))
              .join('')}
          </nav>
        </div>
      </div>
    `;
  }

  static renderTopNav() {
    return `
      <div class="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
        <div class="flex-1 px-4 flex justify-between">
          <div class="flex-1 flex items-center">
            <!-- Global Search -->
            ${new GlobalSearchBar().render()}
          </div>
          <div class="ml-4 flex items-center md:ml-6">
            <!-- Notifications -->
            <button class="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span class="sr-only">View notifications</span>
              <span class="mdi mdi-bell text-xl"></span>
            </button>

            <!-- Profile dropdown -->
            ${this.renderUserMenu()}
          </div>
        </div>
      </div>
    `;
  }

  static renderUserMenu() {
    const user = AuthManager.getCurrentUser();
    return `
      <div>
        <button type="button" 
                class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                id="user-menu-button" 
                aria-expanded="false" 
                aria-haspopup="true"
                onclick="NavigationManager.toggleUserMenu()">
          <span class="sr-only">Open user menu</span>
          <img class="h-8 w-8 rounded-full" 
               src="${user.avatar || '/assets/default-avatar.png'}" 
               alt="">
        </button>
      </div>

      <!-- User Menu Dropdown -->
      <div class="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" 
           role="menu" 
           aria-orientation="vertical" 
           aria-labelledby="user-menu-button" 
           tabindex="-1"
           id="user-menu-dropdown">
        <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Your Profile</a>
        <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Settings</a>
        <button onclick="AuthManager.logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Sign out</button>
      </div>
    `;
  }

  static renderNavItem(item) {
    const isActive = window.location.pathname === item.route;
    return `
      <a href="${item.route}" 
         class="group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
           isActive
             ? 'bg-gray-900 text-white'
             : 'text-gray-300 hover:bg-gray-700 hover:text-white'
         }">
        <span class="mdi mdi-${item.icon} mr-3 flex-shrink-0 h-6 w-6"></span>
        ${item.label}
      </a>
    `;
  }

  static handleRoute(path) {
    const routes = {
      '/': DashboardView,
      '/customers': CustomersView,
      '/projects': ProjectsView,
      '/estimates': EstimatesView,
      '/time-logs': TimeLogsView,
      '/materials': MaterialsView,
      '/subcontractors': SubcontractorsView
    };

    const View = routes[path];
    if (View) {
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = new View().render();
    }
  }

  static setupEventListeners() {
    window.addEventListener('popstate', (event) => {
      this.handleRoute(window.location.pathname);
    });

    // Intercept navigation clicks
    document.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        const href = event.target.getAttribute('href');
        if (href.startsWith('/')) {
          event.preventDefault();
          this.navigateTo(href);
        }
      }
    });
  }

  static navigateTo(path) {
    window.history.pushState({}, '', path);
    this.handleRoute(path);
  }

  static handleInitialRoute() {
    this.handleRoute(window.location.pathname);
  }
}
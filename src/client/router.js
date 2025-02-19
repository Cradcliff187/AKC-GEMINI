const Router = {
  routes: {
    '/': () => this.loadComponent('Dashboard'),
    '/projects': () => this.loadComponent('Projects'),
    '/estimates': () => this.loadComponent('Estimates'),
    '/customers': () => this.loadComponent('Customers')
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const content = document.getElementById('content');
    
    if (this.routes[hash]) {
      this.routes[hash]();
    } else {
      content.innerHTML = '<h1 class="text-2xl">404 - Page Not Found</h1>';
    }
  },

  async loadComponent(name) {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="animate-pulse">Loading...</div>';
    
    try {
      const component = await google.script.run
        .withSuccessHandler((html) => {
          content.innerHTML = html;
          this.initializeComponent(name);
        })
        .withFailureHandler((error) => {
          content.innerHTML = `<div class="text-red-500">Error: ${error}</div>`;
        })
        .loadComponent(name);
    } catch (error) {
      content.innerHTML = `<div class="text-red-500">Error: ${error}</div>`;
    }
  }
};
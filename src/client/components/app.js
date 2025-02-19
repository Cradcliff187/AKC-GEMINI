const App = {
  init() {
    this.renderNavigation();
    Router.init();
  },

  renderNavigation() {
    const navLinks = [
      { path: '/', label: 'Dashboard', icon: 'home' },
      { path: '/projects', label: 'Projects', icon: 'briefcase' },
      { path: '/estimates', label: 'Estimates', icon: 'document' },
      { path: '/customers', label: 'Customers', icon: 'users' }
    ];

    const navContainer = document.querySelector('nav .md\\:flex');
    navLinks.forEach(link => {
      navContainer.innerHTML += `
        <a href="#${link.path}" 
           class="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          ${link.label}
        </a>
      `;
    });
  }
};

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => App.init());
class GlobalSearchBar {
  constructor() {
    this.recentSearches = [];
    this.maxRecentSearches = 5;
    this.debounceTimeout = null;
    this.minSearchLength = 2;
  }

  render() {
    return `
      <div class="relative w-full" id="global-search-container">
        <!-- Search Input -->
        <div class="relative">
          <input type="text"
                 id="global-search-input"
                 class="w-full h-10 pl-10 pr-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                 placeholder="Search projects, customers, estimates..."
                 autocomplete="off">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="mdi mdi-magnify text-gray-500"></span>
          </div>
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button id="search-keyboard-shortcut" 
                    class="hidden md:flex items-center px-2 py-1 text-xs text-gray-400 bg-gray-200 rounded">
              <span class="mdi mdi-keyboard mr-1"></span>
              Ctrl + K
            </button>
          </div>
        </div>

        <!-- Search Results Dropdown -->
        <div id="search-results-dropdown" 
             class="hidden absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <!-- Recent Searches -->
          <div id="recent-searches" class="border-b">
            <div class="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
              Recent Searches
            </div>
            ${this.renderRecentSearches()}
          </div>

          <!-- Results Categories -->
          <div id="search-results-content">
            ${this.renderEmptyState()}
          </div>
        </div>
      </div>
    `;
  }

  renderRecentSearches() {
    if (!this.recentSearches.length) {
      return `
        <div class="px-4 py-3 text-sm text-gray-500 italic">
          No recent searches
        </div>
      `;
    }

    return `
      <div class="max-h-40 overflow-y-auto">
        ${this.recentSearches.map(search => `
          <button class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  onclick="globalSearchBar.handleRecentSearchClick('${search.query}')">
            <span class="mdi mdi-history mr-2 text-gray-400"></span>
            ${search.query}
            <span class="ml-auto text-xs text-gray-400">
              ${this.getRelativeTime(search.timestamp)}
            </span>
          </button>
        `).join('')}
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="px-4 py-12 text-center">
        <span class="mdi mdi-text-search text-4xl text-gray-300"></span>
        <p class="mt-2 text-sm text-gray-500">
          Start typing to search across all modules
        </p>
      </div>
    `;
  }

  renderResults(results) {
    if (!results.length) {
      return `
        <div class="px-4 py-8 text-center">
          <span class="mdi mdi-file-search-outline text-4xl text-gray-300"></span>
          <p class="mt-2 text-sm text-gray-500">
            No results found
          </p>
        </div>
      `;
    }

    // Group results by module
    const groupedResults = this.groupResultsByModule(results);

    return Object.entries(groupedResults).map(([module, items]) => `
      <div class="module-results">
        <div class="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
          ${this.formatModuleName(module)} (${items.length})
        </div>
        <div class="max-h-64 overflow-y-auto">
          ${items.map(item => this.renderResultItem(item)).join('')}
        </div>
      </div>
    `).join('');
  }

  renderResultItem(item) {
    const icon = this.getModuleIcon(item.module);
    const subtitle = this.getResultSubtitle(item);
    const highlight = this.highlightMatch(item.title, this.currentQuery);

    return `
      <button class="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              onclick="globalSearchBar.handleResultClick('${item.module}', '${item.id}')">
        <div class="flex items-start">
          <span class="mdi ${icon} text-gray-400 mt-1"></span>
          <div class="ml-3 flex-1">
            <div class="text-sm font-medium text-gray-900">
              ${highlight}
            </div>
            ${subtitle ? `
              <div class="text-xs text-gray-500 mt-0.5">
                ${subtitle}
              </div>
            ` : ''}
          </div>
          <span class="mdi mdi-arrow-right text-gray-400"></span>
        </div>
      </button>
    `;
  }

  initialize() {
    this.setupEventListeners();
    this.loadRecentSearches();
    this.setupKeyboardShortcut();
  }

  setupEventListeners() {
    const input = document.getElementById('global-search-input');
    const dropdown = document.getElementById('search-results-dropdown');

    input?.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimeout);
      const query = e.target.value.trim();

      if (query.length >= this.minSearchLength) {
        this.debounceTimeout = setTimeout(() => {
          this.performSearch(query);
        }, 300);
      } else {
        dropdown.classList.add('hidden');
      }
    });

    input?.addEventListener('focus', () => {
      dropdown.classList.remove('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const searchContainer = document.getElementById('global-search-container');
      if (!searchContainer?.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
      
      if (e.key === 'Escape') {
        document.getElementById('search-results-dropdown').classList.add('hidden');
      }
    });
  }

  async performSearch(query) {
    this.currentQuery = query;
    const results = await GlobalSearch.search(query);
    const dropdown = document.getElementById('search-results-dropdown');
    const content = document.getElementById('search-results-content');

    if (content) {
      content.innerHTML = this.renderResults(results);
    }

    dropdown?.classList.remove('hidden');
  }

  handleResultClick(module, id) {
    this.addToRecentSearches(this.currentQuery);
    NavigationManager.navigateToItem(module, id);
    document.getElementById('search-results-dropdown').classList.add('hidden');
  }

  handleRecentSearchClick(query) {
    const input = document.getElementById('global-search-input');
    if (input) {
      input.value = query;
      this.performSearch(query);
    }
  }

  addToRecentSearches(query) {
    if (!query) return;

    this.recentSearches = [
      { query, timestamp: new Date().toISOString() },
      ...this.recentSearches.filter(item => item.query !== query)
    ].slice(0, this.maxRecentSearches);

    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    this.updateRecentSearchesUI();
  }

  loadRecentSearches() {
    try {
      const saved = localStorage.getItem('recentSearches');
      this.recentSearches = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading recent searches:', error);
      this.recentSearches = [];
    }
  }

  updateRecentSearchesUI() {
    const container = document.getElementById('recent-searches');
    if (container) {
      container.innerHTML = this.renderRecentSearches();
    }
  }

  getModuleIcon(module) {
    const icons = {
      projects: 'mdi-briefcase',
      customers: 'mdi-account-group',
      estimates: 'mdi-file-document',
      materials: 'mdi-package-variant',
      timeLogs: 'mdi-clock-outline',
      subcontractors: 'mdi-account-hard-hat'
    };
    return icons[module] || 'mdi-file';
  }

  formatModuleName(module) {
    return module.charAt(0).toUpperCase() + 
           module.slice(1).replace(/([A-Z])/g, ' $1').trim();
  }

  getRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  }

  highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-100">$1</mark>');
  }
}
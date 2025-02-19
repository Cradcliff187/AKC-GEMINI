class GlobalSearch {
  static searchableModules = {
    projects: {
      fields: ['ProjectName', 'Description', 'CustomerName'],
      weightage: 1.0
    },
    customers: {
      fields: ['CustomerName', 'ContactEmail', 'Phone'],
      weightage: 0.8
    },
    estimates: {
      fields: ['EstimateNumber', 'Description'],
      weightage: 0.7
    },
    materials: {
      fields: ['ReceiptID', 'VendorName'],
      weightage: 0.6
    }
  };

  static async initialize() {
    this.searchIndex = new Map();
    this.setupSearchListener();
    await this.buildSearchIndex();
  }

  static async buildSearchIndex() {
    try {
      for (const [module, config] of Object.entries(this.searchableModules)) {
        const data = await google.script.run.getModuleData(module);
        this.indexModuleData(module, data, config);
      }
    } catch (error) {
      ErrorHandler.handleError(error, { context: 'GlobalSearch.buildSearchIndex' });
    }
  }

  static indexModuleData(module, data, config) {
    data.forEach(item => {
      const searchableText = config.fields
        .map(field => item[field])
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      this.searchIndex.set(`${module}-${item.id}`, {
        text: searchableText,
        data: item,
        module,
        weightage: config.weightage
      });
    });
  }

  static async search(query) {
    if (!query || query.length < 2) return [];

    const results = Array.from(this.searchIndex.values())
      .map(item => ({
        ...item,
        score: this.calculateRelevance(query.toLowerCase(), item)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return this.formatSearchResults(results);
  }

  static calculateRelevance(query, item) {
    const text = item.text;
    let score = 0;

    // Exact match
    if (text.includes(query)) {
      score += 1 * item.weightage;
    }

    // Word match
    const words = query.split(/\s+/);
    words.forEach(word => {
      if (text.includes(word)) {
        score += 0.5 * item.weightage;
      }
    });

    // Partial match
    if (text.includes(query.substring(0, Math.floor(query.length / 2)))) {
      score += 0.3 * item.weightage;
    }

    return score;
  }

  static setupSearchListener() {
    const searchInput = document.getElementById('global-search');
    const resultsContainer = document.getElementById('search-results');

    searchInput?.addEventListener('input', debounce(async (e) => {
      const query = e.target.value;
      if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
      }

      const results = await this.search(query);
      this.renderSearchResults(results);
    }, 300));
  }

  static renderSearchResults(results) {
    const container = document.getElementById('search-results');
    if (!container) return;

    container.innerHTML = `
      <div class="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-1 z-50">
        ${results.length ? `
          <ul class="py-2">
            ${results.map(result => `
              <li class="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onclick="GlobalSearch.handleResultClick('${result.module}', '${result.data.id}')">
                <div class="flex items-center">
                  <span class="mdi ${this.getModuleIcon(result.module)} mr-3 text-gray-400"></span>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      ${this.highlightMatch(result.data[this.getPrimaryField(result.module)])}
                    </div>
                    <div class="text-xs text-gray-500">
                      ${this.getResultSubtitle(result)}
                    </div>
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        ` : `
          <div class="px-4 py-3 text-sm text-gray-500">
            No results found
          </div>
        `}
      </div>
    `;
  }

  static getModuleIcon(module) {
    const icons = {
      projects: 'mdi-briefcase',
      customers: 'mdi-account-group',
      estimates: 'mdi-file-document',
      materials: 'mdi-package-variant'
    };
    return icons[module] || 'mdi-file';
  }

  static getPrimaryField(module) {
    const fields = {
      projects: 'ProjectName',
      customers: 'CustomerName',
      estimates: 'EstimateNumber',
      materials: 'ReceiptID'
    };
    return fields[module];
  }

  static getResultSubtitle(result) {
    switch (result.module) {
      case 'projects':
        return `${result.data.CustomerName} • ${result.data.Status}`;
      case 'customers':
        return result.data.ContactEmail;
      case 'estimates':
        return `$${result.data.EstimatedAmount} • ${result.data.Status}`;
      case 'materials':
        return `${result.data.VendorName} • ${new Date(result.data.CreatedOn).toLocaleDateString()}`;
      default:
        return '';
    }
  }

  static highlightMatch(text) {
    // Implement text highlighting for matched terms
    return text;
  }

  static async handleResultClick(module, id) {
    NavigationManager.navigateToItem(module, id);
  }
}
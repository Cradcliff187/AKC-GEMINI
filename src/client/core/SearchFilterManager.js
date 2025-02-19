class SearchFilterManager {
  static filterTypes = {
    TEXT: 'text',
    SELECT: 'select',
    DATE_RANGE: 'dateRange',
    NUMBER_RANGE: 'numberRange',
    BOOLEAN: 'boolean',
    MULTI_SELECT: 'multiSelect'
  };

  constructor(options = {}) {
    this.activeFilters = new Map();
    this.searchQuery = '';
    this.sortConfig = {
      field: options.defaultSort || 'CreatedOn',
      direction: 'desc'
    };
    this.filterDefinitions = new Map();
    this.searchableFields = options.searchableFields || [];
    this.setupFilterDefinitions();
  }

  setupFilterDefinitions() {
    // Common filters based on blueprint schemas
    this.addFilterDefinition('status', {
      type: this.constructor.filterTypes.SELECT,
      options: {
        PROJECT: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
        ESTIMATE: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'],
        CUSTOMER: ['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED'],
        DOCUMENT: ['DRAFT', 'ACTIVE', 'ARCHIVED', 'EXPIRED'],
        COMMUNICATION: ['DRAFT', 'SENT', 'DELIVERED', 'READ', 'REPLIED', 'FAILED']
      }
    });

    this.addFilterDefinition('dateRange', {
      type: this.constructor.filterTypes.DATE_RANGE,
      fields: ['CreatedOn', 'LastModified', 'DateWorked']
    });

    this.addFilterDefinition('amount', {
      type: this.constructor.filterTypes.NUMBER_RANGE,
      fields: ['EstimatedAmount', 'InvoiceAmount', 'Amount'],
      formatter: 'currency'
    });
  }

  addFilterDefinition(key, definition) {
    this.filterDefinitions.set(key, definition);
  }

  setFilter(key, value) {
    if (value === null || value === undefined || value === '') {
      this.activeFilters.delete(key);
    } else {
      this.activeFilters.set(key, value);
    }
  }

  setSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
  }

  setSort(field, direction = 'asc') {
    this.sortConfig = { field, direction };
  }

  applyFilters(data) {
    let filteredData = [...data];

    // Apply search
    if (this.searchQuery) {
      filteredData = this.applySearch(filteredData);
    }

    // Apply filters
    this.activeFilters.forEach((value, key) => {
      filteredData = this.applyFilter(filteredData, key, value);
    });

    // Apply sorting
    filteredData = this.applySort(filteredData);

    return filteredData;
  }

  applySearch(data) {
    return data.filter(item => 
      this.searchableFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(this.searchQuery);
      })
    );
  }

  applyFilter(data, key, value) {
    const definition = this.filterDefinitions.get(key);
    if (!definition) return data;

    switch (definition.type) {
      case this.constructor.filterTypes.SELECT:
        return data.filter(item => item[key] === value);

      case this.constructor.filterTypes.DATE_RANGE:
        return data.filter(item => {
          const itemDate = new Date(item[definition.fields[0]]);
          return itemDate >= value.start && itemDate <= value.end;
        });

      case this.constructor.filterTypes.NUMBER_RANGE:
        return data.filter(item => {
          const itemValue = parseFloat(item[definition.fields[0]]);
          return itemValue >= value.min && itemValue <= value.max;
        });

      case this.constructor.filterTypes.BOOLEAN:
        return data.filter(item => item[key] === value);

      case this.constructor.filterTypes.MULTI_SELECT:
        return data.filter(item => value.includes(item[key]));

      default:
        return data;
    }
  }

  applySort(data) {
    const { field, direction } = this.sortConfig;
    return data.sort((a, b) => {
      let comparison = 0;
      const aVal = a[field];
      const bVal = b[field];

      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return direction === 'desc' ? comparison * -1 : comparison;
    });
  }

  // Helper method to generate filter UI
  renderFilterUI() {
    return `
      <div class="filter-container bg-white rounded-lg shadow-sm p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div class="col-span-2">
            <div class="relative">
              <input type="text" 
                     placeholder="Search..." 
                     class="input-field pl-10"
                     onkeyup="searchFilter.handleSearch(this.value)">
              <span class="absolute left-3 top-3 text-gray-400">
                <span class="mdi mdi-magnify"></span>
              </span>
            </div>
          </div>

          <!-- Filters Dropdown -->
          <div class="relative">
            <button onclick="searchFilter.toggleFiltersMenu()"
                    class="btn-secondary w-full flex items-center justify-between">
              <span>Filters</span>
              <span class="mdi mdi-filter"></span>
            </button>
            <div id="filters-menu" 
                 class="hidden absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10">
              ${this.renderFilterOptions()}
            </div>
          </div>
        </div>

        <!-- Active Filters -->
        <div class="mt-4 flex flex-wrap gap-2">
          ${this.renderActiveFilters()}
        </div>
      </div>
    `;
  }

  renderFilterOptions() {
    return Array.from(this.filterDefinitions.entries()).map(([key, def]) => `
      <div class="p-4 border-b">
        <label class="block text-sm font-medium text-gray-700">${this.formatLabel(key)}</label>
        ${this.renderFilterInput(key, def)}
      </div>
    `).join('');
  }

  renderFilterInput(key, definition) {
    switch (definition.type) {
      case this.constructor.filterTypes.SELECT:
        return `
          <select class="mt-1 input-field" 
                  onchange="searchFilter.handleFilterChange('${key}', this.value)">
            <option value="">All</option>
            ${definition.options[key]?.map(opt => `
              <option value="${opt}">${opt}</option>
            `).join('')}
          </select>
        `;

      case this.constructor.filterTypes.DATE_RANGE:
        return `
          <div class="flex gap-2">
            <input type="date" 
                   class="mt-1 input-field"
                   onchange="searchFilter.handleDateRangeChange('${key}', 'start', this.value)">
            <input type="date" 
                   class="mt-1 input-field"
                   onchange="searchFilter.handleDateRangeChange('${key}', 'end', this.value)">
          </div>
        `;

      // Add other filter type renderers as needed
      default:
        return '';
    }
  }

  formatLabel(key) {
    return key.split(/(?=[A-Z])/).join(' ');
  }
}
class CustomersList {
  constructor() {
    this.customers = [];
    this.currentView = 'grid';
    this.filters = {
      search: '',
      status: 'all'
    };
  }

  render() {
    return `
      <div class="space-y-6">
        ${this.renderHeader()}
        ${this.currentView === 'grid' ? this.renderGridView() : this.renderTableView()}
      </div>
    `;
  }

  renderHeader() {
    return `
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Customers</h1>
          <p class="text-sm text-gray-500">Manage customer relationships and projects</p>
        </div>
        <button onclick="customersList.showNewCustomer()" 
                class="btn-primary">
          <span class="mdi mdi-plus mr-2"></span>
          New Customer
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex gap-4">
          <div class="flex-1">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center">
                <span class="mdi mdi-magnify text-gray-500"></span>
              </span>
              <input type="text" 
                     placeholder="Search customers..." 
                     class="pl-10 input-field"
                     onkeyup="customersList.handleSearch(this.value)">
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">View:</span>
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button onclick="customersList.setView('grid')" 
                      class="${this.currentView === 'grid' ? 'bg-white shadow' : ''} p-2 rounded">
                <span class="mdi mdi-view-grid"></span>
              </button>
              <button onclick="customersList.setView('table')" 
                      class="${this.currentView === 'table' ? 'bg-white shadow' : ''} p-2 rounded">
                <span class="mdi mdi-table"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderGridView() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.customers.map(customer => `
          <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">${customer.CustomerName}</h3>
                <p class="text-sm text-gray-500">ID: ${customer.CustomerID}</p>
              </div>
              <button class="text-gray-400 hover:text-gray-600">
                <span class="mdi mdi-dots-vertical"></span>
              </button>
            </div>
            
            <div class="mt-4 space-y-2">
              <div class="flex items-center text-sm text-gray-600">
                <span class="mdi mdi-email mr-2"></span>
                ${customer.Email || 'No email provided'}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <span class="mdi mdi-phone mr-2"></span>
                ${customer.Phone || 'No phone provided'}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <span class="mdi mdi-folder-multiple mr-2"></span>
                ${customer.ProjectCount || 0} Projects
              </div>
            </div>

            <div class="mt-4 pt-4 border-t flex justify-end space-x-2">
              <button onclick="customersList.viewDetails('${customer.CustomerID}')" 
                      class="btn-secondary text-sm">View Details</button>
              <button onclick="customersList.editCustomer('${customer.CustomerID}')" 
                      class="btn-primary text-sm">Edit</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}
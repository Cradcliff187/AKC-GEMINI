class SubcontractorsList {
  constructor() {
    this.subcontractors = [];
    this.filters = {
      search: '',
      status: 'all'
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Subcontractors</h1>
            <p class="text-sm text-gray-500">Manage subcontractors and their invoices</p>
          </div>
          <button onclick="subcontractorsList.addSubcontractor()" 
                  class="btn-primary">
            <span class="mdi mdi-account-plus mr-2"></span>
            Add Subcontractor
          </button>
        </div>

        <!-- Search and Filters -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="col-span-2">
              <div class="relative">
                <input type="text" 
                       placeholder="Search subcontractors..." 
                       class="input-field pl-10"
                       onkeyup="subcontractorsList.handleSearch(this.value)">
                <span class="absolute left-3 top-3 text-gray-400">
                  <span class="mdi mdi-magnify"></span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Subcontractors Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.renderSubcontractorCards()}
        </div>
      </div>
    `;
  }

  renderSubcontractorCards() {
    return this.subcontractors.map(sub => `
      <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-medium text-gray-900">${sub.SubName}</h3>
            <p class="text-sm text-gray-500">ID: ${sub.SubID}</p>
          </div>
          <div class="flex items-center">
            <button onclick="subcontractorsList.showMenu('${sub.SubID}')"
                    class="text-gray-400 hover:text-gray-600">
              <span class="mdi mdi-dots-vertical text-xl"></span>
            </button>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <div class="flex items-center text-sm text-gray-600">
            <span class="mdi mdi-email mr-2"></span>
            ${sub.ContactEmail || 'No email provided'}
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <span class="mdi mdi-phone mr-2"></span>
            ${sub.Phone || 'No phone provided'}
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <span class="mdi mdi-map-marker mr-2"></span>
            ${[sub.Address, sub.City, sub.State, sub.Zip].filter(Boolean).join(', ')}
          </div>
        </div>

        <div class="mt-6 pt-4 border-t flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-gray-900">Recent Activity</p>
            <p class="text-xs text-gray-500">Last invoice: ${this.getLastInvoiceDate(sub.SubID)}</p>
          </div>
          <div>
            <button onclick="subcontractorsList.viewInvoices('${sub.SubID}')"
                    class="btn-secondary text-sm">
              View Invoices
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}
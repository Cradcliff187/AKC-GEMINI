class SubcontractorDetails {
  constructor(subId) {
    this.subId = subId;
    this.subcontractor = null;
    this.activeTab = 'overview';
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                ${this.subcontractor.SubName}
              </h1>
              <p class="text-sm text-gray-500">ID: ${this.subcontractor.SubID}</p>
            </div>
            <div class="flex space-x-3">
              <button onclick="subcontractorDetails.edit()" 
                      class="btn-secondary">
                <span class="mdi mdi-pencil mr-2"></span>
                Edit
              </button>
              <button onclick="subcontractorDetails.addInvoice()" 
                      class="btn-primary">
                <span class="mdi mdi-file-plus mr-2"></span>
                New Invoice
              </button>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Contact Information</h3>
              <div class="mt-2 space-y-2">
                <p class="text-sm text-gray-900">
                  <span class="mdi mdi-email mr-2"></span>
                  ${this.subcontractor.ContactEmail}
                </p>
                <p class="text-sm text-gray-900">
                  <span class="mdi mdi-phone mr-2"></span>
                  ${this.subcontractor.Phone}
                </p>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Address</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-900">
                  ${this.subcontractor.Address}<br>
                  ${this.subcontractor.City}, ${this.subcontractor.State} ${this.subcontractor.Zip}
                </p>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Activity Summary</h3>
              <div class="mt-2 space-y-2">
                <p class="text-sm text-gray-900">
                  <span class="mdi mdi-file-document mr-2"></span>
                  ${this.getInvoiceCount()} Invoices
                </p>
                <p class="text-sm text-gray-900">
                  <span class="mdi mdi-briefcase mr-2"></span>
                  ${this.getProjectCount()} Projects
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="bg-white rounded-lg shadow-sm">
          <nav class="flex border-b border-gray-200">
            ${this.renderTabs()}
          </nav>
          <div class="p-6">
            ${this.renderTabContent()}
          </div>
        </div>
      </div>
    `;
  }

  renderTabs() {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: 'information' },
      { id: 'invoices', label: 'Invoices', icon: 'file-document' },
      { id: 'projects', label: 'Projects', icon: 'briefcase' },
      { id: 'documents', label: 'Documents', icon: 'folder' }
    ];

    return tabs.map(tab => `
      <button onclick="subcontractorDetails.switchTab('${tab.id}')"
              class="px-4 py-2 border-b-2 font-medium text-sm
                     ${this.activeTab === tab.id 
                       ? 'border-blue-500 text-blue-600'
                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
        <span class="mdi mdi-${tab.icon} mr-2"></span>
        ${tab.label}
      </button>
    `).join('');
  }
}
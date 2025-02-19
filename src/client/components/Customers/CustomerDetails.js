class CustomerDetails {
  constructor(customerId) {
    this.customerId = customerId;
    this.customer = null;
    this.activeTab = 'overview';
    this.tabs = [
      { id: 'overview', label: 'Overview', icon: 'information' },
      { id: 'projects', label: 'Projects', icon: 'briefcase' },
      { id: 'contacts', label: 'Contacts', icon: 'account-multiple' },
      { id: 'documents', label: 'Documents', icon: 'file-document' },
      { id: 'communications', label: 'Communications', icon: 'email' }
    ];
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Customer Header -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">${this.customer.CustomerName}</h1>
                <p class="text-sm text-gray-500">Customer ID: ${this.customer.CustomerID}</p>
              </div>
              <div class="flex items-center space-x-3">
                <span class="status-badge status-${this.customer.Status.toLowerCase()}">
                  ${this.customer.Status}
                </span>
                <button onclick="customerDetails.editCustomer()" class="btn-primary">
                  <span class="mdi mdi-pencil mr-2"></span>
                  Edit Customer
                </button>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="text-sm font-medium text-gray-900">${this.customer.ContactEmail || 'N/A'}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Phone</p>
                <p class="text-sm font-medium text-gray-900">${this.customer.Phone || 'N/A'}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Address</p>
                <p class="text-sm font-medium text-gray-900">
                  ${this.customer.Address}, ${this.customer.City}, ${this.customer.State} ${this.customer.Zip}
                </p>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="border-t border-gray-200">
            <nav class="flex">
              ${this.tabs.map(tab => `
                <button 
                  onclick="customerDetails.switchTab('${tab.id}')"
                  class="tab-button ${this.activeTab === tab.id ? 'active' : ''}"
                  data-tab="${tab.id}">
                  <span class="mdi mdi-${tab.icon} mr-2"></span>
                  ${tab.label}
                </button>
              `).join('')}
            </nav>
          </div>
        </div>

        <!-- Tab Content -->
        <div id="tab-content" class="bg-white rounded-lg shadow">
          ${this.renderTabContent()}
        </div>
      </div>
    `;
  }

  renderTabContent() {
    switch(this.activeTab) {
      case 'overview':
        return this.renderOverview();
      case 'projects':
        return this.renderProjects();
      case 'contacts':
        return this.renderContacts();
      case 'documents':
        return this.renderDocuments();
      case 'communications':
        return this.renderCommunications();
      default:
        return '<div class="p-6">Tab content not found</div>';
    }
  }
}
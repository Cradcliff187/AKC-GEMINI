class CustomerSelectionStep {
  constructor() {
    this.selectedCustomer = null;
    this.customers = [];
  }

  render() {
    return `
      <div class="space-y-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900">Customer Selection</h3>
          <p class="text-sm text-gray-500">Select an existing customer or create a new one</p>
        </div>

        <!-- Customer Search -->
        <div class="relative">
          <input type="text"
                 id="customer-search"
                 class="input-field pl-10"
                 placeholder="Search customers..."
                 onkeyup="customerSelectionStep.handleSearch(event)">
          <span class="absolute left-3 top-3 text-gray-400 mdi mdi-magnify"></span>
        </div>

        <!-- Customer List -->
        <div class="mt-4 border rounded-lg overflow-hidden">
          <div class="max-h-64 overflow-y-auto" id="customer-list">
            ${this.renderCustomerList()}
          </div>
        </div>

        <!-- Create New Customer -->
        <div class="mt-6">
          <button onclick="customerSelectionStep.showNewCustomerForm()"
                  class="btn-secondary w-full">
            <span class="mdi mdi-plus mr-2"></span>
            Create New Customer
          </button>
        </div>
      </div>
    `;
  }

  async initialize() {
    try {
      this.customers = await google.script.run
        .withSuccessHandler(customers => customers)
        .withFailureHandler(error => {
          throw error;
        })
        .getCustomersForClient();

      this.renderCustomerList();
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'CustomerSelectionStep.initialize'
      });
    }
  }

  renderCustomerList() {
    if (!this.customers.length) {
      return `
        <div class="p-4 text-center text-gray-500">
          No customers found
        </div>
      `;
    }

    return this.customers.map(customer => `
      <div class="customer-item border-b last:border-0">
        <button class="w-full px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
                onclick="customerSelectionStep.selectCustomer('${customer.customerId}')">
          <div class="flex-1">
            <div class="flex items-center">
              <span class="font-medium text-gray-900">${customer.name}</span>
              <span class="ml-2 px-2 py-1 text-xs rounded-full ${
                this.getStatusClasses(customer.status)
              }">
                ${customer.status}
              </span>
            </div>
            <div class="mt-1 text-sm text-gray-500">
              ${customer.email || 'No email provided'}
            </div>
          </div>
          ${this.selectedCustomer?.customerId === customer.customerId ? `
            <span class="mdi mdi-check-circle text-green-500 text-xl"></span>
          ` : ''}
        </button>
      </div>
    `).join('');
  }

  getStatusClasses(status) {
    const classes = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      ARCHIVED: 'bg-red-100 text-red-800'
    };
    return classes[status] || classes.PENDING;
  }

  async handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const listElement = document.getElementById('customer-list');

    if (!query) {
      listElement.innerHTML = this.renderCustomerList();
      return;
    }

    const filteredCustomers = this.customers.filter(customer => 
      customer.name.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query)
    );

    this.customers = filteredCustomers;
    listElement.innerHTML = this.renderCustomerList();
  }

  async selectCustomer(customerId) {
    try {
      const customer = this.customers.find(c => c.customerId === customerId);
      if (!customer) throw new Error('Customer not found');

      this.selectedCustomer = customer;
      document.getElementById('customer-list').innerHTML = this.renderCustomerList();

      // Update estimate data
      await EstimateManager.updateEstimateData({
        customerId: customer.customerId,
        customerName: customer.name
      });

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'CustomerSelectionStep.selectCustomer',
        customerId
      });
    }
  }

  showNewCustomerForm() {
    const modal = new Modal({
      title: 'Create New Customer',
      content: this.renderNewCustomerForm(),
      size: 'lg'
    });
    modal.show();
  }

  renderNewCustomerForm() {
    return `
      <form id="new-customer-form" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Customer Name -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input type="text" 
                   name="name"
                   class="mt-1 input-field"
                   required>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input type="email" 
                   name="email"
                   class="mt-1 input-field">
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input type="tel" 
                   name="phone"
                   class="mt-1 input-field"
                   pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
          </div>

          <!-- Address -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input type="text" 
                   name="address"
                   class="mt-1 input-field"
                   required>
          </div>

          <!-- City -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              City
            </label>
            <input type="text" 
                   name="city"
                   class="mt-1 input-field"
                   required>
          </div>

          <!-- State -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              State
            </label>
            <input type="text" 
                   name="state"
                   class="mt-1 input-field"
                   required>
          </div>

          <!-- Zip -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <input type="text" 
                   name="zip"
                   class="mt-1 input-field"
                   required
                   pattern="[0-9]{5}">
          </div>
        </div>
      </form>
    `;
  }

  async validate() {
    if (!this.selectedCustomer) {
      NotificationSystem.notify({
        type: 'error',
        message: 'Please select a customer to continue'
      });
      return false;
    }
    return true;
  }
}
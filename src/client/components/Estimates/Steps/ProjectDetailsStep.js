class ProjectDetailsStep {
  constructor() {
    this.projectData = {
      projectName: '',
      scopeOfWork: ''
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900">Project Details</h3>
          <p class="text-sm text-gray-500">Enter the project information</p>
        </div>

        <!-- Project Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input type="text"
                 id="project-name"
                 class="mt-1 input-field"
                 value="${this.projectData.projectName}"
                 maxlength="100"
                 onchange="projectDetailsStep.handleInputChange('projectName', this.value)"
                 required>
          <p class="mt-1 text-xs text-gray-500">
            Maximum 100 characters
          </p>
        </div>

        <!-- Scope of Work -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Scope of Work
          </label>
          <textarea id="scope-of-work"
                    rows="5"
                    class="mt-1 input-field"
                    onchange="projectDetailsStep.handleInputChange('scopeOfWork', this.value)"
                    required>${this.projectData.scopeOfWork}</textarea>
        </div>
      </div>
    `;
  }

  async handleInputChange(field, value) {
    this.projectData[field] = value;
    await this.validateField(field, value);
  }

  async validateField(field, value) {
    switch (field) {
      case 'projectName':
        return this.validateProjectName(value);
      case 'scopeOfWork':
        return this.validateScopeOfWork(value);
      default:
        return true;
    }
  }

  async validateProjectName(name) {
    if (!name || name.length < 3) {
      throw new Error('Project name must be at least 3 characters long');
    }
    return true;
  }

  async validateScopeOfWork(scope) {
    if (!scope || scope.length < 10) {
      throw new Error('Scope of work must be at least 10 characters long');
    }
    return true;
  }

  async validate() {
    try {
      await Promise.all([
        this.validateProjectName(this.projectData.projectName),
        this.validateScopeOfWork(this.projectData.scopeOfWork)
      ]);
      return true;
    } catch (error) {
      NotificationSystem.notify({
        type: 'error',
        message: error.message
      });
      return false;
    }
  }
}

// filepath: /workspaces/AKC-GEMINI/src/client/components/Estimates/Steps/EstimateDetailsStep.js
class EstimateDetailsStep {
  constructor() {
    this.lineItems = [];
    this.totals = {
      subtotal: 0,
      tax: 0,
      total: 0
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900">Estimate Details</h3>
          <p class="text-sm text-gray-500">Add line items to your estimate</p>
        </div>

        <!-- Line Items Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item/Service
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Qty/Hours
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rate
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${this.renderLineItems()}
            </tbody>
            <tfoot class="bg-gray-50">
              ${this.renderTotals()}
            </tfoot>
          </table>
        </div>

        <!-- Add Line Item Button -->
        <div class="flex justify-end">
          <button onclick="estimateDetailsStep.addLineItem()"
                  class="btn-secondary">
            <span class="mdi mdi-plus mr-2"></span>
            Add Line Item
          </button>
        </div>
      </div>
    `;
  }

  renderLineItems() {
    if (!this.lineItems.length) {
      return `
        <tr>
          <td colspan="6" class="px-6 py-4 text-center text-gray-500">
            No items added yet
          </td>
        </tr>
      `;
    }

    return this.lineItems.map((item, index) => `
      <tr>
        <td class="px-6 py-4">
          <input type="text"
                 class="input-field"
                 value="${item.itemService || ''}"
                 onchange="estimateDetailsStep.updateLineItem(${index}, 'itemService', this.value)"
                 required>
        </td>
        <td class="px-6 py-4">
          <input type="text"
                 class="input-field"
                 value="${item.description || ''}"
                 onchange="estimateDetailsStep.updateLineItem(${index}, 'description', this.value)"
                 required>
        </td>
        <td class="px-6 py-4">
          <input type="number"
                 class="input-field"
                 value="${item.qtyHours || ''}"
                 min="0"
                 step="0.25"
                 onchange="estimateDetailsStep.updateLineItem(${index}, 'qtyHours', this.value)"
                 required>
        </td>
        <td class="px-6 py-4">
          <input type="number"
                 class="input-field"
                 value="${item.rate || ''}"
                 min="0"
                 step="0.01"
                 onchange="estimateDetailsStep.updateLineItem(${index}, 'rate', this.value)"
                 required>
        </td>
        <td class="px-6 py-4">
          ${this.formatCurrency(item.qtyHours * item.rate)}
        </td>
        <td class="px-6 py-4 text-right">
          <button onclick="estimateDetailsStep.removeLineItem(${index})"
                  class="text-red-600 hover:text-red-900">
            <span class="mdi mdi-delete"></span>
          </button>
        </td>
      </tr>
    `).join('');
  }

  renderTotals() {
    return `
      <tr>
        <td colspan="4" class="px-6 py-4 text-right font-medium">
          Total Amount:
        </td>
        <td colspan="2" class="px-6 py-4 font-bold">
          ${this.formatCurrency(this.calculateTotal())}
        </td>
      </tr>
    `;
  }

  addLineItem() {
    this.lineItems.push({
      itemService: '',
      description: '',
      qtyHours: 0,
      rate: 0
    });
    this.render();
  }

  updateLineItem(index, field, value) {
    this.lineItems[index][field] = value;
    this.calculateTotal();
    this.render();
  }

  removeLineItem(index) {
    this.lineItems.splice(index, 1);
    this.calculateTotal();
    this.render();
  }

  calculateTotal() {
    this.totals.subtotal = this.lineItems.reduce(
      (sum, item) => sum + (item.qtyHours * item.rate),
      0
    );
    return this.totals.subtotal;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  async validate() {
    if (!this.lineItems.length) {
      NotificationSystem.notify({
        type: 'error',
        message: 'At least one line item is required'
      });
      return false;
    }

    const invalidItems = this.lineItems.filter(item => 
      !item.itemService || 
      !item.description || 
      !item.qtyHours || 
      !item.rate
    );

    if (invalidItems.length) {
      NotificationSystem.notify({
        type: 'error',
        message: 'All line items must be completely filled out'
      });
      return false;
    }

    return true;
  }
}

// filepath: /workspaces/AKC-GEMINI/src/client/components/Estimates/Steps/EstimateReviewStep.js
class EstimateReviewStep {
  constructor() {
    this.estimate = null;
  }

  async initialize() {
    this.estimate = await EstimateManager.gatherEstimateData();
  }

  render() {
    return `
      <div class="space-y-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900">Review Estimate</h3>
          <p class="text-sm text-gray-500">Review and confirm your estimate details</p>
        </div>

        <!-- Customer Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Customer Information</h4>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${this.renderCustomerDetails()}
          </dl>
        </div>

        <!-- Project Details -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Project Details</h4>
          <dl class="grid grid-cols-1 gap-4">
            ${this.renderProjectDetails()}
          </dl>
        </div>

        <!-- Line Items -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Line Items</h4>
          <div class="overflow-x-auto">
            ${this.renderLineItemsTable()}
          </div>
        </div>

        <!-- Preview Button -->
        <div class="flex justify-end space-x-4">
          <button onclick="estimateReviewStep.previewEstimate()"
                  class="btn-secondary">
            <span class="mdi mdi-eye mr-2"></span>
            Preview Estimate
          </button>
        </div>
      </div>
    `;
  }

  renderCustomerDetails() {
    const customer = this.estimate.customer;
    return `
      <div>
        <dt class="text-sm font-medium text-gray-500">Customer Name</dt>
        <dd class="mt-1 text-sm text-gray-900">${customer.name}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-gray-500">Contact Email</dt>
        <dd class="mt-1 text-sm text-gray-900">${customer.email || 'N/A'}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-gray-500">Phone</dt>
        <dd class="mt-1 text-sm text-gray-900">${customer.phone || 'N/A'}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-gray-500">Address</dt>
        <dd class="mt-1 text-sm text-gray-900">${this.formatAddress(customer)}</dd>
      </div>
    `;
  }

  renderProjectDetails() {
    return `
      <div>
        <dt class="text-sm font-medium text-gray-500">Project Name</dt>
        <dd class="mt-1 text-sm text-gray-900">${this.estimate.projectName}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-gray-500">Scope of Work</dt>
        <dd class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">${this.estimate.scopeOfWork}</dd>
      </div>
    `;
  }

  renderLineItemsTable() {
    return `
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Item/Service
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Description
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Qty/Hours
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Rate
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${this.renderLineItems()}
        </tbody>
        <tfoot class="bg-gray-50">
          ${this.renderTotals()}
        </tfoot>
      </table>
    `;
  }

  renderLineItems() {
    return this.estimate.lineItems.map(item => `
      <tr>
        <td class="px-6 py-4 text-sm text-gray-900">${item.itemService}</td>
        <td class="px-6 py-4 text-sm text-gray-900">${item.description}</td>
        <td class="px-6 py-4 text-sm text-gray-900">${item.qtyHours}</td>
        <td class="px-6 py-4 text-sm text-gray-900">${this.formatCurrency(item.rate)}</td>
        <td class="px-6 py-4 text-sm text-gray-900">${this.formatCurrency(item.qtyHours * item.rate)}</td>
      </tr>
    `).join('');
  }

  renderTotals() {
    const total = this.calculateTotal();
    return `
      <tr>
        <td colspan="4" class="px-6 py-4 text-right font-medium text-gray-900">
          Total Amount:
        </td>
        <td class="px-6 py-4 font-bold text-gray-900">
          ${this.formatCurrency(total)}
        </td>
      </tr>
    `;
  }

  formatAddress(customer) {
    return [
      customer.address,
      customer.city,
      customer.state,
      customer.zip
    ].filter(Boolean).join(', ');
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  calculateTotal() {
    return this.estimate.lineItems.reduce(
      (sum, item) => sum + (item.qtyHours * item.rate),
      0
    );
  }

  async previewEstimate() {
    try {
      const preview = await google.script.run
        .withSuccessHandler(url => {
          window.open(url, '_blank');
        })
        .withFailureHandler(error => {
          throw error;
        })
        .generateEstimatePreview(this.estimate);
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'EstimateReviewStep.previewEstimate'
      });
    }
  }

  async validate() {
    // Final validation before submission
    return true;
  }
}
class VendorManager {
  constructor() {
    this.vendors = [];
    this.currentVendor = null;
    this.receipts = [];
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Vendor Management</h2>
            <p class="text-sm text-gray-500">Manage vendors and material receipts</p>
          </div>
          <button onclick="vendorManager.showNewVendorModal()"
                  class="btn-primary">
            <span class="mdi mdi-plus mr-2"></span>
            Add Vendor
          </button>
        </div>

        <!-- Vendor List -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created On
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spend
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${this.renderVendorRows()}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Material Receipts Section -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Recent Material Receipts</h3>
            <button onclick="vendorManager.showNewReceiptModal()"
                    class="btn-secondary">
              <span class="mdi mdi-receipt mr-2"></span>
              Add Receipt
            </button>
          </div>
          ${this.renderRecentReceipts()}
        </div>

        <!-- New Vendor Modal -->
        <div id="new-vendor-modal" class="modal hidden">
          ${this.renderNewVendorForm()}
        </div>

        <!-- New Receipt Modal -->
        <div id="new-receipt-modal" class="modal hidden">
          ${this.renderNewReceiptForm()}
        </div>
      </div>
    `;
  }

  renderVendorRows() {
    if (!this.vendors.length) {
      return `
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-gray-500">
            No vendors found
          </td>
        </tr>
      `;
    }

    return this.vendors.map(vendor => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${vendor.VendorName}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                       ${this.getStatusClasses(vendor.Status)}">
            ${vendor.Status}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${this.formatDate(vendor.CreatedOn)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${this.formatCurrency(this.calculateTotalSpend(vendor.VendorID))}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button onclick="vendorManager.viewVendorDetails('${vendor.VendorID}')"
                  class="text-blue-600 hover:text-blue-900 mr-3">
            View
          </button>
          <button onclick="vendorManager.editVendor('${vendor.VendorID}')"
                  class="text-indigo-600 hover:text-indigo-900">
            Edit
          </button>
        </td>
      </tr>
    `).join('');
  }

  renderRecentReceipts() {
    if (!this.receipts.length) {
      return `
        <div class="text-center text-gray-500 py-4">
          No recent receipts
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        ${this.receipts.map(receipt => `
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <span class="mdi mdi-receipt text-2xl text-gray-400"></span>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">
                  ${receipt.VendorName}
                </div>
                <div class="text-sm text-gray-500">
                  Project: ${receipt.ProjectID}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">
                ${this.formatCurrency(receipt.Amount)}
              </div>
              <div class="text-xs text-gray-500">
                ${this.formatDate(receipt.CreatedOn)}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderNewVendorForm() {
    return `
      <div class="bg-white rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Vendor</h3>
        <form id="new-vendor-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Vendor Name
            </label>
            <input type="text" 
                   name="vendorName"
                   class="mt-1 input-field"
                   required>
          </div>

          <div class="mt-5 flex justify-end space-x-3">
            <button type="button"
                    onclick="vendorManager.closeNewVendorModal()"
                    class="btn-secondary">
              Cancel
            </button>
            <button type="submit"
                    onclick="vendorManager.createVendor(event)"
                    class="btn-primary">
              Create Vendor
            </button>
          </div>
        </form>
      </div>
    `;
  }

  renderNewReceiptForm() {
    return `
      <div class="bg-white rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Add Material Receipt</h3>
        <form id="new-receipt-form" class="space-y-4">
          <!-- Vendor Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Vendor
            </label>
            <select name="vendorId" 
                    class="mt-1 input-field" 
                    required>
              <option value="">Select Vendor</option>
              ${this.vendors.map(vendor => `
                <option value="${vendor.VendorID}">${vendor.VendorName}</option>
              `).join('')}
            </select>
          </div>

          <!-- Project Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Project
            </label>
            <select name="projectId" 
                    class="mt-1 input-field" 
                    required>
              <option value="">Select Project</option>
              ${this.projects?.map(project => `
                <option value="${project.ProjectID}">${project.ProjectName}</option>
              `).join('')}
            </select>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input type="number"
                   name="amount"
                   step="0.01"
                   min="0"
                   class="mt-1 input-field"
                   required>
          </div>

          <!-- Receipt Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Receipt Document
            </label>
            <div class="mt-1 flex items-center">
              <input type="file"
                     name="receiptFile"
                     accept="image/*,.pdf"
                     class="hidden"
                     id="receipt-file-input">
              <button type="button"
                      onclick="document.getElementById('receipt-file-input').click()"
                      class="btn-secondary text-sm">
                <span class="mdi mdi-upload mr-2"></span>
                Upload Receipt
              </button>
              <span id="selected-file-name" class="ml-3 text-sm text-gray-500"></span>
            </div>
          </div>

          <div class="mt-5 flex justify-end space-x-3">
            <button type="button"
                    onclick="vendorManager.closeNewReceiptModal()"
                    class="btn-secondary">
              Cancel
            </button>
            <button type="submit"
                    onclick="vendorManager.submitReceipt(event)"
                    class="btn-primary">
              Submit Receipt
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async createVendor(event) {
    event.preventDefault();
    const form = document.getElementById('new-vendor-form');
    const formData = new FormData(form);

    try {
      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .createVendorForClient({
          vendorName: formData.get('vendorName')
        });

      this.vendors.push(response);
      this.closeNewVendorModal();
      
      NotificationSystem.notify({
        type: 'success',
        message: 'Vendor created successfully'
      });

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'VendorManager.createVendor'
      });
    }
  }

  async submitReceipt(event) {
    event.preventDefault();
    const form = document.getElementById('new-receipt-form');
    const formData = new FormData(form);
    const fileInput = document.getElementById('receipt-file-input');

    try {
      // Upload file first if present
      let receiptDocURL = null;
      if (fileInput.files.length > 0) {
        receiptDocURL = await this.uploadReceiptFile(fileInput.files[0]);
      }

      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .submitMaterialsReceipt({
          projectId: formData.get('projectId'),
          vendorId: formData.get('vendorId'),
          vendorName: this.vendors.find(v => v.VendorID === formData.get('vendorId'))?.VendorName,
          amount: parseFloat(formData.get('amount')),
          receiptDocURL,
          forUserEmail: AuthManager.getCurrentUser().email
        });

      this.receipts.unshift(response);
      this.closeNewReceiptModal();

      NotificationSystem.notify({
        type: 'success',
        message: 'Receipt submitted successfully'
      });

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'VendorManager.submitReceipt'
      });
    }
  }

  getStatusClasses(status) {
    const classes = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || classes.PENDING;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  calculateTotalSpend(vendorId) {
    return this.receipts
      .filter(receipt => receipt.VendorID === vendorId)
      .reduce((sum, receipt) => sum + receipt.Amount, 0);
  }
}
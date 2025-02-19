class MaterialsList {
  constructor() {
    this.materials = [];
    this.filters = {
      projectId: null,
      vendorId: null,
      dateRange: null
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Materials & Receipts</h1>
            <p class="text-sm text-gray-500">Track project materials and expenses</p>
          </div>
          <div class="flex space-x-3">
            <button onclick="materialsList.showVendorManager()" 
                    class="btn-secondary">
              <span class="mdi mdi-store-settings mr-2"></span>
              Manage Vendors
            </button>
            <button onclick="materialsList.addNewReceipt()" 
                    class="btn-primary">
              <span class="mdi mdi-receipt mr-2"></span>
              Add Receipt
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Project</label>
              <select onchange="materialsList.filterByProject(this.value)" 
                      class="mt-1 input-field">
                <option value="">All Projects</option>
                ${this.renderProjectOptions()}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Vendor</label>
              <select onchange="materialsList.filterByVendor(this.value)" 
                      class="mt-1 input-field">
                <option value="">All Vendors</option>
                ${this.renderVendorOptions()}
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Date Range</label>
              <div class="flex space-x-2">
                <input type="date" 
                       class="mt-1 input-field" 
                       onchange="materialsList.filterByStartDate(this.value)">
                <input type="date" 
                       class="mt-1 input-field" 
                       onchange="materialsList.filterByEndDate(this.value)">
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Total Materials Cost</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">
              ${this.formatCurrency(this.getTotalMaterialsCost())}
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Receipts Count</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">${this.materials.length}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Active Vendors</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">${this.getUniqueVendorsCount()}</p>
          </div>
        </div>

        <!-- Materials Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt Details
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${this.renderMaterialRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderMaterialRows() {
    return this.materials.map(material => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">
            Receipt ID: ${material.ReceiptID}
          </div>
          <div class="text-sm text-gray-500">
            ${new Date(material.CreatedOn).toLocaleDateString()}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${material.ProjectID}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${material.VendorName}</div>
          <div class="text-sm text-gray-500">ID: ${material.VendorID}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">
            ${this.formatCurrency(material.Amount)}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${material.SubmittingUser}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          ${this.renderActions(material)}
        </td>
      </tr>
    `).join('');
  }

  renderActions(material) {
    const actions = [];
    
    if (material.ReceiptDocURL) {
      actions.push(`
        <a href="${material.ReceiptDocURL}" 
           target="_blank" 
           class="text-blue-600 hover:text-blue-900 mr-3">
          View Receipt
        </a>
      `);
    }

    actions.push(`
      <button onclick="materialsList.editReceipt('${material.ReceiptID}')"
              class="text-blue-600 hover:text-blue-900">
        Edit
      </button>
    `);

    return actions.join('');
  }
}
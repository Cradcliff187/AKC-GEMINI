class EstimatesList {
  constructor() {
    this.estimates = [];
    this.filters = {
      status: 'all',
      dateRange: null,
      search: ''
    };
    this.statuses = {
      DRAFT: { color: 'gray', icon: 'edit' },
      PENDING: { color: 'yellow', icon: 'clock' },
      APPROVED: { color: 'green', icon: 'check' },
      REJECTED: { color: 'red', icon: 'x' },
      COMPLETED: { color: 'blue', icon: 'flag' },
      CANCELLED: { color: 'gray', icon: 'ban' },
      CLOSED: { color: 'gray', icon: 'archive' }
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Estimates</h1>
            <p class="text-sm text-gray-500">Create and manage project estimates</p>
          </div>
          <button onclick="estimatesList.startNewEstimate()" 
                  class="btn-primary">
            <span class="mdi mdi-plus mr-2"></span>
            New Estimate
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select onchange="estimatesList.filterByStatus(this.value)" 
                      class="mt-1 input-field">
                <option value="all">All Statuses</option>
                ${Object.keys(this.statuses).map(status => `
                  <option value="${status}">${status}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date Range</label>
              <input type="date" class="mt-1 input-field" 
                     onchange="estimatesList.filterByDate(this.value)">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Search</label>
              <div class="relative mt-1">
                <input type="text" 
                       placeholder="Search estimates..." 
                       class="input-field pl-10"
                       onkeyup="estimatesList.handleSearch(this.value)">
                <span class="absolute left-3 top-2 text-gray-400">
                  <span class="mdi mdi-magnify"></span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estimates Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimate
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${this.renderEstimateRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderEstimateRows() {
    return this.estimates.map(estimate => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${estimate.EstimateID}</div>
          <div class="text-sm text-gray-500">Version ${estimate.VersionNumber}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${estimate.ProjectID}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${estimate.CustomerID}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">
            ${this.formatCurrency(estimate.EstimatedAmount)}
          </div>
          ${estimate.ContingencyAmount ? `
            <div class="text-xs text-gray-500">
              +${this.formatCurrency(estimate.ContingencyAmount)} contingency
            </div>
          ` : ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                       bg-${this.statuses[estimate.Status].color}-100 
                       text-${this.statuses[estimate.Status].color}-800">
            <span class="mdi mdi-${this.statuses[estimate.Status].icon} mr-1"></span>
            ${estimate.Status}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${new Date(estimate.DateCreated).toLocaleDateString()}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          ${this.renderActions(estimate)}
        </td>
      </tr>
    `).join('');
  }

  renderActions(estimate) {
    const actions = [];
    
    if (estimate.DocUrl) {
      actions.push(`
        <a href="${estimate.DocUrl}" target="_blank" 
           class="text-blue-600 hover:text-blue-900 mr-3">
          View
        </a>
      `);
    }

    switch (estimate.Status) {
      case 'DRAFT':
        actions.push(`
          <button onclick="estimatesList.editEstimate('${estimate.EstimateID}')"
                  class="text-blue-600 hover:text-blue-900 mr-3">
            Edit
          </button>
          <button onclick="estimatesList.submitForReview('${estimate.EstimateID}')"
                  class="text-green-600 hover:text-green-900">
            Submit
          </button>
        `);
        break;
      case 'PENDING':
        if (this.userCanApprove()) {
          actions.push(`
            <button onclick="estimatesList.approveEstimate('${estimate.EstimateID}')"
                    class="text-green-600 hover:text-green-900 mr-3">
              Approve
            </button>
            <button onclick="estimatesList.rejectEstimate('${estimate.EstimateID}')"
                    class="text-red-600 hover:text-red-900">
              Reject
            </button>
          `);
        }
        break;
      case 'APPROVED':
        actions.push(`
          <button onclick="estimatesList.createVersion('${estimate.EstimateID}')"
                  class="text-blue-600 hover:text-blue-900 mr-3">
            New Version
          </button>
        `);
        break;
    }

    return actions.join('');
  }
}
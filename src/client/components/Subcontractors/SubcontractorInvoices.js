class SubcontractorInvoices {
  constructor(subId) {
    this.subId = subId;
    this.invoices = [];
    this.filters = {
      status: 'all',
      dateRange: null,
      projectId: null
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Subcontractor Invoices</h2>
            <p class="text-sm text-gray-500">Manage invoices for ${this.subcontractor?.SubName}</p>
          </div>
          <button onclick="subcontractorInvoices.addInvoice()" 
                  class="btn-primary">
            <span class="mdi mdi-file-plus mr-2"></span>
            New Invoice
          </button>
        </div>

        <!-- Invoice Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Total Outstanding</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">
              ${this.formatCurrency(this.getTotalOutstanding())}
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Pending Approval</h3>
            <p class="mt-2 text-3xl font-bold text-yellow-600">
              ${this.getPendingCount()}
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Paid Last 30 Days</h3>
            <p class="mt-2 text-3xl font-bold text-green-600">
              ${this.formatCurrency(this.getPaidLast30Days())}
            </p>
          </div>
        </div>

        <!-- Invoices Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Details
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${this.renderInvoiceRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderInvoiceRows() {
    return this.invoices.map(invoice => `
      <tr>
        <td class="px-6 py-4">
          <div class="text-sm font-medium text-gray-900">
            ${invoice.InvoiceNumber}
          </div>
          <div class="text-sm text-gray-500">
            Submitted: ${new Date(invoice.DateSubmitted).toLocaleDateString()}
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-gray-900">${invoice.ProjectID}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm font-medium text-gray-900">
            ${this.formatCurrency(invoice.Amount)}
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                     ${this.getStatusClasses(invoice.Status)}">
            ${invoice.Status}
          </span>
        </td>
        <td class="px-6 py-4 text-right text-sm font-medium">
          ${this.renderInvoiceActions(invoice)}
        </td>
      </tr>
    `).join('');
  }

  getStatusClasses(status) {
    const classes = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      PAID: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return classes[status] || classes.DRAFT;
  }
}
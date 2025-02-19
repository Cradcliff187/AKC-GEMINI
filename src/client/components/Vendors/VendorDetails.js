class VendorDetails {
  constructor(vendorId) {
    this.vendorId = vendorId;
    this.vendor = null;
    this.receipts = [];
    this.totalSpend = 0;
    this.monthlySpend = [];
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Vendor Header -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900">${this.vendor?.VendorName}</h2>
              <div class="mt-1 flex items-center">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium
                           ${this.getStatusClasses(this.vendor?.Status)}">
                  ${this.vendor?.Status}
                </span>
                <span class="mx-2 text-gray-300">|</span>
                <span class="text-sm text-gray-500">Vendor ID: ${this.vendorId}</span>
              </div>
            </div>
            <button onclick="vendorDetails.editVendor()"
                    class="btn-secondary">
              <span class="mdi mdi-pencil mr-2"></span>
              Edit Vendor
            </button>
          </div>
        </div>

        <!-- Spend Analytics -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Monthly Spend Chart -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Monthly Spend</h3>
            <div class="h-64">
              <canvas id="monthlySpendChart"></canvas>
            </div>
          </div>

          <!-- Spend Summary -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Spend Summary</h3>
            <dl class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <dt class="text-sm font-medium text-gray-500">Total Spend</dt>
                <dd class="mt-1 text-2xl font-semibold text-gray-900">
                  ${this.formatCurrency(this.totalSpend)}
                </dd>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <dt class="text-sm font-medium text-gray-500">Last 30 Days</dt>
                <dd class="mt-1 text-2xl font-semibold text-gray-900">
                  ${this.formatCurrency(this.getLastMonthSpend())}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Recent Receipts -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Material Receipts</h3>
            <button onclick="vendorDetails.showNewReceiptModal()"
                    class="btn-secondary">
              <span class="mdi mdi-plus mr-2"></span>
              Add Receipt
            </button>
          </div>
          ${this.renderReceiptsTable()}
        </div>

        <!-- Projects Using This Vendor -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Associated Projects</h3>
          ${this.renderProjectsList()}
        </div>
      </div>
    `;
  }

  renderReceiptsTable() {
    if (!this.receipts.length) {
      return `
        <div class="text-center text-gray-500 py-4">
          No receipts found for this vendor
        </div>
      `;
    }

    return `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
            ${this.receipts.map(receipt => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${this.formatDate(receipt.CreatedOn)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${receipt.ProjectName}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${this.formatCurrency(receipt.Amount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                             ${this.getReceiptStatusClasses(receipt.Status)}">
                    ${receipt.Status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onclick="vendorDetails.viewReceipt('${receipt.ReceiptID}')"
                          class="text-blue-600 hover:text-blue-900 mr-3">
                    View
                  </button>
                  <button onclick="vendorDetails.downloadReceipt('${receipt.ReceiptID}')"
                          class="text-gray-600 hover:text-gray-900">
                    <span class="mdi mdi-download"></span>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async initializeCharts() {
    const ctx = document.getElementById('monthlySpendChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.monthlySpend.map(m => m.month),
        datasets: [{
          label: 'Monthly Spend',
          data: this.monthlySpend.map(m => m.amount),
          borderColor: '#10B981',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => this.formatCurrency(value)
            }
          }
        }
      }
    });
  }

  async loadVendorData() {
    try {
      const [vendorData, receiptsData, spendData] = await Promise.all([
        this.fetchVendorDetails(),
        this.fetchVendorReceipts(),
        this.fetchVendorSpendAnalytics()
      ]);

      this.vendor = vendorData;
      this.receipts = receiptsData;
      this.monthlySpend = spendData.monthly;
      this.totalSpend = spendData.total;

      await this.initializeCharts();
      
    } catch (error) {
      ErrorHandler.handleError(error, {
        context:
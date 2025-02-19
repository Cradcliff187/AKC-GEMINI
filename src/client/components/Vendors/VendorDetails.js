class VendorDetails {
  constructor(vendorId) {
    this.vendorId = vendorId;
    this.vendor = null;
    this.totalSpend = 0;
    this.receipts = [];
    this.metrics = {
      totalSpend: 0,
      receiptCount: 0,
      activeProjects: 0,
      recentActivity: []
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Vendor Header -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900">${this.vendor?.VendorName}</h2>
              <p class="text-sm text-gray-500">ID: ${this.vendorId}</p>
            </div>
            <div class="flex items-center space-x-4">
              <button onclick="vendorDetails.editVendor()"
                      class="btn-secondary">
                <span class="mdi mdi-pencil mr-2"></span>
                Edit Vendor
              </button>
            </div>
          </div>
        </div>

        <!-- Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${this.renderMetricsCards()}
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Spend Over Time</h3>
            <canvas id="vendor-spend-chart"></canvas>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Project Distribution</h3>
            <canvas id="vendor-projects-chart"></canvas>
          </div>
        </div>

        <!-- Receipts List -->
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
      </div>
    `;
  }

  renderReceiptsTable() {
    if (!this.receipts.length) {
      return `
        <div class="text-center text-gray-500 py-4">
          No receipts found
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
    try {
      // Initialize spend over time chart
      const spendChart = new Chart(
        document.getElementById('vendor-spend-chart'),
        this.getSpendChartConfig()
      );

      // Initialize projects distribution chart
      const projectsChart = new Chart(
        document.getElementById('vendor-projects-chart'),
        this.getProjectsChartConfig()
      );

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'VendorDetails.initializeCharts',
        vendorId: this.vendorId,
        operation: 'Initializing vendor charts'
      });
    }
  }

  async loadVendorData() {
    try {
      // Load vendor details
      const vendorData = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .getVendorDetails(this.vendorId);

      this.vendor = vendorData;

      // Load spend metrics
      const spendData = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .getVendorSpendMetrics(this.vendorId);

      this.totalSpend = spendData.total;
      this.receipts = spendData.receipts;
      this.metrics = {
        totalSpend: spendData.total,
        receiptCount: spendData.receipts.length,
        activeProjects: spendData.activeProjects,
        recentActivity: spendData.recentActivity
      };

      await this.initializeCharts();
      
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'VendorDetails.loadVendorData',
        vendorId: this.vendorId,
        operation: 'Loading vendor data and metrics'
      });
    }
  }

  renderMetricsCards() {
    return `
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="mdi mdi-cash text-2xl text-green-500"></span>
          </div>
          <div class="ml-4">
            <h4 class="text-sm font-medium text-gray-500">Total Spend</h4>
            <p class="mt-1 text-xl font-semibold text-gray-900">
              ${this.formatCurrency(this.metrics.totalSpend)}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="mdi mdi-receipt text-2xl text-blue-500"></span>
          </div>
          <div class="ml-4">
            <h4 class="text-sm font-medium text-gray-500">Total Receipts</h4>
            <p class="mt-1 text-xl font-semibold text-gray-900">
              ${this.metrics.receiptCount}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="mdi mdi-briefcase text-2xl text-purple-500"></span>
          </div>
          <div class="ml-4">
            <h4 class="text-sm font-medium text-gray-500">Active Projects</h4>
            <p class="mt-1 text-xl font-semibold text-gray-900">
              ${this.metrics.activeProjects}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
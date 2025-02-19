class ReportGenerator {
  static reportTypes = {
    PROJECT_SUMMARY: 'projectSummary',
    FINANCIAL_SUMMARY: 'financialSummary',
    TIME_TRACKING: 'timeTracking',
    MATERIALS_USAGE: 'materialsUsage',
    ESTIMATE_ANALYSIS: 'estimateAnalysis',
    CUSTOMER_ACTIVITY: 'customerActivity'
  };

  static async generateReport(type, parameters = {}) {
    try {
      const reportData = await this.fetchReportData(type, parameters);
      const formattedData = this.formatReportData(type, reportData);
      return this.renderReport(type, formattedData);
    } catch (error) {
      ErrorHandler.handleError(error, { context: 'ReportGenerator', reportType: type });
      throw error;
    }
  }

  static async fetchReportData(type, parameters) {
    const dataFetchers = {
      [this.reportTypes.PROJECT_SUMMARY]: this.fetchProjectSummaryData,
      [this.reportTypes.FINANCIAL_SUMMARY]: this.fetchFinancialData,
      [this.reportTypes.TIME_TRACKING]: this.fetchTimeTrackingData,
      [this.reportTypes.MATERIALS_USAGE]: this.fetchMaterialsData,
      [this.reportTypes.ESTIMATE_ANALYSIS]: this.fetchEstimateData,
      [this.reportTypes.CUSTOMER_ACTIVITY]: this.fetchCustomerActivityData
    };

    const fetcher = dataFetchers[type];
    if (!fetcher) {
      throw new Error(`Unsupported report type: ${type}`);
    }

    return fetcher(parameters);
  }

  static formatReportData(type, data) {
    const formatters = {
      [this.reportTypes.FINANCIAL_SUMMARY]: (data) => ({
        ...data,
        totalRevenue: this.formatCurrency(data.totalRevenue),
        totalCosts: this.formatCurrency(data.totalCosts),
        profit: this.formatCurrency(data.profit),
        profitMargin: `${(data.profitMargin * 100).toFixed(2)}%`
      }),
      [this.reportTypes.TIME_TRACKING]: (data) => ({
        ...data,
        totalHours: parseFloat(data.totalHours).toFixed(2),
        laborCost: this.formatCurrency(data.laborCost)
      })
    };

    return formatters[type] ? formatters[type](data) : data;
  }

  static renderReport(type, data) {
    return `
      <div class="report-container bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">${this.getReportTitle(type)}</h2>
            <p class="text-sm text-gray-500">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="flex space-x-3">
            <button onclick="ReportGenerator.exportToPDF()" class="btn-secondary">
              <span class="mdi mdi-file-pdf mr-2"></span>
              Export PDF
            </button>
            <button onclick="ReportGenerator.exportToExcel()" class="btn-secondary">
              <span class="mdi mdi-file-excel mr-2"></span>
              Export Excel
            </button>
          </div>
        </div>

        ${this.renderReportContent(type, data)}
      </div>
    `;
  }

  static renderReportContent(type, data) {
    const renderers = {
      [this.reportTypes.PROJECT_SUMMARY]: this.renderProjectSummary,
      [this.reportTypes.FINANCIAL_SUMMARY]: this.renderFinancialSummary,
      [this.reportTypes.TIME_TRACKING]: this.renderTimeTracking,
      [this.reportTypes.MATERIALS_USAGE]: this.renderMaterialsUsage,
      [this.reportTypes.ESTIMATE_ANALYSIS]: this.renderEstimateAnalysis,
      [this.reportTypes.CUSTOMER_ACTIVITY]: this.renderCustomerActivity
    };

    return renderers[type] ? renderers[type](data) : '';
  }

  static renderProjectSummary(data) {
    return `
      <div class="space-y-6">
        <!-- Project Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500">Total Projects</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">${data.totalProjects}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500">Active Projects</h3>
            <p class="mt-2 text-3xl font-bold text-blue-600">${data.activeProjects}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500">Completed Projects</h3>
            <p class="mt-2 text-3xl font-bold text-green-600">${data.completedProjects}</p>
          </div>
        </div>

        <!-- Project Status Breakdown -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Project Status Breakdown</h3>
          <div class="relative">
            <canvas id="projectStatusChart"></canvas>
          </div>
        </div>

        <!-- Recent Projects -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Projects</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  ${['Project Name', 'Customer', 'Status', 'Start Date', 'Progress'].map(header => `
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ${header}
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${data.recentProjects.map(project => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">${project.ProjectName}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">${project.CustomerName}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="status-badge status-${project.Status.toLowerCase()}">${project.Status}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${new Date(project.StartDate).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${project.Progress}%"></div>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  static async initializeCharts(data) {
    const ctx = document.getElementById('projectStatusChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data.statusBreakdown),
        datasets: [{
          data: Object.values(data.statusBreakdown),
          backgroundColor: [
            '#3B82F6', // blue-500
            '#10B981', // green-500
            '#F59E0B', // yellow-500
            '#EF4444', // red-500
            '#6B7280'  // gray-500
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }

  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
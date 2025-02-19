class FinancialSummaryReport {
  static async generate(parameters = {}) {
    return `
      <div class="space-y-6">
        <!-- Financial Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p class="mt-2 text-3xl font-bold text-green-600">${parameters.totalRevenue}</p>
            <p class="mt-1 text-sm text-gray-500">
              <span class="${parameters.revenueChange > 0 ? 'text-green-500' : 'text-red-500'}">
                ${parameters.revenueChange}%
              </span>
              vs last period
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p class="mt-2 text-3xl font-bold text-red-600">${parameters.totalExpenses}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Net Profit</h3>
            <p class="mt-2 text-3xl font-bold text-blue-600">${parameters.netProfit}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Profit Margin</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">${parameters.profitMargin}%</p>
          </div>
        </div>

        <!-- Expense Breakdown -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Expense Breakdown</h3>
          <div class="relative h-64">
            <canvas id="expenseBreakdownChart"></canvas>
          </div>
        </div>

        <!-- Revenue by Project -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Revenue by Project</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${parameters.projects.map(project => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${project.name}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${
                        project.status === 'COMPLETED' ? 'green' : 'blue'
                      }-100 text-${
                        project.status === 'COMPLETED' ? 'green' : 'blue'
                      }-800">
                        ${project.status}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ${project.revenue}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ${project.expenses}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      project.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }">
                      ${project.profit}
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
}

// filepath: /workspaces/AKC-GEMINI/src/client/components/Reports/TimeTrackingReport.js
class TimeTrackingReport {
  static async generate(parameters = {}) {
    return `
      <div class="space-y-6">
        <!-- Time Tracking Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Total Hours</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">${parameters.totalHours}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Projects Tracked</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">${parameters.projectsCount}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Labor Cost</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">${parameters.laborCost}</p>
          </div>
        </div>

        <!-- Time Distribution Chart -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Time Distribution by Project</h3>
          <div class="relative h-64">
            <canvas id="timeDistributionChart"></canvas>
          </div>
        </div>

        <!-- Detailed Time Entries -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Time Entries</h3>
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
                    User
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${parameters.timeEntries.map(entry => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${entry.projectName}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${entry.userName}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ${entry.hours}
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
}

// filepath: /workspaces/AKC-GEMINI/src/client/components/Reports/MaterialsUsageReport.js
class MaterialsUsageReport {
  static async generate(parameters = {}) {
    return `
      <div class="space-y-6">
        <!-- Materials Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Total Materials Cost</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">${parameters.totalCost}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Number of Receipts</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">${parameters.receiptCount}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-sm font-medium text-gray-500">Vendors Used</h3>
            <p class="mt-2 text-3xl font-bold text-gray-900">${parameters.vendorCount}</p>
          </div>
        </div>

        <!-- Materials by Vendor Chart -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Materials Cost by Vendor</h3>
          <div class="relative h-64">
            <canvas id="vendorCostChart"></canvas>
          </div>
        </div>

        <!-- Materials Receipt List -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Materials Receipts</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${parameters.receipts.map(receipt => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${new Date(receipt.date).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${receipt.vendorName}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${receipt.projectName}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ${receipt.amount}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                      ${receipt.receiptUrl ? `
                        <a href="${receipt.receiptUrl}" 
                           target="_blank"
                           class="text-blue-600 hover:text-blue-900">
                          View
                        </a>
                      ` : 'N/A'}
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
}
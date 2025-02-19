class TimeLogsList {
  constructor() {
    this.timeLogs = [];
    this.filters = {
      projectId: null,
      dateRange: null,
      userEmail: null
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Time Logs</h1>
            <p class="text-sm text-gray-500">Track and manage project hours</p>
          </div>
          <button onclick="timeLogsList.startNewTimeLog()" 
                  class="btn-primary">
            <span class="mdi mdi-clock-plus mr-2"></span>
            Log Time
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Project</label>
              <select onchange="timeLogsList.filterByProject(this.value)" 
                      class="mt-1 input-field">
                <option value="">All Projects</option>
                ${this.renderProjectOptions()}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date Range</label>
              <div class="flex space-x-2">
                <input type="date" 
                       class="mt-1 input-field" 
                       onchange="timeLogsList.filterByStartDate(this.value)">
                <input type="date" 
                       class="mt-1 input-field" 
                       onchange="timeLogsList.filterByEndDate(this.value)">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">User</label>
              <select onchange="timeLogsList.filterByUser(this.value)" 
                      class="mt-1 input-field">
                <option value="">All Users</option>
                ${this.renderUserOptions()}
              </select>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${this.renderSummaryCards()}
        </div>

        <!-- Time Logs Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Range
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${this.renderTimeLogRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderTimeLogRows() {
    return this.timeLogs.map(log => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${log.ProjectID}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">
            ${new Date(log.DateWorked).toLocaleDateString()}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">
            ${log.StartTime} - ${log.EndTime}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${log.TotalHours}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${log.ForUserEmail}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button onclick="timeLogsList.editTimeLog('${log.TimeLogID}')"
                  class="text-blue-600 hover:text-blue-900">
            Edit
          </button>
        </td>
      </tr>
    `).join('');
  }
}
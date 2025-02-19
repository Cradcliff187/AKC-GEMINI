class TimeLogManager {
  constructor() {
    this.currentLogs = [];
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
            <h2 class="text-xl font-bold text-gray-900">Time Tracking</h2>
            <p class="text-sm text-gray-500">Track and manage project hours</p>
          </div>
          <button onclick="timeLogManager.openTimeEntryModal()" 
                  class="btn-primary">
            <span class="mdi mdi-plus-circle mr-2"></span>
            New Time Entry
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Project</label>
              <select onchange="timeLogManager.filterByProject(this.value)" 
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
                       onchange="timeLogManager.filterByDateRange('start', this.value)">
                <input type="date" 
                       class="mt-1 input-field" 
                       onchange="timeLogManager.filterByDateRange('end', this.value)">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">User</label>
              <select onchange="timeLogManager.filterByUser(this.value)" 
                      class="mt-1 input-field">
                <option value="">All Users</option>
                ${this.renderUserOptions()}
              </select>
            </div>
          </div>
        </div>

        <!-- Time Logs Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
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
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${this.renderTimeLogs()}
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="4" class="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Total Hours:
                  </td>
                  <td class="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    ${this.calculateTotalHours()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Time Entry Modal -->
      <div id="time-entry-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        ${this.renderTimeEntryModal()}
      </div>
    `;
  }

  renderTimeEntryModal() {
    return `
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center pb-3 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Log Time Entry</h3>
          <button onclick="timeLogManager.closeTimeEntryModal()" 
                  class="text-gray-400 hover:text-gray-500">
            <span class="mdi mdi-close"></span>
          </button>
        </div>

        <form id="time-entry-form" class="mt-4 space-y-4">
          <!-- Project Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Project</label>
            <select name="projectId" class="mt-1 input-field" required>
              <option value="">Select Project</option>
              ${this.renderProjectOptions()}
            </select>
          </div>

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" 
                   name="dateWorked" 
                   class="mt-1 input-field" 
                   required>
          </div>

          <!-- Time Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="time" 
                     name="startTime" 
                     class="mt-1 input-field" 
                     required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">End Time</label>
              <input type="time" 
                     name="endTime" 
                     class="mt-1 input-field" 
                     required>
            </div>
          </div>

          <!-- For User -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Log For User</label>
            <select name="forUserEmail" class="mt-1 input-field">
              <option value="">Self</option>
              ${this.renderUserOptions()}
            </select>
          </div>

          <div class="mt-5 border-t pt-4 flex justify-end space-x-3">
            <button type="button" 
                    onclick="timeLogManager.closeTimeEntryModal()" 
                    class="btn-secondary">
              Cancel
            </button>
            <button type="submit" 
                    onclick="timeLogManager.handleTimeEntry(event)" 
                    class="btn-primary">
              Save Entry
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async handleTimeEntry(event) {
    event.preventDefault();
    const form = document.getElementById('time-entry-form');
    const formData = new FormData(form);

    try {
      const timeLogData = {
        projectId: formData.get('projectId'),
        dateWorked: formData.get('dateWorked'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        forUserEmail: formData.get('forUserEmail') || AuthManager.getCurrentUser().email
      };

      // Validate time entry
      this.validateTimeEntry(timeLogData);

      await google.script.run
        .withSuccessHandler(() => {
          NotificationSystem.notify({
            type: 'success',
            message: 'Time entry logged successfully'
          });
          this.closeTimeEntryModal();
          this.refreshTimeLogs();
        })
        .withFailureHandler(error => {
          throw error;
        })
        .submitTimeLog(timeLogData);

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'TimeLogManager.handleTimeEntry',
        data: timeLogData
      });
    }
  }

  validateTimeEntry(data) {
    // Check if end time is after start time
    const start = new Date(`${data.dateWorked} ${data.startTime}`);
    const end = new Date(`${data.dateWorked} ${data.endTime}`);

    if (end <= start) {
      throw new Error('End time must be after start time');
    }

    // Check if date is not in future
    const today = new Date();
    const entryDate = new Date(data.dateWorked);
    
    if (entryDate > today) {
      throw new Error('Cannot log time for future dates');
    }

    return true;
  }

  calculateTotalHours() {
    return this.currentLogs.reduce((total, log) => {
      return total + parseFloat(log.TotalHours);
    }, 0).toFixed(2);
  }

  formatTimeRange(startTime, endTime) {
    const formatTime = (time) => {
      return new Date(`2000-01-01 ${time}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }
}
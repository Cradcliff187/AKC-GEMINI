module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }]
  ]
};class ActivityLogManager {
  static actions = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    STATUS_CHANGE: 'STATUS_CHANGE',
    DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT'
  };

  static moduleTypes = {
    PROJECT: 'PROJECT',
    CUSTOMER: 'CUSTOMER',
    ESTIMATE: 'ESTIMATE',
    TIMELOG: 'TIMELOG',
    MATERIAL: 'MATERIAL',
    SUBCONTRACTOR: 'SUBCONTRACTOR',
    VENDOR: 'VENDOR',
    DOCUMENT: 'DOCUMENT'
  };

  constructor() {
    this.currentModule = null;
    this.filters = {
      moduleType: null,
      dateRange: null,
      userEmail: null,
      action: null
    };
  }

  async logActivity(action, moduleType, referenceId, details = {}) {
    try {
      const activityData = {
        action,
        moduleType,
        referenceId,
        userEmail: AuthManager.getCurrentUser().email,
        timestamp: new Date().toISOString(),
        details: JSON.stringify(details)
      };

      await google.script.run
        .withSuccessHandler(() => {
          NotificationSystem.notify({
            message: 'Activity logged successfully',
            type: 'success'
          });
        })
        .withFailureHandler(error => {
          console.error('Failed to log activity:', error);
          throw error;
        })
        .logActivity(activityData);

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'ActivityLogManager.logActivity',
        data: { action, moduleType, referenceId }
      });
    }
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Activity Log</h1>
            <p class="text-sm text-gray-500">Track system activities and changes</p>
          </div>
          
          <!-- Filters -->
          <div class="flex space-x-4">
            <select class="input-field" 
                    onchange="activityLog.filterByModule(this.value)">
              <option value="">All Modules</option>
              ${Object.entries(this.moduleTypes).map(([key, value]) => `
                <option value="${value}">${key}</option>
              `).join('')}
            </select>

            <select class="input-field" 
                    onchange="activityLog.filterByAction(this.value)">
              <option value="">All Actions</option>
              ${Object.entries(this.actions).map(([key, value]) => `
                <option value="${value}">${key}</option>
              `).join('')}
            </select>

            <input type="date" 
                   class="input-field"
                   onchange="activityLog.filterByDate(this.value)"
                   placeholder="Filter by date">
          </div>
        </div>

        <!-- Activity Timeline -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="flow-root">
            <ul role="list" class="-mb-8">
              ${this.renderActivityItems()}
            </ul>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button onclick="activityLog.previousPage()" 
                    class="btn-secondary">
              Previous
            </button>
            <button onclick="activityLog.nextPage()" 
                    class="btn-secondary">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing page <span class="font-medium">${this.currentPage}</span> of
                <span class="font-medium">${this.totalPages}</span>
              </p>
            </div>
            <div>
              ${this.renderPagination()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderActivityItems() {
    return this.activities.map((activity, idx) => `
      <li>
        <div class="relative pb-8">
          ${idx < this.activities.length - 1 ? `
            <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                  aria-hidden="true"></span>
          ` : ''}
          <div class="relative flex space-x-3">
            <!-- Activity Icon -->
            <div>
              <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                this.getActivityIconClasses(activity.action)
              }">
                <span class="mdi ${this.getActivityIcon(activity)} text-lg"></span>
              </span>
            </div>

            <!-- Activity Content -->
            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
              <div>
                <p class="text-sm text-gray-500">
                  ${this.formatActivityMessage(activity)}
                </p>
                ${activity.details ? `
                  <div class="mt-2 text-sm text-gray-700">
                    ${this.formatActivityDetails(activity.details)}
                  </div>
                ` : ''}
              </div>
              <div class="text-right text-sm whitespace-nowrap text-gray-500">
                <time datetime="${activity.timestamp}">
                  ${this.formatTimestamp(activity.timestamp)}
                </time>
              </div>
            </div>
          </div>
        </div>
      </li>
    `).join('');
  }

  getActivityIcon(activity) {
    const icons = {
      [this.actions.CREATE]: 'mdi-plus-circle',
      [this.actions.UPDATE]: 'mdi-pencil',
      [this.actions.DELETE]: 'mdi-delete',
      [this.actions.STATUS_CHANGE]: 'mdi-refresh',
      [this.actions.DOCUMENT_UPLOAD]: 'mdi-file-upload',
      [this.actions.LOGIN]: 'mdi-login',
      [this.actions.LOGOUT]: 'mdi-logout'
    };
    return icons[activity.action] || 'mdi-information';
  }

  getActivityIconClasses(action) {
    const classes = {
      [this.actions.CREATE]: 'bg-green-100 text-green-600',
      [this.actions.UPDATE]: 'bg-blue-100 text-blue-600',
      [this.actions.DELETE]: 'bg-red-100 text-red-600',
      [this.actions.STATUS_CHANGE]: 'bg-yellow-100 text-yellow-600',
      [this.actions.DOCUMENT_UPLOAD]: 'bg-purple-100 text-purple-600',
      [this.actions.LOGIN]: 'bg-indigo-100 text-indigo-600',
      [this.actions.LOGOUT]: 'bg-gray-100 text-gray-600'
    };
    return classes[action] || 'bg-gray-100 text-gray-600';
  }

  formatActivityMessage(activity) {
    const messages = {
      [this.actions.CREATE]: `Created new ${activity.moduleType.toLowerCase()}`,
      [this.actions.UPDATE]: `Updated ${activity.moduleType.toLowerCase()}`,
      [this.actions.DELETE]: `Deleted ${activity.moduleType.toLowerCase()}`,
      [this.actions.STATUS_CHANGE]: `Changed status of ${activity.moduleType.toLowerCase()}`,
      [this.actions.DOCUMENT_UPLOAD]: `Uploaded document to ${activity.moduleType.toLowerCase()}`,
      [this.actions.LOGIN]: 'User logged in',
      [this.actions.LOGOUT]: 'User logged out'
    };

    return `${messages[activity.action]} by ${activity.userEmail}`;
  }

  formatActivityDetails(details) {
    try {
      const parsedDetails = JSON.parse(details);
      return Object.entries(parsedDetails)
        .map(([key, value]) => `
          <div class="flex items-center text-xs">
            <span class="font-medium">${key}:</span>
            <span class="ml-1">${value}</span>
          </div>
        `).join('');
    } catch (error) {
      return details;
    }
  }

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString();
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }
}
class CommunicationManager {
  static types = {
    ESTIMATE_FOLLOWUP: 'EST_FOLLOWUP',
    PAYMENT_REMINDER: 'PAYMENT_REMINDER',
    STATUS_UPDATE: 'STATUS_UPDATE'
  };

  static statuses = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    READ: 'READ',
    REPLIED: 'REPLIED',
    FAILED: 'FAILED'
  };

  constructor(customerId) {
    this.customerId = customerId;
    this.communications = [];
    this.templates = {};
    this.filters = {
      type: null,
      status: null,
      dateRange: null
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Customer Communications</h2>
            <p class="text-sm text-gray-500">Manage and track customer interactions</p>
          </div>
          <button onclick="communicationManager.newCommunication()" 
                  class="btn-primary">
            <span class="mdi mdi-plus-circle mr-2"></span>
            New Communication
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Type</label>
              <select onchange="communicationManager.filterByType(this.value)" 
                      class="mt-1 input-field">
                <option value="">All Types</option>
                ${Object.entries(this.constructor.types).map(([key, value]) => `
                  <option value="${value}">${key.replace('_', ' ')}</option>
                `).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select onchange="communicationManager.filterByStatus(this.value)" 
                      class="mt-1 input-field">
                <option value="">All Statuses</option>
                ${Object.values(this.constructor.statuses).map(status => `
                  <option value="${status}">${status}</option>
                `).join('')}
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Date Range</label>
              <div class="flex space-x-2">
                <input type="date" 
                       class="mt-1 input-field" 
                       onchange="communicationManager.filterByDateRange('start', this.value)">
                <input type="date" 
                       class="mt-1 input-field" 
                       onchange="communicationManager.filterByDateRange('end', this.value)">
              </div>
            </div>
          </div>
        </div>

        <!-- Communications List -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="divide-y divide-gray-200">
            ${this.renderCommunicationsList()}
          </div>
        </div>
      </div>
    `;
  }

  renderCommunicationsList() {
    if (!this.communications.length) {
      return this.renderEmptyState();
    }

    return this.communications.map(comm => `
      <div class="p-6 hover:bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center">
              <span class="mdi ${this.getTypeIcon(comm.Type)} text-gray-400 mr-3"></span>
              <div>
                <h3 class="text-sm font-medium text-gray-900">${comm.Subject}</h3>
                <p class="text-sm text-gray-500">${comm.SentTo}</p>
              </div>
            </div>
            <div class="mt-2">
              <p class="text-sm text-gray-600 line-clamp-2">${comm.Content}</p>
            </div>
          </div>
          <div class="ml-6 flex items-center space-x-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                       ${this.getStatusClasses(comm.Status)}">
              ${comm.Status}
            </span>
            <div class="flex items-center space-x-2">
              ${this.renderActionButtons(comm)}
            </div>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500 flex items-center">
          <span class="mdi mdi-clock-outline mr-1"></span>
          ${this.formatDate(comm.CreatedOn)}
          ${comm.LastModified ? `
            <span class="mx-2">•</span>
            <span>Modified ${this.formatDate(comm.LastModified)}</span>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  renderEmptyState() {
    return `
      <div class="p-12 text-center">
        <span class="mdi mdi-email-outline text-4xl text-gray-400"></span>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No communications</h3>
        <p class="mt-1 text-sm text-gray-500">
          Get started by creating a new communication
        </p>
        <div class="mt-6">
          <button onclick="communicationManager.newCommunication()" 
                  class="btn-primary">
            <span class="mdi mdi-plus mr-2"></span>
            New Communication
          </button>
        </div>
      </div>
    `;
  }

  renderActionButtons(comm) {
    const actions = this.getAvailableActions(comm);
    return actions.map(action => `
      <button onclick="communicationManager.handleAction('${action}', '${comm.CommunicationID}')"
              class="p-1 text-gray-400 hover:text-gray-600"
              title="${this.formatActionName(action)}">
        <span class="mdi ${this.getActionIcon(action)}"></span>
      </button>
    `).join('');
  }

  getTypeIcon(type) {
    const icons = {
      [this.constructor.types.ESTIMATE_FOLLOWUP]: 'mdi-file-document-outline',
      [this.constructor.types.PAYMENT_REMINDER]: 'mdi-currency-usd',
      [this.constructor.types.STATUS_UPDATE]: 'mdi-update'
    };
    return icons[type] || 'mdi-email-outline';
  }

  getStatusClasses(status) {
    const classes = {
      [this.constructor.statuses.DRAFT]: 'bg-gray-100 text-gray-800',
      [this.constructor.statuses.SENT]: 'bg-blue-100 text-blue-800',
      [this.constructor.statuses.DELIVERED]: 'bg-green-100 text-green-800',
      [this.constructor.statuses.READ]: 'bg-purple-100 text-purple-800',
      [this.constructor.statuses.REPLIED]: 'bg-yellow-100 text-yellow-800',
      [this.constructor.statuses.FAILED]: 'bg-red-100 text-red-800'
    };
    return classes[status] || classes[this.constructor.statuses.DRAFT];
  }

  getActionIcon(action) {
    const icons = {
      edit: 'mdi-pencil',
      send: 'mdi-send',
      delete: 'mdi-delete',
      duplicate: 'mdi-content-copy',
      archive: 'mdi-archive'
    };
    return icons[action] || 'mdi-dots-horizontal';
  }

  getAvailableActions(comm) {
    const actions = [];
    switch (comm.Status) {
      case this.constructor.statuses.DRAFT:
        actions.push('edit', 'send', 'delete');
        break;
      case this.constructor.statuses.SENT:
      case this.constructor.statuses.DELIVERED:
        actions.push('duplicate', 'archive');
        break;
      case this.constructor.statuses.FAILED:
        actions.push('edit', 'send', 'delete');
        break;
      default:
        actions.push('duplicate', 'archive');
    }
    return actions;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
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
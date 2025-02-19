class DocumentVersionControl {
  constructor(documentId) {
    this.documentId = documentId;
    this.versions = [];
    this.currentVersion = null;
  }

  render() {
    return `
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Version History</h3>
          <button onclick="documentVersionControl.createNewVersion()" 
                  class="btn-secondary text-sm">
            <span class="mdi mdi-plus mr-2"></span>
            New Version
          </button>
        </div>

        <div class="space-y-4">
          ${this.renderVersions()}
        </div>
      </div>
    `;
  }

  renderVersions() {
    return this.versions.map(version => `
      <div class="flex items-start justify-between p-3 ${
        version.Version === this.currentVersion ? 'bg-blue-50 border-blue-100' : 'bg-gray-50'
      } rounded-lg">
        <div class="flex-1">
          <div class="flex items-center">
            <span class="font-medium text-gray-900">Version ${version.Version}</span>
            ${version.Version === this.currentVersion ? `
              <span class="ml-2 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                Current
              </span>
            ` : ''}
          </div>
          <div class="mt-1 text-sm text-gray-500">
            Modified by ${version.LastModifiedBy} on ${this.formatDate(version.LastModified)}
          </div>
        </div>
        <div class="ml-4 flex items-center space-x-2">
          <button onclick="documentVersionControl.viewVersion('${version.Version}')"
                  class="text-gray-400 hover:text-gray-600">
            <span class="mdi mdi-eye"></span>
          </button>
          <button onclick="documentVersionControl.restoreVersion('${version.Version}')"
                  class="text-gray-400 hover:text-gray-600"
                  ${version.Version === this.currentVersion ? 'disabled' : ''}>
            <span class="mdi mdi-restore"></span>
          </button>
          <button onclick="documentVersionControl.downloadVersion('${version.Version}')"
                  class="text-gray-400 hover:text-gray-600">
            <span class="mdi mdi-download"></span>
          </button>
        </div>
      </div>
    `).join('');
  }
}

// filepath: /workspaces/AKC-GEMINI/src/client/components/Documents/DocumentStatusManager.js
class DocumentStatusManager {
  static statuses = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    ARCHIVED: 'ARCHIVED',
    EXPIRED: 'EXPIRED'
  };

  constructor(document) {
    this.document = document;
    this.currentStatus = document.Status;
  }

  render() {
    return `
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Document Status</h3>
          <span class="px-2 py-1 text-sm font-medium rounded-full ${
            this.getStatusClasses(this.currentStatus)
          }">
            ${this.currentStatus}
          </span>
        </div>

        <div class="space-y-4">
          ${this.renderStatusTransitions()}
        </div>
      </div>
    `;
  }

  renderStatusTransitions() {
    const allowedTransitions = this.getAllowedTransitions();
    
    return allowedTransitions.map(status => `
      <button onclick="documentStatusManager.updateStatus('${status}')"
              class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <div class="flex items-center">
          <span class="w-2 h-2 rounded-full ${this.getStatusClasses(status)}"></span>
          <span class="ml-3 text-sm font-medium text-gray-900">
            Mark as ${status}
          </span>
        </div>
      </button>
    `).join('');
  }

  getStatusClasses(status) {
    const classes = {
      [this.constructor.statuses.DRAFT]: 'bg-yellow-100 text-yellow-800',
      [this.constructor.statuses.ACTIVE]: 'bg-green-100 text-green-800',
      [this.constructor.statuses.ARCHIVED]: 'bg-gray-100 text-gray-800',
      [this.constructor.statuses.EXPIRED]: 'bg-red-100 text-red-800'
    };
    return classes[status] || classes[this.constructor.statuses.DRAFT];
  }

  getAllowedTransitions() {
    const transitions = {
      [this.constructor.statuses.DRAFT]: [
        this.constructor.statuses.ACTIVE,
        this.constructor.statuses.ARCHIVED
      ],
      [this.constructor.statuses.ACTIVE]: [
        this.constructor.statuses.ARCHIVED,
        this.constructor.statuses.EXPIRED
      ],
      [this.constructor.statuses.ARCHIVED]: [
        this.constructor.statuses.ACTIVE
      ],
      [this.constructor.statuses.EXPIRED]: [
        this.constructor.statuses.ARCHIVED
      ]
    };

    return transitions[this.currentStatus] || [];
  }
}
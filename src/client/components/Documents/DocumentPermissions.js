class DocumentPermissions {
  constructor(document) {
    this.document = document;
    this.permissions = [];
  }

  render() {
    return `
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Document Access</h3>
          <button onclick="documentPermissions.addPermission()" 
                  class="btn-secondary text-sm">
            <span class="mdi mdi-plus mr-2"></span>
            Add Access
          </button>
        </div>

        <!-- Permissions List -->
        <div class="space-y-3">
          ${this.renderPermissionsList()}
        </div>
      </div>
    `;
  }

  renderPermissionsList() {
    return this.permissions.map(permission => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center">
          <span class="mdi ${this.getPermissionIcon(permission.type)} text-gray-400 mr-3"></span>
          <div>
            <div class="text-sm font-medium text-gray-900">
              ${permission.email || 'Anyone with link'}
            </div>
            <div class="text-xs text-gray-500">
              ${this.formatPermissionType(permission.type)}
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="documentPermissions.editPermission('${permission.id}')"
                  class="text-gray-400 hover:text-gray-600">
            <span class="mdi mdi-pencil"></span>
          </button>
          <button onclick="documentPermissions.removePermission('${permission.id}')"
                  class="text-gray-400 hover:text-red-600">
            <span class="mdi mdi-delete"></span>
          </button>
        </div>
      </div>
    `).join('');
  }

  getPermissionIcon(type) {
    const icons = {
      'view': 'mdi-eye',
      'edit': 'mdi-pencil',
      'admin': 'mdi-shield-account'
    };
    return icons[type] || 'mdi-account';
  }

  formatPermissionType(type) {
    const types = {
      'view': 'Can view',
      'edit': 'Can edit',
      'admin': 'Full access'
    };
    return types[type] || type;
  }
}

// filepath: /workspaces/AKC-GEMINI/src/client/components/Documents/DocumentWorkflow.js
class DocumentWorkflow {
  constructor(document) {
    this.document = document;
    this.workflowSteps = [
      'creation',
      'review',
      'approval',
      'distribution'
    ];
  }

  render() {
    return `
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="mb-4">
          <h3 class="text-lg font-medium text-gray-900">Document Workflow</h3>
          <p class="text-sm text-gray-500">Current stage: ${this.getCurrentStage()}</p>
        </div>

        <!-- Workflow Progress -->
        <div class="relative">
          <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
            <div class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                 style="width: ${this.getProgressPercentage()}%"></div>
          </div>

          <!-- Workflow Steps -->
          <div class="flex justify-between">
            ${this.renderWorkflowSteps()}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex justify-end space-x-3">
          ${this.renderActionButtons()}
        </div>
      </div>
    `;
  }

  renderWorkflowSteps() {
    return this.workflowSteps.map((step, index) => `
      <div class="flex flex-col items-center">
        <div class="rounded-full h-8 w-8 flex items-center justify-center
                    ${this.getStepClasses(step)}">
          <span class="mdi ${this.getStepIcon(step)}"></span>
        </div>
        <div class="text-xs mt-1 ${
          this.isStepComplete(step) ? 'text-blue-600' : 'text-gray-500'
        }">
          ${this.formatStepName(step)}
        </div>
      </div>
    `).join('');
  }

  renderActionButtons() {
    const actions = this.getAvailableActions();
    return actions.map(action => `
      <button onclick="documentWorkflow.handleAction('${action}')"
              class="${this.getActionButtonClasses(action)}">
        <span class="mdi ${this.getActionIcon(action)} mr-2"></span>
        ${this.formatActionName(action)}
      </button>
    `).join('');
  }

  getStepClasses(step) {
    if (this.isStepComplete(step)) {
      return 'bg-blue-100 text-blue-600';
    }
    if (step === this.getCurrentStage()) {
      return 'bg-yellow-100 text-yellow-600';
    }
    return 'bg-gray-100 text-gray-400';
  }

  getStepIcon(step) {
    const icons = {
      'creation': 'mdi-file-plus',
      'review': 'mdi-eye-check',
      'approval': 'mdi-check-decagram',
      'distribution': 'mdi-share-variant'
    };
    return icons[step] || 'mdi-circle';
  }

  getActionButtonClasses(action) {
    switch (action) {
      case 'approve':
        return 'btn-success';
      case 'reject':
        return 'btn-danger';
      case 'submit':
        return 'btn-primary';
      default:
        return 'btn-secondary';
    }
  }

  getActionIcon(action) {
    const icons = {
      'approve': 'mdi-check',
      'reject': 'mdi-close',
      'submit': 'mdi-send',
      'review': 'mdi-eye'
    };
    return icons[action] || 'mdi-circle';
  }

  async handleAction(action) {
    try {
      // Get action confirmation if needed
      if (this.requiresConfirmation(action)) {
        const confirmed = await this.showConfirmationDialog(action);
        if (!confirmed) return;
      }

      // Validate action
      if (!this.validateAction(action)) {
        throw new Error('Invalid action for current document state');
      }

      // Execute action
      await this.executeAction(action);

      // Log activity
      await ActivityLogManager.logActivity({
        action: `DOCUMENT_${action.toUpperCase()}`,
        moduleType: 'DOCUMENT',
        referenceId: this.document.DocumentID,
        details: {
          documentType: this.document.Type,
          previousStatus: this.document.Status,
          newStatus: this.getNextStatus(action)
        }
      });

      // Update UI
      this.refreshWorkflow();

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'DocumentWorkflow.handleAction',
        action,
        documentId: this.document.DocumentID
      });
    }
  }

  validateAction(action) {
    const currentStatus = this.document.Status;
    const allowedTransitions = {
      'DRAFT': ['submit'],
      'PENDING': ['approve', 'reject'],
      'ACTIVE': ['archive'],
      'ARCHIVED': ['activate']
    };

    return allowedTransitions[currentStatus]?.includes(action);
  }
}
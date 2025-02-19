class ProjectManager {
  static statuses = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    CLOSED: 'CLOSED'
  };

  constructor() {
    this.currentProject = null;
    this.activeModules = new Set();
    this.folderStructure = {
      main: null,
      estimates: null,
      materials: null,
      subInvoices: null
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Project Header -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                ${this.currentProject?.projectName || 'Project Details'}
              </h2>
              <div class="mt-1 flex items-center">
                <span class="text-sm text-gray-500">Project ID: ${this.currentProject?.projectId}</span>
                <span class="mx-2 text-gray-300">|</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                           ${this.getStatusClasses(this.currentProject?.status)}">
                  ${this.currentProject?.status}
                </span>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center space-x-4">
              ${this.renderActionButtons()}
            </div>
          </div>
        </div>

        <!-- Project Navigation -->
        <div class="bg-white rounded-lg shadow-sm">
          <nav class="flex divide-x divide-gray-200">
            ${this.renderNavigationTabs()}
          </nav>
        </div>

        <!-- Module Content -->
        <div id="project-module-content" class="bg-white rounded-lg shadow-sm">
          ${this.renderCurrentModule()}
        </div>
      </div>
    `;
  }

  renderActionButtons() {
    const actions = this.getAvailableActions();
    return actions.map(action => `
      <button onclick="projectManager.handleAction('${action}')"
              class="${this.getActionButtonClasses(action)}">
        <span class="mdi ${this.getActionIcon(action)} mr-2"></span>
        ${this.formatActionName(action)}
      </button>
    `).join('');
  }

  renderNavigationTabs() {
    const modules = this.getAccessibleModules();
    return modules.map(module => `
      <button onclick="projectManager.switchModule('${module}')"
              class="flex-1 px-4 py-4 text-center text-sm font-medium
                     ${this.currentModule === module ? 
                       'text-blue-600 bg-blue-50' : 
                       'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}">
        <span class="mdi ${this.getModuleIcon(module)} mr-2"></span>
        ${this.formatModuleName(module)}
      </button>
    `).join('');
  }

  getAvailableActions() {
    const status = this.currentProject?.status;
    const transitions = this.constructor.workflowConfig.transitions[status] || {};
    return transitions.allowedTo || [];
  }

  getAccessibleModules() {
    const status = this.currentProject?.status;
    return this.constructor.workflowConfig.moduleAccess[status] || [];
  }

  async handleAction(action) {
    try {
      // Validate transition
      if (!this.validateStatusTransition(action)) {
        throw new Error('Invalid status transition');
      }

      // Show confirmation if required
      if (this.requiresConfirmation(action)) {
        const confirmed = await this.showConfirmationDialog(action);
        if (!confirmed) return;
      }

      // Execute transition
      await this.executeStatusTransition(action);

      // Handle side effects
      await this.handleTransitionSideEffects(action);

      // Log activity
      await ActivityLogManager.logActivity({
        action: `PROJECT_${action}`,
        moduleType: 'PROJECT',
        referenceId: this.currentProject.projectId,
        details: {
          previousStatus: this.currentProject.status,
          newStatus: action,
          projectName: this.currentProject.projectName
        }
      });

      // Refresh UI
      this.render();

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'ProjectManager.handleAction',
        action,
        projectId: this.currentProject?.projectId
      });
    }
  }

  async executeStatusTransition(newStatus) {
    try {
      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .updateProjectStatusForClient({
          projectId: this.currentProject.projectId,
          newStatus
        });

      this.currentProject.status = newStatus;
      
      NotificationSystem.notify({
        type: 'success',
        message: 'Project status updated successfully'
      });

      return response;

    } catch (error) {
      throw new Error(`Failed to update project status: ${error.message}`);
    }
  }

  async handleTransitionSideEffects(action) {
    const sideEffects = this.constructor.workflowConfig.transitions[
      this.currentProject.status
    ]?.sideEffects[action];

    if (!sideEffects) return;

    for (const effect of sideEffects) {
      switch (effect) {
        case 'createProjectFolders':
          await this.createProjectFolders();
          break;
        case 'setWorkspacePermissions':
          await this.setWorkspacePermissions();
          break;
        case 'enableTimeTracking':
          await this.enableTimeTracking();
          break;
        case 'enableMaterialsTracking':
          await this.enableMaterialsTracking();
          break;
        case 'notifyTeam':
          await this.notifyTeam(action);
          break;
        default:
          console.warn(`Unknown side effect: ${effect}`);
      }
    }
  }

  async createProjectFolders() {
    try {
      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .createProjectFolders(this.currentProject.projectId);

      this.folderStructure = response.folders;
      
      return response;

    } catch (error) {
      throw new Error(`Failed to create project folders: ${error.message}`);
    }
  }

  getStatusClasses(status) {
    const classes = {
      [this.constructor.statuses.PENDING]: 'bg-yellow-100 text-yellow-800',
      [this.constructor.statuses.APPROVED]: 'bg-green-100 text-green-800',
      [this.constructor.statuses.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [this.constructor.statuses.COMPLETED]: 'bg-purple-100 text-purple-800',
      [this.constructor.statuses.CANCELLED]: 'bg-red-100 text-red-800',
      [this.constructor.statuses.CLOSED]: 'bg-gray-100 text-gray-800'
    };
    return classes[status] || classes[this.constructor.statuses.PENDING];
  }

  getActionButtonClasses(action) {
    const classes = {
      APPROVE: 'btn-success',
      REJECT: 'btn-danger',
      START: 'btn-primary',
      COMPLETE: 'btn-warning',
      CANCEL: 'btn-secondary'
    };
    return classes[action] || 'btn-secondary';
  }

  getActionIcon(action) {
    const icons = {
      APPROVE: 'mdi-check-circle',
      REJECT: 'mdi-close-circle',
      START: 'mdi-play-circle',
      COMPLETE: 'mdi-flag-checkered',
      CANCEL: 'mdi-cancel'
    };
    return icons[action] || 'mdi-circle';
  }

  getModuleIcon(module) {
    const icons = {
      overview: 'mdi-view-dashboard',
      estimates: 'mdi-file-document',
      timeLogs: 'mdi-clock',
      materials: 'mdi-package-variant',
      documents: 'mdi-folder',
      subcontractors: 'mdi-account-hard-hat'
    };
    return icons[module] || 'mdi-circle';
  }

  formatModuleName(module) {
    return module
      .replace(/([A-Z])/g, ' $1')
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  static workflowConfig = {
    transitions: {
      PENDING: {
        allowedTo: ['APPROVED', 'CANCELLED'],
        validation: ['validateProjectApproval'],
        sideEffects: {
          APPROVED: [
            'createProjectFolders',
            'setWorkspacePermissions',
            'notifyTeam'
          ]
        },
        ui: {
          confirmationRequired: true,
          requiresComment: false,
          buttonStyle: 'primary'
        }
      },
      APPROVED: {
        allowedTo: ['IN_PROGRESS', 'CANCELLED'],
        validation: ['validateProjectStart'],
        sideEffects: {
          IN_PROGRESS: [
            'enableTimeTracking',
            'enableMaterialsTracking',
            'notifyTeam'
          ]
        },
        ui: {
          confirmationRequired: true,
          requiresComment: true,
          buttonStyle: 'success'
        }
      },
      IN_PROGRESS: {
        allowedTo: ['COMPLETED', 'CANCELLED'],
        validation: ['validateProjectCompletion'],
        sideEffects: {
          COMPLETED: [
            'finalizeAllEstimates',
            'closeAllTimeEntries',
            'generateFinalReport'
          ]
        },
        ui: {
          confirmationRequired: true,
          requiresComment: true,
          buttonStyle: 'warning'
        }
      }
    },
    moduleAccess: {
      APPROVED: ['estimates', 'documents'],
      IN_PROGRESS: ['estimates', 'documents', 'timeTracking', 'materials'],
      COMPLETED: ['documents', 'reports']
    }
  };
}
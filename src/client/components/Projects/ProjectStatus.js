class ProjectStatus {
  static states = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    CLOSED: 'CLOSED'
  };

  constructor(projectId) {
    this.projectId = projectId;
    this.currentStatus = null;
    this.statusHistory = [];
  }

  render() {
    return `
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">Project Status</h3>
          ${this.renderStatusBadge()}
        </div>

        <!-- Status Actions -->
        <div class="space-y-4">
          ${this.renderAvailableActions()}
        </div>

        <!-- Status Timeline -->
        <div class="mt-8">
          <h4 class="text-sm font-medium text-gray-700 mb-4">Status History</h4>
          <div class="flow-root">
            <ul role="list" class="-mb-8">
              ${this.renderStatusHistory()}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  renderStatusBadge() {
    const config = this.getStatusConfig(this.currentStatus);
    return `
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                   bg-${config.color}-100 text-${config.color}-800">
        <span class="mdi mdi-${config.icon} mr-2"></span>
        ${this.currentStatus}
      </span>
    `;
  }

  renderAvailableActions() {
    const transitions = this.getAllowedTransitions();
    if (!transitions.length) return '';

    return transitions.map(action => `
      <button onclick="projectStatus.handleStatusChange('${action}')"
              class="${this.getActionButtonClasses(action)} w-full justify-center">
        <span class="mdi ${this.getActionIcon(action)} mr-2"></span>
        ${this.formatActionName(action)}
      </button>
    `).join('');
  }

  renderStatusHistory() {
    return this.statusHistory.map((entry, idx) => `
      <li>
        <div class="relative pb-8">
          ${idx < this.statusHistory.length - 1 ? `
            <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                  aria-hidden="true"></span>
          ` : ''}
          <div class="relative flex space-x-3">
            <div>
              <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                          bg-${this.getStatusConfig(entry.status).color}-100">
                <span class="mdi mdi-${this.getStatusConfig(entry.status).icon} 
                           text-${this.getStatusConfig(entry.status).color}-600"></span>
              </span>
            </div>
            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
              <div>
                <p class="text-sm text-gray-500">
                  Changed to <span class="font-medium text-gray-900">${entry.status}</span> 
                  by ${entry.userEmail}
                </p>
                ${entry.comment ? `
                  <p class="mt-1 text-sm text-gray-500">${entry.comment}</p>
                ` : ''}
              </div>
              <div class="text-right text-sm whitespace-nowrap text-gray-500">
                ${this.formatDate(entry.timestamp)}
              </div>
            </div>
          </div>
        </div>
      </li>
    `).join('');
  }

  async handleStatusChange(newStatus) {
    try {
      // Get transition config
      const transitionConfig = this.getTransitionConfig(this.currentStatus, newStatus);

      // Validate transition
      if (!this.validateStatusTransition(newStatus)) {
        throw new Error('Invalid status transition');
      }

      // Show confirmation if required
      if (transitionConfig.ui.confirmationRequired) {
        const confirmed = await this.showConfirmationDialog(newStatus);
        if (!confirmed) return;
      }

      // Get comment if required
      let comment = '';
      if (transitionConfig.ui.requiresComment) {
        comment = await this.getStatusComment(newStatus);
        if (!comment) return;
      }

      // Execute transition
      await this.executeStatusTransition(newStatus, comment);

      // Handle side effects
      await this.handleTransitionSideEffects(newStatus);

      // Log activity
      await ActivityLogManager.logActivity({
        action: `PROJECT_${newStatus}`,
        moduleType: 'PROJECT',
        referenceId: this.projectId,
        details: {
          previousStatus: this.currentStatus,
          newStatus,
          comment
        }
      });

      // Refresh UI
      this.refresh();

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'ProjectStatus.handleStatusChange',
        projectId: this.projectId,
        newStatus
      });
    }
  }

  async executeStatusTransition(newStatus, comment) {
    try {
      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .updateProjectStatusForClient({
          projectId: this.projectId,
          newStatus,
          comment
        });

      this.currentStatus = newStatus;
      this.statusHistory.unshift({
        status: newStatus,
        timestamp: new Date().toISOString(),
        userEmail: AuthManager.getCurrentUser().email,
        comment
      });

      NotificationSystem.notify({
        type: 'success',
        message: 'Project status updated successfully'
      });

      return response;

    } catch (error) {
      throw new Error(`Failed to update project status: ${error.message}`);
    }
  }

  async handleTransitionSideEffects(newStatus) {
    const sideEffects = this.getTransitionConfig(this.currentStatus, newStatus)
      ?.sideEffects[newStatus] || [];

    for (const effect of sideEffects) {
      await this.executeSideEffect(effect);
    }
  }

  getTransitionConfig(currentStatus, newStatus) {
    return this.constructor.workflowConfig.transitions[currentStatus] || {};
  }

  getStatusConfig(status) {
    return this.constructor.workflowConfig.statusDisplay[status] || {
      color: 'gray',
      icon: 'circle'
    };
  }

  getAllowedTransitions() {
    return this.constructor.workflowConfig.transitions[this.currentStatus]?.allowedTo || [];
  }

  validateStatusTransition(newStatus) {
    return this.getAllowedTransitions().includes(newStatus);
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
    statusDisplay: {
      PENDING: {
        color: 'yellow',
        icon: 'clock'
      },
      APPROVED: {
        color: 'green',
        icon: 'check'
      },
      IN_PROGRESS: {
        color: 'blue',
        icon: 'play'
      },
      COMPLETED: {
        color: 'purple',
        icon: 'flag'
      },
      CANCELLED: {
        color: 'red',
        icon: 'x'
      },
      CLOSED: {
        color: 'gray',
        icon: 'archive'
      }
    }
  };
}
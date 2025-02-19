class WorkflowManager {
  static workflows = {
    estimate: {
      states: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'],
      transitions: {
        DRAFT: ['PENDING'],
        PENDING: ['APPROVED', 'REJECTED'],
        APPROVED: ['DRAFT'],
        REJECTED: ['DRAFT']
      },
      permissions: {
        PENDING: 'SUBMIT_ESTIMATE',
        APPROVED: 'APPROVE_ESTIMATE',
        REJECTED: 'REJECT_ESTIMATE'
      }
    },
    invoice: {
      states: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PAID', 'VOID'],
      transitions: {
        DRAFT: ['SUBMITTED'],
        SUBMITTED: ['APPROVED', 'VOID'],
        APPROVED: ['PAID', 'VOID'],
        PAID: ['VOID']
      },
      permissions: {
        SUBMITTED: 'SUBMIT_INVOICE',
        APPROVED: 'APPROVE_INVOICE',
        PAID: 'MARK_INVOICE_PAID',
        VOID: 'VOID_INVOICE'
      }
    },
    project: {
      states: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
      transitions: {
        PLANNING: ['ACTIVE', 'CANCELLED'],
        ACTIVE: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
        ON_HOLD: ['ACTIVE', 'CANCELLED'],
        COMPLETED: ['ACTIVE']
      },
      permissions: {
        ACTIVE: 'MANAGE_PROJECT',
        ON_HOLD: 'MANAGE_PROJECT',
        COMPLETED: 'CLOSE_PROJECT',
        CANCELLED: 'CANCEL_PROJECT'
      }
    }
  };

  static async transition(workflowType, itemId, fromState, toState) {
    if (!this.isValidTransition(workflowType, fromState, toState)) {
      throw new Error('Invalid state transition');
    }

    if (!this.hasTransitionPermission(workflowType, toState)) {
      throw new Error('Unauthorized state transition');
    }

    try {
      await google.script.run
        .withSuccessHandler(() => {
          NotificationSystem.notify({
            type: 'success',
            message: `Successfully updated status to ${toState}`
          });
        })
        .withFailureHandler((error) => {
          throw new Error(error);
        })
        .updateWorkflowStatus(workflowType, itemId, toState);
    } catch (error) {
      console.error('Workflow transition failed:', error);
      throw error;
    }
  }

  static isValidTransition(workflowType, fromState, toState) {
    const workflow = this.workflows[workflowType];
    if (!workflow) return false;
    
    const allowedTransitions = workflow.transitions[fromState];
    return allowedTransitions?.includes(toState) || false;
  }

  static hasTransitionPermission(workflowType, toState) {
    const workflow = this.workflows[workflowType];
    if (!workflow) return false;

    const requiredPermission = workflow.permissions[toState];
    return requiredPermission ? AuthManager.hasPermission(requiredPermission) : false;
  }

  static getAvailableTransitions(workflowType, currentState) {
    const workflow = this.workflows[workflowType];
    if (!workflow) return [];

    return workflow.transitions[currentState]?.filter(state => 
      this.hasTransitionPermission(workflowType, state)
    ) || [];
  }
}
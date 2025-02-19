class EstimateManager {
  static statuses = {
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    CLOSED: 'CLOSED'
  };

  constructor() {
    this.currentEstimate = null;
    this.workflow = {
      currentStep: 0,
      steps: [
        'customerSelection',
        'projectDetails',
        'estimateDetails',
        'review'
      ]
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Create Estimate</h2>
            <p class="text-sm text-gray-500">Follow the steps to create a new estimate</p>
          </div>
          <div class="flex space-x-3">
            <button onclick="estimateManager.saveDraft()" 
                    class="btn-secondary">
              Save as Draft
            </button>
            <button onclick="estimateManager.submitForReview()"
                    class="btn-primary">
              Submit for Review
            </button>
          </div>
        </div>

        <!-- Workflow Progress -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <nav aria-label="Progress">
            <ol role="list" class="flex items-center">
              ${this.renderWorkflowSteps()}
            </ol>
          </nav>
        </div>

        <!-- Current Step Content -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          ${this.renderCurrentStep()}
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between">
          <button onclick="estimateManager.previousStep()"
                  class="btn-secondary"
                  ${this.workflow.currentStep === 0 ? 'disabled' : ''}>
            Previous
          </button>
          <button onclick="estimateManager.nextStep()"
                  class="btn-primary"
                  ${this.workflow.currentStep === this.workflow.steps.length - 1 ? 'disabled' : ''}>
            ${this.workflow.currentStep === this.workflow.steps.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    `;
  }

  renderWorkflowSteps() {
    return this.workflow.steps.map((step, index) => `
      <li class="relative flex-1 ${index > 0 ? 'ml-6' : ''}">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="w-8 h-8 flex items-center justify-center rounded-full
                       ${this.getStepClasses(index)}">
              ${this.getStepIcon(index)}
            </span>
          </div>
          <div class="ml-4 min-w-0 flex-1">
            <h3 class="text-sm font-medium ${
              index <= this.workflow.currentStep ? 'text-gray-900' : 'text-gray-500'
            }">
              ${this.formatStepName(step)}
            </h3>
          </div>
        </div>
      </li>
    `).join('');
  }

  renderCurrentStep() {
    switch (this.workflow.steps[this.workflow.currentStep]) {
      case 'customerSelection':
        return new CustomerSelectionStep().render();
      case 'projectDetails':
        return new ProjectDetailsStep().render();
      case 'estimateDetails':
        return new EstimateDetailsStep().render();
      case 'review':
        return new EstimateReviewStep().render();
      default:
        return '';
    }
  }

  getStepClasses(index) {
    if (index < this.workflow.currentStep) {
      return 'bg-blue-600 text-white';
    }
    if (index === this.workflow.currentStep) {
      return 'bg-blue-100 text-blue-600 border-2 border-blue-600';
    }
    return 'bg-gray-100 text-gray-500';
  }

  getStepIcon(index) {
    if (index < this.workflow.currentStep) {
      return '<span class="mdi mdi-check text-lg"></span>';
    }
    return `<span class="text-sm">${index + 1}</span>`;
  }

  formatStepName(step) {
    return step
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async validateStep() {
    const currentStepComponent = this.getCurrentStepComponent();
    return await currentStepComponent.validate();
  }

  getCurrentStepComponent() {
    const stepComponents = {
      customerSelection: new CustomerSelectionStep(),
      projectDetails: new ProjectDetailsStep(),
      estimateDetails: new EstimateDetailsStep(),
      review: new EstimateReviewStep()
    };
    return stepComponents[this.workflow.steps[this.workflow.currentStep]];
  }

  async nextStep() {
    try {
      if (await this.validateStep()) {
        if (this.workflow.currentStep < this.workflow.steps.length - 1) {
          this.workflow.currentStep++;
          this.render();
        } else {
          await this.submitEstimate();
        }
      }
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'EstimateManager.nextStep',
        step: this.workflow.steps[this.workflow.currentStep]
      });
    }
  }

  previousStep() {
    if (this.workflow.currentStep > 0) {
      this.workflow.currentStep--;
      this.render();
    }
  }

  async saveDraft() {
    try {
      const estimateData = this.gatherEstimateData();
      estimateData.status = EstimateManager.statuses.DRAFT;

      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .createAndSaveEstimate(estimateData);

      NotificationSystem.notify({
        type: 'success',
        message: 'Estimate saved as draft successfully'
      });

      return response;

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'EstimateManager.saveDraft',
        data: estimateData
      });
    }
  }

  async submitForReview() {
    try {
      const estimateData = this.gatherEstimateData();
      estimateData.status = EstimateManager.statuses.PENDING;

      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .createAndSaveEstimate(estimateData);

      await ActivityLogManager.logActivity({
        action: 'ESTIMATE_SUBMIT',
        moduleType: 'ESTIMATE',
        referenceId: response.estimateId,
        details: {
          customerName: estimateData.customerName,
          amount: estimateData.totalAmount
        }
      });

      NotificationSystem.notify({
        type: 'success',
        message: 'Estimate submitted for review successfully'
      });

      return response;

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'EstimateManager.submitForReview',
        data: estimateData
      });
    }
  }

  gatherEstimateData() {
    return {
      customerId: this.currentEstimate.customerId,
      projectName: this.currentEstimate.projectName,
      scopeOfWork: this.currentEstimate.scopeOfWork,
      tableItems: this.currentEstimate.lineItems,
      totalAmount: this.calculateTotalAmount()
    };
  }

  calculateTotalAmount() {
    return this.currentEstimate.lineItems.reduce(
      (total, item) => total + (item.qtyHours * item.rate),
      0
    );
  }
}
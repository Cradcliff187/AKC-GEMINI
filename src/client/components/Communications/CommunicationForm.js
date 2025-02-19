class CommunicationForm {
  constructor(templateId = null) {
    this.templateId = templateId;
    this.templates = {
      EST_FOLLOWUP: {
        subject: 'Follow-up on Estimate #{estimateId}',
        content: `Dear {customerName},\n\nI hope this email finds you well. I wanted to follow up regarding estimate #{estimateId} that was sent on {dateSent}.\n\nPlease let me know if you have any questions or if you'd like to proceed.\n\nBest regards,\n{userName}`
      },
      PAYMENT_REMINDER: {
        subject: 'Payment Reminder - Invoice #{invoiceId}',
        content: `Dear {customerName},\n\nThis is a friendly reminder that invoice #{invoiceId} for {amount} is due on {dueDate}.\n\nBest regards,\n{userName}`
      },
      STATUS_UPDATE: {
        subject: 'Project Status Update - {projectName}',
        content: `Dear {customerName},\n\nI wanted to provide you with an update on your project ({projectName}).\n\nCurrent Status: {projectStatus}\n\n{statusDetails}\n\nBest regards,\n{userName}`
      }
    };
  }

  render() {
    return `
      <form id="communication-form" class="space-y-6">
        <!-- Template Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Template</label>
          <select onchange="communicationForm.loadTemplate(this.value)" 
                  class="mt-1 input-field">
            <option value="">Select a template</option>
            ${Object.entries(CommunicationManager.types).map(([key, value]) => `
              <option value="${value}" ${this.templateId === value ? 'selected' : ''}>
                ${key.replace(/_/g, ' ')}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Recipients -->
        <div>
          <label class="block text-sm font-medium text-gray-700">To</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <div class="relative flex items-stretch flex-grow">
              <input type="text" 
                     name="recipients" 
                     id="recipients"
                     class="input-field"
                     placeholder="Enter email addresses"
                     required>
            </div>
            <button type="button" 
                    onclick="communicationForm.showContactPicker()"
                    class="ml-3 btn-secondary">
              <span class="mdi mdi-account-multiple mr-2"></span>
              Select Contacts
            </button>
          </div>
        </div>

        <!-- Subject -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Subject</label>
          <input type="text" 
                 name="subject" 
                 id="subject"
                 class="mt-1 input-field"
                 required>
        </div>

        <!-- Content -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Message</label>
          <div class="mt-1">
            <textarea name="content" 
                      id="content"
                      rows="8" 
                      class="input-field"
                      required></textarea>
          </div>
        </div>

        <!-- Attachments -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Attachments</label>
          <div class="mt-1 flex items-center space-x-4">
            <button type="button" 
                    onclick="communicationForm.addAttachment()"
                    class="btn-secondary text-sm">
              <span class="mdi mdi-paperclip mr-2"></span>
              Add Attachment
            </button>
            <div id="attachments-list" class="flex flex-wrap gap-2"></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button type="button" 
                  onclick="communicationForm.saveDraft()"
                  class="btn-secondary">
            Save as Draft
          </button>
          <button type="submit" 
                  onclick="communicationForm.send(event)"
                  class="btn-primary">
            Send
          </button>
        </div>
      </form>
    `;
  }

  async loadTemplate(templateId) {
    if (!templateId) return;

    const template = this.templates[templateId];
    if (!template) return;

    try {
      // Get context data for template
      const contextData = await this.getTemplateContext(templateId);
      
      // Replace placeholders
      const subject = this.replacePlaceholders(template.subject, contextData);
      const content = this.replacePlaceholders(template.content, contextData);

      // Update form
      document.getElementById('subject').value = subject;
      document.getElementById('content').value = content;

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'CommunicationForm.loadTemplate',
        templateId
      });
    }
  }

  replacePlaceholders(text, context) {
    return text.replace(/\{(\w+)\}/g, (match, key) => context[key] || match);
  }

  async getTemplateContext(templateId) {
    // Get relevant data based on template type
    const user = AuthManager.getCurrentUser();
    const baseContext = {
      userName: user.name,
      dateSent: new Date().toLocaleDateString()
    };

    switch (templateId) {
      case CommunicationManager.types.ESTIMATE_FOLLOWUP:
        const estimate = await this.getEstimateDetails();
        return {
          ...baseContext,
          estimateId: estimate.EstimateID,
          customerName: estimate.CustomerName
        };

      case CommunicationManager.types.PAYMENT_REMINDER:
        const invoice = await this.getInvoiceDetails();
        return {
          ...baseContext,
          invoiceId: invoice.InvoiceID,
          amount: invoice.Amount,
          dueDate: invoice.DueDate,
          customerName: invoice.CustomerName
        };

      case CommunicationManager.types.STATUS_UPDATE:
        const project = await this.getProjectDetails();
        return {
          ...baseContext,
          projectName: project.ProjectName,
          projectStatus: project.Status,
          statusDetails: project.StatusDetails,
          customerName: project.CustomerName
        };

      default:
        return baseContext;
    }
  }
}

// filepath: /workspaces/AKC-GEMINI/src/client/components/Communications/CommunicationTemplateManager.js
class CommunicationTemplateManager {
  static async getTemplates() {
    return {
      EST_FOLLOWUP: await this.loadTemplate('EST_FOLLOWUP'),
      PAYMENT_REMINDER: await this.loadTemplate('PAYMENT_REMINDER'),
      STATUS_UPDATE: await this.loadTemplate('STATUS_UPDATE')
    };
  }

  static async loadTemplate(type) {
    try {
      const templateConfig = this.constructor.getTemplateConfig(type);
      const template = await google.script.run
        .withSuccessHandler(template => template)
        .withFailureHandler(error => {
          throw error;
        })
        .getEmailTemplate(type);

      return {
        ...template,
        ...templateConfig
      };
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'CommunicationTemplateManager.loadTemplate',
        type
      });
      return null;
    }
  }

  static getTemplateConfig(type) {
    return {
      EST_FOLLOWUP: {
        requiredFields: ['estimateId', 'customerName', 'dateSent'],
        attachments: ['estimateDocument'],
        validation: (data) => {
          return data.estimateId && data.customerName;
        }
      },
      PAYMENT_REMINDER: {
        requiredFields: ['invoiceId', 'amount', 'dueDate', 'customerName'],
        attachments: ['invoiceDocument'],
        validation: (data) => {
          return data.invoiceId && data.amount && data.dueDate;
        }
      },
      STATUS_UPDATE: {
        requiredFields: ['projectName', 'projectStatus', 'customerName'],
        attachments: [],
        validation: (data) => {
          return data.projectName && data.projectStatus;
        }
      }
    }[type] || {};
  }
}
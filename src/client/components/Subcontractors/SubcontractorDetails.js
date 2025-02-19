class SubcontractorDetails {
  constructor(subId) {
    this.subId = subId;
    this.subcontractor = null;
    this.invoices = [];
    this.projects = [];
    this.metrics = {
      totalInvoiced: 0,
      activeProjects: 0,
      averageInvoiceAmount: 0,
      recentActivity: []
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900">${this.subcontractor?.SubName}</h2>
              <div class="mt-1 flex items-center">
                <span class="text-sm text-gray-500">ID: ${this.subId}</span>
                <span class="mx-2 text-gray-300">|</span>
                <span class="text-sm text-gray-500">${this.subcontractor?.City}, ${this.subcontractor?.State}</span>
              </div>
            </div>
            <button onclick="subcontractorDetails.editSubcontractor()"
                    class="btn-secondary">
              <span class="mdi mdi-pencil mr-2"></span>
              Edit Details
            </button>
          </div>
          
          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-medium text-gray-500">Contact Information</h4>
              <div class="mt-2 space-y-2">
                <p class="text-sm text-gray-900">
                  <span class="mdi mdi-email-outline mr-2"></span>
                  ${this.subcontractor?.ContactEmail}
                </p>
                <p class="text-sm text-gray-900">
                  <span class="mdi mdi-phone mr-2"></span>
                  ${this.subcontractor?.Phone}
                </p>
                <p class="text-sm text-gray-900">
                  <span class="mdi mdi-map-marker mr-2"></span>
                  ${this.formatAddress()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${this.renderMetricsCards()}
        </div>

        <!-- Invoices List -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Invoice History</h3>
            <button onclick="subcontractorDetails.showNewInvoiceModal()"
                    class="btn-secondary">
              <span class="mdi mdi-plus mr-2"></span>
              Add Invoice
            </button>
          </div>
          ${this.renderInvoicesTable()}
        </div>

        <!-- Projects -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Associated Projects</h3>
          ${this.renderProjectsList()}
        </div>
      </div>
    `;
  }

  renderMetricsCards() {
    const metrics = [
      {
        label: 'Total Invoiced',
        value: this.formatCurrency(this.metrics.totalInvoiced),
        icon: 'cash',
        color: 'green'
      },
      {
        label: 'Active Projects',
        value: this.metrics.activeProjects,
        icon: 'briefcase',
        color: 'blue'
      },
      {
        label: 'Average Invoice',
        value: this.formatCurrency(this.metrics.averageInvoiceAmount),
        icon: 'chart-line',
        color: 'purple'
      }
    ];

    return metrics.map(metric => `
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="mdi mdi-${metric.icon} text-2xl text-${metric.color}-500"></span>
          </div>
          <div class="ml-4">
            <h4 class="text-sm font-medium text-gray-500">${metric.label}</h4>
            <p class="mt-1 text-xl font-semibold text-gray-900">${metric.value}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderInvoicesTable() {
    if (!this.invoices.length) {
      return `
        <div class="text-center text-gray-500 py-4">
          No invoices found
        </div>
      `;
    }

    return `
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
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${this.invoices.map(invoice => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${this.formatDate(invoice.CreatedOn)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${invoice.ProjectName}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${this.formatCurrency(invoice.InvoiceAmount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                             ${this.getStatusClasses(invoice.Status)}">
                    ${invoice.Status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onclick="subcontractorDetails.viewInvoice('${invoice.SubInvoiceID}')"
                          class="text-blue-600 hover:text-blue-900 mr-3">
                    View
                  </button>
                  <button onclick="subcontractorDetails.downloadInvoice('${invoice.SubInvoiceID}')"
                          class="text-gray-600 hover:text-gray-900">
                    <span class="mdi mdi-download"></span>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// filepath: /workspaces/AKC-GEMINI/src/client/components/Subcontractors/SubInvoiceDocumentHandler.js
class SubInvoiceDocumentHandler {
  constructor() {
    this.supportedTypes = ['application/pdf'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  async handleInvoiceUpload(file, projectId, subId) {
    try {
      // Validate file
      this.validateFile(file);

      // Create folder structure if needed
      const folderIds = await this.ensureFolderStructure(projectId);

      // Upload file
      const uploadResult = await this.uploadFile(file, folderIds.subInvoices);

      // Create document record
      const docRecord = await this.createDocumentRecord({
        projectId,
        subId,
        fileId: uploadResult.id,
        fileName: file.name,
        fileUrl: uploadResult.url
      });

      return {
        documentId: docRecord.id,
        url: uploadResult.url,
        name: file.name
      };

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'SubInvoiceDocumentHandler.handleInvoiceUpload',
        projectId,
        subId
      });
      throw error;
    }
  }

  validateFile(file) {
    if (!this.supportedTypes.includes(file.type)) {
      throw new Error('Unsupported file type. Please upload a PDF file.');
    }

    if (file.size > this.maxFileSize) {
      throw new Error('File size exceeds maximum allowed (10MB).');
    }
  }

  async ensureFolderStructure(projectId) {
    try {
      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .ensureProjectFolders(projectId);

      return response.folders;

    } catch (error) {
      throw new Error(`Failed to ensure folder structure: ${error.message}`);
    }
  }

  async uploadFile(file, folderId) {
    try {
      // Convert file to base64
      const base64Data = await this.fileToBase64(file);

      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .uploadFileToFolder({
          base64Data,
          fileName: file.name,
          mimeType: file.type,
          folderId
        });

      return response;

    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async createDocumentRecord(data) {
    try {
      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .createSubInvoiceDocument(data);

      return response;

    } catch (error) {
      throw new Error(`Failed to create document record: ${error.message}`);
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

  async downloadInvoice(documentId) {
    try {
      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .getSubInvoiceDocument(documentId);

      window.open(response.downloadUrl, '_blank');

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'SubInvoiceDocumentHandler.downloadInvoice',
        documentId
      });
    }
  }

  async viewInvoice(documentId) {
    try {
      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .getSubInvoiceDocument(documentId);

      window.open(response.webViewUrl, '_blank');

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'SubInvoiceDocumentHandler.viewInvoice',
        documentId
      });
    }
  }
}
class DocumentManager {
  static documentTypes = {
    ESTIMATE: 'ESTIMATE',
    CONTRACT: 'CONTRACT',
    INVOICE: 'INVOICE',
    COMMUNICATION: 'COMMUNICATION',
    OTHER: 'OTHER'
  };

  constructor() {
    this.documents = [];
    this.filters = {
      type: null,
      status: null,
      dateRange: null
    };
    this.maxFileSize = 10485760; // 10MB from blueprint config
    this.allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ];
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Documents</h1>
            <p class="text-sm text-gray-500">Manage customer documents and files</p>
          </div>
          <button onclick="documentManager.uploadDocument()" 
                  class="btn-primary">
            <span class="mdi mdi-upload mr-2"></span>
            Upload Document
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Type</label>
              <select onchange="documentManager.filterByType(this.value)" 
                      class="mt-1 input-field">
                <option value="">All Types</option>
                ${Object.entries(this.documentTypes).map(([key, value]) => `
                  <option value="${value}">${key}</option>
                `).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select onchange="documentManager.filterByStatus(this.value)" 
                      class="mt-1 input-field">
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Date Range</label>
              <div class="flex space-x-2">
                <input type="date" 
                       class="mt-1 input-field" 
                       onchange="documentManager.filterByDateRange('start', this.value)">
                <input type="date" 
                       class="mt-1 input-field" 
                       onchange="documentManager.filterByDateRange('end', this.value)">
              </div>
            </div>
          </div>
        </div>

        <!-- Documents Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${this.renderDocumentCards()}
        </div>

        <!-- Upload Modal -->
        <div id="upload-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          ${this.renderUploadModal()}
        </div>
      </div>
    `;
  }

  renderDocumentCards() {
    return this.documents.map(doc => `
      <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">${doc.Name}</h3>
              <p class="mt-1 text-sm text-gray-500">${doc.Description || 'No description'}</p>
            </div>
            <div class="ml-4">
              <button onclick="documentManager.showDocumentMenu('${doc.DocumentID}')"
                      class="text-gray-400 hover:text-gray-600">
                <span class="mdi mdi-dots-vertical"></span>
              </button>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center">
              <span class="mdi ${this.getDocumentTypeIcon(doc.Type)} text-gray-400 mr-2"></span>
              <span class="text-sm text-gray-600">${doc.Type}</span>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                       ${this.getStatusClasses(doc.Status)}">
              ${doc.Status}
            </span>
          </div>

          <div class="mt-4 border-t pt-4">
            <div class="flex items-center justify-between text-sm text-gray-500">
              <div>Version ${doc.Version || '1.0'}</div>
              <div>${this.formatDate(doc.LastModified)}</div>
            </div>
          </div>

          <div class="mt-4 flex space-x-3">
            <a href="${doc.URL}" 
               target="_blank"
               class="flex-1 btn-secondary text-center text-sm">
              View Document
            </a>
            <button onclick="documentManager.handleDocumentAction('${doc.DocumentID}', 'download')"
                    class="p-2 text-gray-400 hover:text-gray-600">
              <span class="mdi mdi-download"></span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderUploadModal() {
    return `
      <div class="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center pb-3 border-b">
          <h3 class="text-xl font-semibold text-gray-900">Upload Document</h3>
          <button onclick="documentManager.closeUploadModal()" 
                  class="text-gray-400 hover:text-gray-500">
            <span class="mdi mdi-close"></span>
          </button>
        </div>

        <form id="document-upload-form" class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Document Type</label>
            <select name="type" class="mt-1 input-field" required>
              ${Object.entries(this.documentTypes).map(([key, value]) => `
                <option value="${value}">${key}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" class="mt-1 input-field" required>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" class="mt-1 input-field" rows="3"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">File</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <div class="flex text-sm text-gray-600">
                  <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="file-upload" 
                           name="file" 
                           type="file"
                           class="sr-only"
                           accept="${this.allowedTypes.join(',')}"
                           onchange="documentManager.handleFileSelect(this)">
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          </div>

          <div class="mt-5 border-t pt-4 flex justify-end space-x-3">
            <button type="button" 
                    onclick="documentManager.closeUploadModal()" 
                    class="btn-secondary">
              Cancel
            </button>
            <button type="submit" 
                    onclick="documentManager.handleUpload(event)" 
                    class="btn-primary">
              Upload
            </button>
          </div>
        </form>
      </div>
    `;
  }

  getDocumentTypeIcon(type) {
    const icons = {
      [this.documentTypes.ESTIMATE]: 'mdi-file-document-outline',
      [this.documentTypes.CONTRACT]: 'mdi-file-sign',
      [this.documentTypes.INVOICE]: 'mdi-file-invoice',
      [this.documentTypes.COMMUNICATION]: 'mdi-email-outline',
      [this.documentTypes.OTHER]: 'mdi-file'
    };
    return icons[type] || icons[this.documentTypes.OTHER];
  }

  getStatusClasses(status) {
    const classes = {
      ACTIVE: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-800',
      EXPIRED: 'bg-red-100 text-red-800',
      DRAFT: 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || classes.DRAFT;
  }

  async handleUpload(event) {
    event.preventDefault();
    const form = document.getElementById('document-upload-form');
    const formData = new FormData(form);

    try {
      const file = formData.get('file');
      if (!this.validateFile(file)) return;

      const uploadResponse = await this.uploadFile(file);
      if (!uploadResponse.url) throw new Error('File upload failed');

      const documentData = {
        Type: formData.get('type'),
        Name: formData.get('name'),
        Description: formData.get('description'),
        URL: uploadResponse.url,
        Status: 'ACTIVE',
        Version: '1.0',
        CreatedBy: AuthManager.getCurrentUser().email,
        LastModified: new Date().toISOString()
      };

      await google.script.run
        .withSuccessHandler(() => {
          NotificationSystem.notify({
            message: 'Document uploaded successfully',
            type: 'success'
          });
          this.closeUploadModal();
          this.refreshDocuments();
        })
        .withFailureHandler(error => {
          throw error;
        })
        .createCustomerDocument(documentData);

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'DocumentManager.handleUpload',
        action: 'DOCUMENT_UPLOAD'
      });
    }
  }
}
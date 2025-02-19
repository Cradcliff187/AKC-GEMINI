class CustomerDocuments {
  constructor(customerId) {
    this.customerId = customerId;
    this.documents = [];
    this.documentTypes = {
      ESTIMATE: 'Estimate',
      CONTRACT: 'Contract',
      INVOICE: 'Invoice',
      COMMUNICATION: 'Communication',
      OTHER: 'Other'
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900">Documents</h2>
          <button onclick="customerDocuments.uploadDocument()" class="btn-primary">
            <span class="mdi mdi-upload mr-2"></span>
            Upload Document
          </button>
        </div>

        <!-- Document Type Filter -->
        <div class="flex space-x-2">
          ${Object.entries(this.documentTypes).map(([key, label]) => `
            <button 
              onclick="customerDocuments.filterByType('${key}')"
              class="px-3 py-2 rounded-md text-sm font-medium 
                     ${this.activeFilter === key ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}">
              ${label}
            </button>
          `).join('')}
        </div>

        <!-- Documents Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.documents.map(doc => `
            <div class="bg-white rounded-lg shadow-sm border p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">${doc.Name}</h3>
                  <p class="text-xs text-gray-500">${this.documentTypes[doc.Type]}</p>
                </div>
                <span class="status-badge status-${doc.Status.toLowerCase()}">${doc.Status}</span>
              </div>
              
              <div class="mt-4 space-y-2 text-sm text-gray-600">
                <p>${doc.Description || 'No description provided'}</p>
                <p>Version: ${doc.Version || '1.0'}</p>
                <p>Created: ${new Date(doc.CreatedOn).toLocaleDateString()}</p>
              </div>

              <div class="mt-4 pt-4 border-t flex justify-end space-x-2">
                <a href="${doc.URL}" target="_blank" class="btn-secondary text-sm">
                  <span class="mdi mdi-eye mr-1"></span>
                  View
                </a>
                <button onclick="customerDocuments.updateDocument('${doc.DocumentID}')" 
                        class="btn-primary text-sm">
                  <span class="mdi mdi-pencil mr-1"></span>
                  Edit
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Upload Document Modal
class DocumentUploadModal {
  render() {
    return `
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="document-upload-modal">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center pb-3 border-b">
            <h3 class="text-xl font-semibold text-gray-900">Upload Document</h3>
            <button onclick="documentUploadModal.close()" class="text-gray-400 hover:text-gray-500">
              <span class="mdi mdi-close text-xl"></span>
            </button>
          </div>

          <form id="documentUploadForm" class="space-y-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Document Type</label>
              <select name="Type" class="mt-1 input-field" required>
                ${Object.entries(this.documentTypes).map(([key, label]) => `
                  <option value="${key}">${label}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="Name" class="mt-1 input-field" required>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="Description" rows="3" class="mt-1 input-field"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">File</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <span class="mdi mdi-upload text-4xl text-gray-400"></span>
                  <div class="flex text-sm text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file" type="file" class="sr-only" required>
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>

            <div class="border-t pt-4 mt-6 flex justify-end space-x-3">
              <button type="button" onclick="documentUploadModal.close()" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Upload Document
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
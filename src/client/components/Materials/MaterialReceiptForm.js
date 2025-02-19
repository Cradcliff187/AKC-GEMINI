class MaterialReceiptForm {
  constructor(receipt = null) {
    this.receipt = receipt;
    this.isEdit = !!receipt;
    this.projects = [];
    this.vendors = [];
    this.maxFileSize = 10485760; // 10MB from blueprint fileUpload config
    this.allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  }

  render() {
    return `
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" 
           id="material-receipt-modal">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center pb-3 border-b">
            <h3 class="text-xl font-semibold text-gray-900">
              ${this.isEdit ? 'Edit Receipt' : 'Add New Receipt'}
            </h3>
            <button onclick="materialReceiptForm.close()" 
                    class="text-gray-400 hover:text-gray-500">
              <span class="mdi mdi-close text-xl"></span>
            </button>
          </div>

          <form id="materialReceiptForm" class="space-y-4 mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Project</label>
                <select name="ProjectID" class="mt-1 input-field" required>
                  <option value="">Select Project</option>
                  ${this.projects.map(project => `
                    <option value="${project.ProjectID}" 
                            ${this.receipt?.ProjectID === project.ProjectID ? 'selected' : ''}>
                      ${project.ProjectName}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Vendor</label>
                <select name="VendorID" class="mt-1 input-field" required
                        onchange="materialReceiptForm.handleVendorChange(this.value)">
                  <option value="">Select Vendor</option>
                  ${this.vendors.map(vendor => `
                    <option value="${vendor.VendorID}" 
                            ${this.receipt?.VendorID === vendor.VendorID ? 'selected' : ''}>
                      ${vendor.VendorName}
                    </option>
                  `).join('')}
                  <option value="new">+ Add New Vendor</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Amount</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input type="number" 
                         name="Amount" 
                         step="0.01" 
                         min="0"
                         value="${this.receipt?.Amount || ''}"
                         class="input-field pl-7" 
                         required>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">For User Email</label>
                <input type="email" 
                       name="ForUserEmail" 
                       value="${this.receipt?.ForUserEmail || ''}"
                       class="mt-1 input-field"
                       placeholder="Optional">
              </div>
            </div>

            <!-- Receipt Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Receipt Document</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  ${this.receipt?.ReceiptDocURL ? `
                    <div class="existing-file mb-3">
                      <p class="text-sm text-gray-600">Current file:</p>
                      <a href="${this.receipt.ReceiptDocURL}" 
                         target="_blank"
                         class="text-blue-600 hover:text-blue-500">
                        View Receipt
                      </a>
                    </div>
                  ` : ''}
                  <div class="flex flex-col items-center">
                    <span class="mdi mdi-upload text-4xl text-gray-400"></span>
                    <div class="flex text-sm text-gray-600">
                      <label for="receipt-upload" 
                             class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input id="receipt-upload" 
                               name="receipt" 
                               type="file"
                               accept="${this.allowedFileTypes.join(',')}"
                               class="sr-only"
                               onchange="materialReceiptForm.handleFileSelect(this)">
                      </label>
                      <p class="pl-1">or drag and drop</p>
                    </div>
                    <p class="text-xs text-gray-500">
                      PDF, PNG, JPG up to 10MB
                    </p>
                  </div>
                  <div id="upload-preview" class="mt-4 hidden">
                    <img id="preview-image" class="mx-auto h-32 w-auto" src="" alt="Receipt preview">
                    <p id="preview-filename" class="text-sm text-gray-500 mt-2"></p>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t pt-4 mt-6 flex justify-end space-x-3">
              <button type="button" 
                      onclick="materialReceiptForm.close()" 
                      class="btn-secondary">
                Cancel
              </button>
              <button type="submit" 
                      onclick="materialReceiptForm.save(event)" 
                      class="btn-primary">
                ${this.isEdit ? 'Update' : 'Submit'} Receipt
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  async handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;

    // Validate file type
    if (!this.allowedFileTypes.includes(file.type)) {
      M.toast({html: 'Invalid file type. Please upload a PDF, PNG, or JPG file.'});
      input.value = '';
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      M.toast({html: 'File too large. Maximum size is 10MB.'});
      input.value = '';
      return;
    }

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('preview-image').src = e.target.result;
        document.getElementById('preview-filename').textContent = file.name;
        document.getElementById('upload-preview').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, just show the filename
      document.getElementById('preview-image').src = '';
      document.getElementById('preview-filename').textContent = file.name;
      document.getElementById('upload-preview').classList.remove('hidden');
    }
  }

  async save(event) {
    event.preventDefault();
    const form = document.getElementById('materialReceiptForm');
    const formData = new FormData(form);

    try {
      const fileInput = document.getElementById('receipt-upload');
      const file = fileInput.files[0];
      
      let receiptDocURL = this.receipt?.ReceiptDocURL;
      
      if (file) {
        // Upload file and get URL
        receiptDocURL = await this.uploadFile(file);
      }

      const receiptData = {
        ProjectID: formData.get('ProjectID'),
        VendorID: formData.get('VendorID'),
        VendorName: this.vendors.find(v => v.VendorID === formData.get('VendorID'))?.VendorName,
        Amount: parseFloat(formData.get('Amount')),
        ReceiptDocURL: receiptDocURL,
        ForUserEmail: formData.get('ForUserEmail') || null,
        SubmittingUser: Session.getActiveUser().getEmail()
      };

      await google.script.run
        .withSuccessHandler(() => {
          M.toast({html: `Receipt ${this.isEdit ? 'updated' : 'added'} successfully`});
          this.close();
          materialsList.refresh();
        })
        .withFailureHandler(error => {
          M.toast({html: `Error: ${error}`});
        })
        [this.isEdit ? 'updateMaterialReceipt' : 'createMaterialReceipt'](receiptData);

    } catch (error) {
      console.error('Error saving receipt:', error);
      M.toast({html: 'Error saving receipt'});
    }
  }
}
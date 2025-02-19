class SubcontractorForm {
  constructor(subcontractor = null) {
    this.subcontractor = subcontractor;
    this.isEdit = !!subcontractor;
  }

  render() {
    return `
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" 
           id="subcontractor-modal">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center pb-3 border-b">
            <h3 class="text-xl font-semibold text-gray-900">
              ${this.isEdit ? 'Edit Subcontractor' : 'Add Subcontractor'}
            </h3>
            <button onclick="subcontractorForm.close()" 
                    class="text-gray-400 hover:text-gray-500">
              <span class="mdi mdi-close text-xl"></span>
            </button>
          </div>

          <form id="subcontractorForm" class="space-y-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Subcontractor Name</label>
              <input type="text" 
                     name="SubName" 
                     value="${this.subcontractor?.SubName || ''}"
                     class="mt-1 input-field" 
                     required>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" 
                       name="ContactEmail" 
                       value="${this.subcontractor?.ContactEmail || ''}"
                       class="mt-1 input-field">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" 
                       name="Phone" 
                       value="${this.subcontractor?.Phone || ''}"
                       class="mt-1 input-field">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" 
                     name="Address" 
                     value="${this.subcontractor?.Address || ''}"
                     class="mt-1 input-field">
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">City</label>
                <input type="text" 
                       name="City" 
                       value="${this.subcontractor?.City || ''}"
                       class="mt-1 input-field">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">State</label>
                <input type="text" 
                       name="State" 
                       value="${this.subcontractor?.State || ''}"
                       class="mt-1 input-field">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">ZIP</label>
                <input type="text" 
                       name="Zip" 
                       value="${this.subcontractor?.Zip || ''}"
                       class="mt-1 input-field">
              </div>
            </div>

            <div class="border-t pt-4 mt-6 flex justify-end space-x-3">
              <button type="button" 
                      onclick="subcontractorForm.close()" 
                      class="btn-secondary">
                Cancel
              </button>
              <button type="submit" 
                      onclick="subcontractorForm.save(event)" 
                      class="btn-primary">
                ${this.isEdit ? 'Update' : 'Add'} Subcontractor
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
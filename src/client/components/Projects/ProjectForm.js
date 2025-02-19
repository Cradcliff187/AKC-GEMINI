class ProjectForm {
  constructor(project = null) {
    this.project = project;
    this.isEdit = !!project;
    this.customers = [];
  }

  render() {
    return `
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="project-modal">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center pb-3 border-b">
            <h3 class="text-xl font-semibold text-gray-900">
              ${this.isEdit ? 'Edit Project' : 'New Project'}
            </h3>
            <button onclick="projectForm.close()" class="text-gray-400 hover:text-gray-500">
              <span class="mdi mdi-close text-xl"></span>
            </button>
          </div>

          <form id="projectForm" class="space-y-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Project Name</label>
              <input type="text" 
                     name="ProjectName" 
                     value="${this.project?.ProjectName || ''}"
                     class="mt-1 input-field" 
                     required>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Customer</label>
              <select name="CustomerID" class="mt-1 input-field" required>
                <option value="">Select Customer</option>
                ${this.customers.map(customer => `
                  <option value="${customer.CustomerID}" 
                          ${this.project?.CustomerID === customer.CustomerID ? 'selected' : ''}>
                    ${customer.CustomerName}
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select name="Status" class="mt-1 input-field">
                <option value="Active" ${this.project?.Status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="On Hold" ${this.project?.Status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                <option value="Completed" ${this.project?.Status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>

            <div class="border-t pt-4 mt-6 flex justify-end space-x-3">
              <button type="button" 
                      onclick="projectForm.close()" 
                      class="btn-secondary">
                Cancel
              </button>
              <button type="submit" 
                      onclick="projectForm.save(event)" 
                      class="btn-primary">
                ${this.isEdit ? 'Update' : 'Create'} Project
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
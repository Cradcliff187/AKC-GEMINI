class ProjectDetails {
  constructor(projectId) {
    this.projectId = projectId;
    this.project = null;
    this.relatedData = {
      estimates: [],
      timeLogs: [],
      materialsReceipts: [],
      subinvoices: []
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Project Header -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">${this.project.ProjectName}</h2>
              <p class="text-sm text-gray-500">Project ID: ${this.project.ProjectID}</p>
            </div>
            <div class="flex space-x-3">
              <button onclick="projectDetails.edit()" class="btn-secondary">
                <span class="mdi mdi-pencil mr-1"></span>
                Edit
              </button>
              <button onclick="projectDetails.showActions()" class="btn-primary">
                <span class="mdi mdi-cog mr-1"></span>
                Actions
              </button>
            </div>
          </div>

          <!-- Project Info Grid -->
          <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500">Status</h3>
              <p class="mt-2">
                <span class="status-badge status-${this.project.Status.toLowerCase()}">
                  ${this.project.Status}
                </span>
              </p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500">Created On</h3>
              <p class="mt-2 text-gray-900">${new Date(this.project.CreatedOn).toLocaleDateString()}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500">Last Modified</h3>
              <p class="mt-2 text-gray-900">${new Date(this.project.LastModified).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <!-- Related Items Tabs -->
        <div class="bg-white shadow rounded-lg">
          <nav class="flex border-b">
            <button onclick="projectDetails.switchTab('estimates')" 
                    class="tab-button active" data-tab="estimates">
              Estimates
            </button>
            <button onclick="projectDetails.switchTab('timeLogs')" 
                    class="tab-button" data-tab="timeLogs">
              Time Logs
            </button>
            <button onclick="projectDetails.switchTab('materials')" 
                    class="tab-button" data-tab="materials">
              Materials
            </button>
            <button onclick="projectDetails.switchTab('subinvoices')" 
                    class="tab-button" data-tab="subinvoices">
              Subcontractor Invoices
            </button>
          </nav>
          <div id="tab-content" class="p-6">
            <!-- Tab content loaded dynamically -->
          </div>
        </div>
      </div>
    `;
  }
}
class ProjectsList {
  constructor() {
    this.projects = [];
    this.currentView = 'grid';
    this.filters = {
      status: 'all',
      search: ''
    };
  }

  renderHeader() {
    return `
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Projects</h1>
          <p class="text-sm text-gray-500">Manage and track all construction projects</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex items-center bg-white rounded-lg p-1 shadow-sm">
            <button onclick="projectsList.setView('grid')" 
                    class="${this.currentView === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'} p-2 rounded">
              <span class="mdi mdi-view-grid text-xl"></span>
            </button>
            <button onclick="projectsList.setView('table')" 
                    class="${this.currentView === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'} p-2 rounded">
              <span class="mdi mdi-table text-xl"></span>
            </button>
          </div>
          <button onclick="projectsList.showNewProject()" 
                  class="btn-primary">
            <span class="mdi mdi-plus mr-2"></span>
            New Project
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="col-span-2">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center">
                <span class="mdi mdi-magnify text-gray-500"></span>
              </span>
              <input type="text" 
                     placeholder="Search projects..." 
                     class="pl-10 input-field"
                     onkeyup="projectsList.handleSearch(this.value)">
            </div>
          </div>
          <div>
            <select class="input-field" onchange="projectsList.handleFilter(this.value)">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  renderGridView() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.projects.map(project => `
          <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">${project.ProjectName}</h3>
                <p class="text-sm text-gray-500">ID: ${project.ProjectID}</p>
              </div>
              <span class="status-badge status-${project.Status.toLowerCase()}">${project.Status}</span>
            </div>
            
            <div class="mt-4 space-y-2">
              <div class="flex items-center text-sm text-gray-600">
                <span class="mdi mdi-account mr-2"></span>
                Customer: ${project.CustomerID}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <span class="mdi mdi-calendar mr-2"></span>
                Created: ${new Date(project.CreatedOn).toLocaleDateString()}
              </div>
            </div>

            <div class="mt-4 pt-4 border-t flex justify-end space-x-2">
              <button onclick="projectsList.viewDetails('${project.ProjectID}')" 
                      class="btn-secondary text-sm">
                <span class="mdi mdi-eye mr-1"></span>
                View
              </button>
              <button onclick="projectsList.editProject('${project.ProjectID}')" 
                      class="btn-primary text-sm">
                <span class="mdi mdi-pencil mr-1"></span>
                Edit
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderTableView() {
    return `
      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap">
          <thead>
            <tr class="bg-gray-50 border-b">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${this.projects.map(project => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div>
                    <div class="text-sm font-medium text-gray-900">${project.ProjectName}</div>
                    <div class="text-sm text-gray-500">${project.ProjectID}</div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="status-badge status-${project.Status.toLowerCase()}">${project.Status}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${project.CustomerID}</td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  ${new Date(project.CreatedOn).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button onclick="projectsList.viewDetails('${project.ProjectID}')" 
                          class="text-blue-600 hover:text-blue-900 mr-3">View</button>
                  <button onclick="projectsList.editProject('${project.ProjectID}')" 
                          class="text-blue-600 hover:text-blue-900">Edit</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

const projectsList = new ProjectsList();
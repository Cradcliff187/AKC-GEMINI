// This is our primary implementation with:
// - Project list management
// - CRUD operations
// - Status filtering
// - Search functionality

class ProjectsComponent {
  constructor() {
    this.projects = [];
    this.filters = {
      status: 'all',
      search: ''
    };
  }

  async initialize() {
    await this.loadProjects();
    this.setupEventListeners();
    this.render();
  }

  async loadProjects() {
    try {
      this.projects = await google.script.run
        .withSuccessHandler(data => data)
        .withFailureHandler(error => this.handleError(error))
        .getProjects();
    } catch (error) {
      this.handleError(error);
    }
  }

  render() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header Section -->
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <h1 class="text-2xl font-semibold text-gray-900">Projects</h1>
            <p class="mt-1 text-sm text-gray-500">Manage your construction projects</p>
          </div>
          <button onclick="projects.showNewProjectModal()" class="btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            New Project
          </button>
        </div>

        <!-- Filters Section -->
        <div class="flex space-x-4 bg-white p-4 rounded-lg shadow-sm">
          <div class="flex-1">
            <input type="text" 
                   placeholder="Search projects..." 
                   class="input-field"
                   onkeyup="projects.handleSearch(this.value)">
          </div>
          <select class="input-field w-48" onchange="projects.handleStatusFilter(this.value)">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        <!-- Projects Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.renderProjectCards()}
        </div>
      </div>
    `;
  }

  renderProjectCards() {
    return this.getFilteredProjects()
      .map(project => `
        <div class="card hover:border-blue-500 border-2 border-transparent cursor-pointer"
             onclick="projects.showProjectDetails('${project.ProjectID}')">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-900">${project.ProjectName}</h3>
              <p class="text-sm text-gray-500">ID: ${project.ProjectID}</p>
            </div>
            <span class="status-badge status-${project.Status.toLowerCase()}">${project.Status}</span>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm text-gray-500">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Created: ${new Date(project.CreatedOn).toLocaleDateString()}
            </div>
          </div>
        </div>
      `).join('');
  }

  getFilteredProjects() {
    return this.projects.filter(project => {
      const matchesSearch = project.ProjectName.toLowerCase()
        .includes(this.filters.search.toLowerCase());
      const matchesStatus = this.filters.status === 'all' || 
        project.Status.toLowerCase() === this.filters.status;
      return matchesSearch && matchesStatus;
    });
  }

  handleError(error) {
    console.error(error);
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="bg-red-50 border-l-4 border-red-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading projects</h3>
            <div class="mt-2 text-sm text-red-700">${error.message}</div>
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize the projects component
const projects = new ProjectsComponent();
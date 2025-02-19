class SystemSettingsManager {
  constructor() {
    this.settings = null;
    this.currentSection = 'general';
    this.isDirty = false;
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">System Settings</h2>
            <p class="text-sm text-gray-500">Configure system-wide settings and defaults</p>
          </div>
          ${this.isDirty ? `
            <button onclick="systemSettingsManager.saveChanges()"
                    class="btn-primary">
              <span class="mdi mdi-content-save mr-2"></span>
              Save Changes
            </button>
          ` : ''}
        </div>

        <!-- Settings Navigation -->
        <div class="bg-white rounded-lg shadow-sm">
          <nav class="flex divide-x divide-gray-200">
            ${this.renderNavigationTabs()}
          </nav>
        </div>

        <!-- Settings Content -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          ${this.renderSettingsContent()}
        </div>
      </div>
    `;
  }

  renderNavigationTabs() {
    const sections = [
      { id: 'general', label: 'General Settings', icon: 'cog' },
      { id: 'folders', label: 'Folder Structure', icon: 'folder' },
      { id: 'templates', label: 'Document Templates', icon: 'file-document' },
      { id: 'workflows', label: 'Workflow Configuration', icon: 'workflow' },
      { id: 'notifications', label: 'Notifications', icon: 'bell' }
    ];

    return sections.map(section => `
      <button onclick="systemSettingsManager.switchSection('${section.id}')"
              class="flex-1 px-4 py-4 text-center text-sm font-medium
                     ${this.currentSection === section.id ? 
                       'text-blue-600 bg-blue-50' : 
                       'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}">
        <span class="mdi mdi-${section.icon} mr-2"></span>
        ${section.label}
      </button>
    `).join('');
  }

  renderSettingsContent() {
    switch (this.currentSection) {
      case 'general':
        return this.renderGeneralSettings();
      case 'folders':
        return this.renderFolderSettings();
      case 'templates':
        return this.renderTemplateSettings();
      case 'workflows':
        return this.renderWorkflowSettings();
      case 'notifications':
        return this.renderNotificationSettings();
      default:
        return '';
    }
  }

  renderGeneralSettings() {
    const settings = this.settings?.settings || {};
    
    return `
      <div class="space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <!-- Spreadsheet Settings -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Spreadsheet Configuration</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Spreadsheet ID
                </label>
                <input type="text"
                       value="${settings.SPREADSHEET_ID || ''}"
                       onchange="systemSettingsManager.updateSetting('SPREADSHEET_ID', this.value)"
                       class="mt-1 input-field">
              </div>
            </div>

            <!-- Sheet Names -->
            <div class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Sheet Names</h4>
              ${this.renderSheetSettings(settings.SHEETS)}
            </div>
          </div>

          <!-- Current Year -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Current Customer Year
            </label>
            <input type="number"
                   value="${settings.CURRENT_CUSTOMER_YEAR || new Date().getFullYear()}"
                   onchange="systemSettingsManager.updateSetting('CURRENT_CUSTOMER_YEAR', this.value)"
                   class="mt-1 input-field w-32">
          </div>
        </div>
      </div>
    `;
  }

  renderFolderSettings() {
    const folderConfig = this.settings?.configuration?.folders || {};
    
    return `
      <div class="space-y-6">
        <!-- Root Folder -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Parent Folder ID
          </label>
          <div class="mt-1 flex items-center space-x-2">
            <input type="text"
                   value="${folderConfig.parent || ''}"
                   onchange="systemSettingsManager.updateFolderSetting('parent', this.value)"
                   class="input-field flex-1">
            <button onclick="systemSettingsManager.validateFolder('parent')"
                    class="btn-secondary">
              Validate
            </button>
          </div>
        </div>

        <!-- Folder Structure -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Project Folder Structure</h3>
          ${this.renderFolderStructure(folderConfig.structure?.project)}
        </div>
      </div>
    `;
  }

  renderTemplateSettings() {
    const templates = this.settings?.configuration?.templates || {};
    
    return `
      <div class="space-y-6">
        <!-- Estimate Template -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Estimate Template</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Template Document ID
              </label>
              <input type="text"
                     value="${templates.estimate?.docId || ''}"
                     onchange="systemSettingsManager.updateTemplateSetting('estimate.docId', this.value)"
                     class="mt-1 input-field">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Template Folder ID
              </label>
              <input type="text"
                     value="${templates.estimate?.folder || ''}"
                     onchange="systemSettingsManager.updateTemplateSetting('estimate.folder', this.value)"
                     class="mt-1 input-field">
            </div>
          </div>

          <!-- Template Replacements -->
          <div class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Template Replacements</h4>
            ${this.renderTemplateReplacements(templates.estimate?.replacements)}
          </div>
        </div>
      </div>
    `;
  }

  renderWorkflowSettings() {
    const workflows = this.settings?.workflows || {};
    
    return `
      <div class="space-y-6">
        <!-- Project Workflow -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Project Workflow</h3>
          ${this.renderWorkflowStates(workflows.projectManagement)}
        </div>

        <!-- Estimate Workflow -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Estimate Workflow</h3>
          ${this.renderWorkflowStates(workflows.estimateManagement)}
        </div>

        <!-- Customer Workflow -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Customer Workflow</h3>
          ${this.renderWorkflowStates(workflows.customerManagement)}
        </div>
      </div>
    `;
  }

  renderNotificationSettings() {
    return `
      <div class="space-y-6">
        <!-- Email Notifications -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
          ${this.renderNotificationRules()}
        </div>
      </div>
    `;
  }

  async loadSettings() {
    try {
      this.settings = await google.script.run
        .withSuccessHandler(settings => settings)
        .withFailureHandler(error => {
          throw error;
        })
        .getSystemSettings();

      this.render();
      
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'SystemSettingsManager.loadSettings'
      });
    }
  }

  async saveChanges() {
    try {
      await google.script.run
        .withSuccessHandler(() => {
          this.isDirty = false;
          NotificationSystem.notify({
            type: 'success',
            message: 'Settings saved successfully'
          });
        })
        .withFailureHandler(error => {
          throw error;
        })
        .updateSystemSettings(this.settings);
        
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'SystemSettingsManager.saveChanges'
      });
    }
  }

  updateSetting(path, value) {
    const parts = path.split('.');
    let current = this.settings;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
    this.isDirty = true;
    this.render();
  }

  async validateFolder(folderId) {
    try {
      const isValid = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .validateFolderId(folderId);

      NotificationSystem.notify({
        type: isValid ? 'success' : 'error',
        message: isValid ? 'Folder is valid' : 'Invalid folder ID'
      });
        
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'SystemSettingsManager.validateFolder',
        folderId
      });
    }
  }
}
class ConfigurationValidator {
  constructor() {
    this.validationResults = {
      sheets: {},
      folders: {},
      templates: {},
      workflows: {}
    };
  }

  async validateAll() {
    try {
      const results = await Promise.all([
        this.validateSheetConfiguration(),
        this.validateFolderStructure(),
        this.validateTemplates(),
        this.validateWorkflows()
      ]);

      return {
        isValid: results.every(r => r.isValid),
        results: this.validationResults
      };
    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'ConfigurationValidator.validateAll'
      });
      return { isValid: false, error: error.message };
    }
  }

  async validateSheetConfiguration() {
    const sheets = this.getRequiredSheets();
    const results = {};

    for (const sheet of sheets) {
      try {
        const isValid = await google.script.run
          .withSuccessHandler(result => result)
          .withFailureHandler(error => {
            throw error;
          })
          .validateSheet(sheet);

        results[sheet] = {
          isValid,
          message: isValid ? 'Sheet exists and is accessible' : 'Sheet not found or inaccessible'
        };
      } catch (error) {
        results[sheet] = {
          isValid: false,
          error: error.message
        };
      }
    }

    this.validationResults.sheets = results;
    return {
      isValid: Object.values(results).every(r => r.isValid),
      results
    };
  }

  async validateFolderStructure() {
    const folders = this.getRequiredFolders();
    const results = {};

    for (const folder of folders) {
      try {
        const isValid = await google.script.run
          .withSuccessHandler(result => result)
          .withFailureHandler(error => {
            throw error;
          })
          .validateFolder(folder);

        results[folder] = {
          isValid,
          message: isValid ? 'Folder exists and is accessible' : 'Folder not found or inaccessible'
        };
      } catch (error) {
        results[folder] = {
          isValid: false,
          error: error.message
        };
      }
    }

    this.validationResults.folders = results;
    return {
      isValid: Object.values(results).every(r => r.isValid),
      results
    };
  }

  async validateTemplates() {
    const templates = this.getRequiredTemplates();
    const results = {};

    for (const template of templates) {
      try {
        const isValid = await google.script.run
          .withSuccessHandler(result => result)
          .withFailureHandler(error => {
            throw error;
          })
          .validateTemplate(template);

        results[template] = {
          isValid,
          message: isValid ? 'Template exists and is valid' : 'Template not found or invalid'
        };
      } catch (error) {
        results[template] = {
          isValid: false,
          error: error.message
        };
      }
    }

    this.validationResults.templates = results;
    return {
      isValid: Object.values(results).every(r => r.isValid),
      results
    };
  }

  getRequiredSheets() {
    return [
      'PROJECTS',
      'TIME_LOGS',
      'MATERIALS_RECEIPTS',
      'SUBCONTRACTORS',
      'SUBINVOICES',
      'ESTIMATES',
      'CUSTOMERS',
      'ACTIVITY_LOG',
      'VENDORS'
    ];
  }

  getRequiredFolders() {
    return [
      'PARENT_ID',
      'TEMPLATES_FOLDER',
      'ESTIMATES_FOLDER'
    ];
  }

  getRequiredTemplates() {
    return [
      'ESTIMATE_TEMPLATE'
    ];
  }
}

// filepath: /workspaces/AKC-GEMINI/src/client/components/Settings/ConfigurationBackupRestore.js
class ConfigurationBackupRestore {
  constructor() {
    this.currentConfig = null;
    this.backupHistory = [];
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString();
      const config = await this.getCurrentConfig();
      
      const backup = {
        timestamp,
        version: '1.0',
        config: config,
        metadata: {
          createdBy: AuthManager.getCurrentUser().email,
          environment: process.env.NODE_ENV
        }
      };

      const backupId = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .saveConfigurationBackup(backup);

      NotificationSystem.notify({
        type: 'success',
        message: 'Configuration backup created successfully'
      });

      return backupId;

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'ConfigurationBackupRestore.createBackup'
      });
      throw error;
    }
  }

  async restoreFromBackup(backupId) {
    try {
      // First validate the backup
      const isValid = await this.validateBackup(backupId);
      if (!isValid) {
        throw new Error('Invalid backup configuration');
      }

      // Create a backup of current configuration before restoring
      await this.createBackup();

      // Restore the configuration
      await google.script.run
        .withSuccessHandler(() => {
          NotificationSystem.notify({
            type: 'success',
            message: 'Configuration restored successfully'
          });
        })
        .withFailureHandler(error => {
          throw error;
        })
        .restoreConfigurationFromBackup(backupId);

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'ConfigurationBackupRestore.restoreFromBackup',
        backupId
      });
      throw error;
    }
  }

  async validateBackup(backupId) {
    try {
      const backup = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .getConfigurationBackup(backupId);

      const validator = new ConfigurationValidator();
      const validationResult = await validator.validateAll();

      return validationResult.isValid;

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'ConfigurationBackupRestore.validateBackup',
        backupId
      });
      return false;
    }
  }

  async getBackupHistory() {
    try {
      this.backupHistory = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .getConfigurationBackupHistory();

      return this.backupHistory;

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'ConfigurationBackupRestore.getBackupHistory'
      });
      return [];
    }
  }

  renderBackupHistory() {
    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Backup History</h3>
          <button onclick="configBackupRestore.createBackup()"
                  class="btn-primary">
            <span class="mdi mdi-backup-restore mr-2"></span>
            Create Backup
          </button>
        </div>

        ${this.backupHistory.length ? `
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" class="divide-y divide-gray-200">
              ${this.backupHistory.map(backup => `
                <li>
                  <div class="px-4 py-4 flex items-center sm:px-6">
                    <div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <div class="flex text-sm">
                          <p class="font-medium text-blue-600 truncate">
                            Backup ${backup.version}
                          </p>
                          <p class="ml-1 flex-shrink-0 font-normal text-gray-500">
                            created by ${backup.metadata.createdBy}
                          </p>
                        </div>
                        <div class="mt-2 flex">
                          <div class="flex items-center text-sm text-gray-500">
                            <span class="mdi mdi-calendar mr-1.5"></span>
                            <p>${new Date(backup.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="ml-5 flex-shrink-0">
                      <button onclick="configBackupRestore.restoreFromBackup('${backup.id}')"
                              class="btn-secondary text-sm">
                        Restore
                      </button>
                    </div>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : `
          <div class="text-center text-gray-500 py-4">
            No backup history found
          </div>
        `}
      </div>
    `;
  }
}
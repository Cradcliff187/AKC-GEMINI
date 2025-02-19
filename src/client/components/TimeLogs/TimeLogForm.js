class TimeLogForm {
  constructor(timeLog = null) {
    this.timeLog = timeLog;
    this.isEdit = !!timeLog;
    this.projects = [];
  }

  render() {
    return `
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" 
           id="timelog-modal">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center pb-3 border-b">
            <h3 class="text-xl font-semibold text-gray-900">
              ${this.isEdit ? 'Edit Time Log' : 'Log Time'}
            </h3>
            <button onclick="timeLogForm.close()" 
                    class="text-gray-400 hover:text-gray-500">
              <span class="mdi mdi-close text-xl"></span>
            </button>
          </div>

          <form id="timeLogForm" class="space-y-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Project</label>
              <select name="ProjectID" class="mt-1 input-field" required>
                <option value="">Select Project</option>
                ${this.projects.map(project => `
                  <option value="${project.ProjectID}" 
                          ${this.timeLog?.ProjectID === project.ProjectID ? 'selected' : ''}>
                    ${project.ProjectName}
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Date Worked</label>
              <input type="date" 
                     name="DateWorked" 
                     value="${this.timeLog?.DateWorked || new Date().toISOString().split('T')[0]}"
                     class="mt-1 input-field" 
                     required>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Start Time</label>
                <input type="time" 
                       name="StartTime" 
                       value="${this.timeLog?.StartTime || ''}"
                       class="mt-1 input-field" 
                       required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">End Time</label>
                <input type="time" 
                       name="EndTime" 
                       value="${this.timeLog?.EndTime || ''}"
                       class="mt-1 input-field" 
                       required>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">For User</label>
              <input type="email" 
                     name="ForUserEmail" 
                     value="${this.timeLog?.ForUserEmail || ''}"
                     placeholder="Enter email address"
                     class="mt-1 input-field">
            </div>

            <div class="border-t pt-4 mt-6 flex justify-end space-x-3">
              <button type="button" 
                      onclick="timeLogForm.close()" 
                      class="btn-secondary">
                Cancel
              </button>
              <button type="submit" 
                      onclick="timeLogForm.save(event)" 
                      class="btn-primary">
                ${this.isEdit ? 'Update' : 'Submit'} Time Log
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
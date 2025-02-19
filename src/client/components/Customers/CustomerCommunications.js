class CustomerCommunications {
  constructor(customerId) {
    this.customerId = customerId;
    this.communications = [];
    this.communicationTypes = {
      ESTIMATE_FOLLOWUP: 'Estimate Follow-up',
      PAYMENT_REMINDER: 'Payment Reminder',
      STATUS_UPDATE: 'Status Update',
      EMAIL: 'Email',
      PHONE: 'Phone Call',
      MEETING: 'Meeting'
    };
    this.statusColors = {
      DRAFT: 'gray',
      SENT: 'blue',
      DELIVERED: 'green',
      READ: 'green',
      REPLIED: 'purple',
      FAILED: 'red'
    };
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header Section -->
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg font-medium text-gray-900">Communications</h2>
            <p class="text-sm text-gray-500">Manage all customer communications</p>
          </div>
          <button onclick="customerCommunications.newCommunication()" 
                  class="btn-primary">
            <span class="mdi mdi-plus mr-2"></span>
            New Communication
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Type</label>
              <select onchange="customerCommunications.filterByType(this.value)" 
                      class="mt-1 input-field">
                <option value="all">All Types</option>
                ${Object.entries(this.communicationTypes).map(([key, label]) => `
                  <option value="${key}">${label}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select onchange="customerCommunications.filterByStatus(this.value)" 
                      class="mt-1 input-field">
                <option value="all">All Statuses</option>
                ${Object.entries(this.statusColors).map(([status]) => `
                  <option value="${status}">${status}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date Range</label>
              <input type="date" class="mt-1 input-field" 
                     onchange="customerCommunications.filterByDate(this.value)">
            </div>
          </div>
        </div>

        <!-- Communications Timeline -->
        <div class="bg-white rounded-lg shadow">
          <div class="flow-root p-6">
            <ul class="-mb-8">
              ${this.communications.map((comm, idx) => `
                <li>
                  <div class="relative pb-8">
                    ${idx < this.communications.length - 1 ? 
                      '<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>' : ''}
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white 
                                   bg-${this.statusColors[comm.Status]}-100">
                          <span class="mdi mdi-${this.getTypeIcon(comm.Type)} 
                                     text-${this.statusColors[comm.Status]}-600"></span>
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="relative flex items-center justify-between">
                          <div>
                            <p class="text-sm text-gray-500">
                              ${this.communicationTypes[comm.Type]}
                            </p>
                            <h3 class="text-base font-medium text-gray-900">${comm.Subject}</h3>
                          </div>
                          <span class="text-sm text-gray-500">
                            ${new Date(comm.CreatedOn).toLocaleDateString()}
                          </span>
                        </div>
                        <div class="mt-2 text-sm text-gray-700">
                          <p>${comm.Content}</p>
                        </div>
                        <div class="mt-2 flex items-center space-x-4">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                     bg-${this.statusColors[comm.Status]}-100 
                                     text-${this.statusColors[comm.Status]}-800">
                            ${comm.Status}
                          </span>
                          <span class="text-sm text-gray-500">
                            Sent to: ${comm.SentTo}
                          </span>
                          <button onclick="customerCommunications.viewDetails('${comm.CommunicationID}')"
                                  class="text-sm text-blue-600 hover:text-blue-800">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  getTypeIcon(type) {
    const icons = {
      ESTIMATE_FOLLOWUP: 'file-document',
      PAYMENT_REMINDER: 'currency-usd',
      STATUS_UPDATE: 'information',
      EMAIL: 'email',
      PHONE: 'phone',
      MEETING: 'calendar'
    };
    return icons[type] || 'message';
  }
}

// New Communication Modal
class CommunicationModal {
  render() {
    return `
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" 
           id="communication-modal">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center pb-3 border-b">
            <h3 class="text-xl font-semibold text-gray-900">New Communication</h3>
            <button onclick="communicationModal.close()" 
                    class="text-gray-400 hover:text-gray-500">
              <span class="mdi mdi-close text-xl"></span>
            </button>
          </div>

          <form id="communicationForm" class="space-y-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Type</label>
              <select name="Type" class="mt-1 input-field" required>
                ${Object.entries(this.communicationTypes).map(([key, label]) => `
                  <option value="${key}">${label}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Subject</label>
              <input type="text" name="Subject" class="mt-1 input-field" required>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Content</label>
              <textarea name="Content" rows="4" class="mt-1 input-field" required></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Send To</label>
              <input type="email" name="SentTo" class="mt-1 input-field" required>
            </div>

            <div class="border-t pt-4 mt-6 flex justify-end space-x-3">
              <button type="button" onclick="communicationModal.close()" 
                      class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">Send Communication</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
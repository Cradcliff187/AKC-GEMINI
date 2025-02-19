class CustomerContacts {
  constructor(customerId) {
    this.customerId = customerId;
    this.contacts = [];
    this.roles = {
      PRIMARY: 'Primary',
      BILLING: 'Billing',
      TECHNICAL: 'Technical',
      MANAGEMENT: 'Management',
      OTHER: 'Other'
    };
  }

  render() {
    return `
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-medium text-gray-900">Contacts</h2>
          <button onclick="customerContacts.addContact()" class="btn-primary">
            <span class="mdi mdi-plus mr-2"></span>
            Add Contact
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.contacts.map(contact => `
            <div class="bg-white rounded-lg shadow-sm border p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">${contact.Name}</h3>
                  <p class="text-sm text-gray-500">${this.roles[contact.Role]}</p>
                </div>
                ${contact.IsPrimary === 'YES' ? `
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                ` : ''}
              </div>
              
              <div class="mt-4 space-y-2">
                <div class="flex items-center text-sm">
                  <span class="mdi mdi-email mr-2 text-gray-400"></span>
                  ${contact.Email}
                </div>
                <div class="flex items-center text-sm">
                  <span class="mdi mdi-phone mr-2 text-gray-400"></span>
                  ${contact.Phone}
                </div>
                ${contact.Title ? `
                  <div class="flex items-center text-sm">
                    <span class="mdi mdi-briefcase mr-2 text-gray-400"></span>
                    ${contact.Title}
                  </div>
                ` : ''}
              </div>

              <div class="mt-4 pt-4 border-t flex justify-end space-x-2">
                <button onclick="customerContacts.editContact('${contact.ContactID}')" 
                        class="text-sm text-blue-600 hover:text-blue-800">
                  Edit
                </button>
                <button onclick="customerContacts.deleteContact('${contact.ContactID}')" 
                        class="text-sm text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}
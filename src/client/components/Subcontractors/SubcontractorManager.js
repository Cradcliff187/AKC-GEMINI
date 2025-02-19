class SubcontractorManager {
  constructor() {
    this.subcontractors = [];
    this.currentSub = null;
    this.invoices = [];
    this.activeProjects = [];
  }

  render() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Subcontractor Management</h2>
            <p class="text-sm text-gray-500">Manage subcontractors and invoices</p>
          </div>
          <button onclick="subcontractorManager.showNewSubModal()"
                  class="btn-primary">
            <span class="mdi mdi-plus mr-2"></span>
            Add Subcontractor
          </button>
        </div>

        <!-- Subcontractors Table -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Projects
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Invoiced
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${this.renderSubcontractorRows()}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Invoices -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Recent Invoices</h3>
            <button onclick="subcontractorManager.showNewInvoiceModal()"
                    class="btn-secondary">
              <span class="mdi mdi-file-plus mr-2"></span>
              Add Invoice
            </button>
          </div>
          ${this.renderRecentInvoices()}
        </div>

        <!-- New Subcontractor Modal -->
        <div id="new-sub-modal" class="modal hidden">
          ${this.renderNewSubForm()}
        </div>

        <!-- New Invoice Modal -->
        <div id="new-invoice-modal" class="modal hidden">
          ${this.renderNewInvoiceForm()}
        </div>
      </div>
    `;
  }

  renderSubcontractorRows() {
    if (!this.subcontractors.length) {
      return `
        <tr>
          <td colspan="6" class="px-6 py-4 text-center text-gray-500">
            No subcontractors found
          </td>
        </tr>
      `;
    }

    return this.subcontractors.map(sub => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${sub.SubName}</div>
          <div class="text-sm text-gray-500">ID: ${sub.SubID}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${sub.ContactEmail}</div>
          <div class="text-sm text-gray-500">${sub.Phone}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${sub.City}, ${sub.State}</div>
          <div class="text-sm text-gray-500">${sub.Zip}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${this.getActiveProjectCount(sub.SubID)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${this.formatCurrency(this.getTotalInvoiced(sub.SubID))}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button onclick="subcontractorManager.viewSubDetails('${sub.SubID}')"
                  class="text-blue-600 hover:text-blue-900 mr-3">
            View
          </button>
          <button onclick="subcontractorManager.editSub('${sub.SubID}')"
                  class="text-indigo-600 hover:text-indigo-900">
            Edit
          </button>
        </td>
      </tr>
    `).join('');
  }

  renderRecentInvoices() {
    if (!this.invoices.length) {
      return `
        <div class="text-center text-gray-500 py-4">
          No recent invoices
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        ${this.invoices.map(invoice => `
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <span class="mdi mdi-file-document-outline text-2xl text-gray-400"></span>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">
                  ${invoice.SubName}
                </div>
                <div class="text-sm text-gray-500">
                  Project: ${invoice.ProjectName}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">
                ${this.formatCurrency(invoice.InvoiceAmount)}
              </div>
              <div class="text-xs text-gray-500">
                ${this.formatDate(invoice.CreatedOn)}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderNewSubForm() {
    return `
      <div class="bg-white rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Subcontractor</h3>
        <form id="new-sub-form" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Company Name -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input type="text" 
                     name="subName"
                     class="mt-1 input-field"
                     required>
            </div>

            <!-- Contact Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input type="email" 
                     name="contactEmail"
                     class="mt-1 input-field"
                     required>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input type="tel" 
                     name="phone"
                     class="mt-1 input-field"
                     pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                     placeholder="123-456-7890"
                     required>
            </div>

            <!-- Address -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input type="text" 
                     name="address"
                     class="mt-1 input-field"
                     required>
            </div>

            <!-- City -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                City
              </label>
              <input type="text" 
                     name="city"
                     class="mt-1 input-field"
                     required>
            </div>

            <!-- State -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                State
              </label>
              <input type="text" 
                     name="state"
                     class="mt-1 input-field"
                     required
                     maxlength="2">
            </div>

            <!-- ZIP -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input type="text" 
                     name="zip"
                     class="mt-1 input-field"
                     required
                     pattern="[0-9]{5}">
            </div>
          </div>

          <div class="mt-5 flex justify-end space-x-3">
            <button type="button"
                    onclick="subcontractorManager.closeNewSubModal()"
                    class="btn-secondary">
              Cancel
            </button>
            <button type="submit"
                    onclick="subcontractorManager.createSubcontractor(event)"
                    class="btn-primary">
              Create Subcontractor
            </button>
          </div>
        </form>
      </div>
    `;
  }

  renderNewInvoiceForm() {
    return `
      <div class="bg-white rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Add Subcontractor Invoice</h3>
        <form id="new-invoice-form" class="space-y-4">
          <!-- Subcontractor Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Subcontractor
            </label>
            <select name="subId" 
                    class="mt-1 input-field" 
                    required>
              <option value="">Select Subcontractor</option>
              ${this.subcontractors.map(sub => `
                <option value="${sub.SubID}">${sub.SubName}</option>
              `).join('')}
            </select>
          </div>

          <!-- Project Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Project
            </label>
            <select name="projectId" 
                    class="mt-1 input-field" 
                    required>
              <option value="">Select Project</option>
              ${this.activeProjects?.map(project => `
                <option value="${project.ProjectID}">${project.ProjectName}</option>
              `).join('')}
            </select>
          </div>

          <!-- Invoice Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Invoice Amount
            </label>
            <input type="number"
                   name="invoiceAmount"
                   step="0.01"
                   min="0"
                   class="mt-1 input-field"
                   required>
          </div>

          <!-- Invoice Document -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Invoice Document
            </label>
            <div class="mt-1 flex items-center">
              <input type="file"
                     name="invoiceFile"
                     accept=".pdf"
                     class="hidden"
                     id="invoice-file-input">
              <button type="button"
                      onclick="document.getElementById('invoice-file-input').click()"
                      class="btn-secondary text-sm">
                <span class="mdi mdi-upload mr-2"></span>
                Upload Invoice
              </button>
              <span id="selected-file-name" class="ml-3 text-sm text-gray-500"></span>
            </div>
          </div>

          <div class="mt-5 flex justify-end space-x-3">
            <button type="button"
                    onclick="subcontractorManager.closeNewInvoiceModal()"
                    class="btn-secondary">
              Cancel
            </button>
            <button type="submit"
                    onclick="subcontractorManager.submitInvoice(event)"
                    class="btn-primary">
              Submit Invoice
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async createSubcontractor(event) {
    event.preventDefault();
    const form = document.getElementById('new-sub-form');
    const formData = new FormData(form);

    try {
      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .createSubcontractor({
          subName: formData.get('subName'),
          address: formData.get('address'),
          city: formData.get('city'),
          state: formData.get('state'),
          zip: formData.get('zip'),
          contactEmail: formData.get('contactEmail'),
          phone: formData.get('phone')
        });

      this.subcontractors.push(response);
      this.closeNewSubModal();
      
      NotificationSystem.notify({
        type: 'success',
        message: 'Subcontractor created successfully'
      });

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'SubcontractorManager.createSubcontractor'
      });
    }
  }

  async submitInvoice(event) {
    event.preventDefault();
    const form = document.getElementById('new-invoice-form');
    const formData = new FormData(form);
    const fileInput = document.getElementById('invoice-file-input');

    try {
      // Upload file first if present
      let invoiceDocURL = null;
      if (fileInput.files.length > 0) {
        invoiceDocURL = await this.uploadInvoiceFile(fileInput.files[0]);
      }

      const subcontractor = this.subcontractors.find(s => s.SubID === formData.get('subId'));
      const project = this.activeProjects.find(p => p.ProjectID === formData.get('projectId'));

      const response = await google.script.run
        .withSuccessHandler(result => result)
        .withFailureHandler(error => {
          throw error;
        })
        .submitSubInvoice({
          projectId: formData.get('projectId'),
          projectName: project.ProjectName,
          subId: formData.get('subId'),
          subName: subcontractor.SubName,
          invoiceAmount: parseFloat(formData.get('invoiceAmount')),
          invoiceDocURL
        });

      this.invoices.unshift(response);
      this.closeNewInvoiceModal();

      NotificationSystem.notify({
        type: 'success',
        message: 'Invoice submitted successfully'
      });

    } catch (error) {
      ErrorHandler.handleError(error, {
        context: 'SubcontractorManager.submitInvoice'
      });
    }
  }

  getActiveProjectCount(subId) {
    return this.activeProjects.filter(project => 
      this.invoices.some(invoice => 
        invoice.SubID === subId && 
        invoice.ProjectID === project.ProjectID
      )
    ).length;
  }

  getTotalInvoiced(subId) {
    return this.invoices
      .filter(invoice => invoice.SubID === subId)
      .reduce((sum, invoice) => sum + invoice.InvoiceAmount, 0);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }
}
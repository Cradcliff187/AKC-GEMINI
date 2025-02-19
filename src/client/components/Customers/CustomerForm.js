class CustomerForm {
  constructor(customer = null) {
    this.customer = customer;
    this.isEdit = !!customer;
  }

  render() {
    return `
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="customer-modal">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center pb-3 border-b">
            <h3 class="text-xl font-semibold text-gray-900">
              ${this.isEdit ? 'Edit Customer' : 'New Customer'}
            </h3>
            <button onclick="customerForm.close()" class="text-gray-400 hover:text-gray-500">
              <span class="mdi mdi-close text-xl"></span>
            </button>
          </div>

          <form id="customerForm" class="space-y-4 mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Customer Name</label>
                <input type="text" 
                       name="CustomerName" 
                       value="${this.customer?.CustomerName || ''}"
                       class="mt-1 input-field" 
                       required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" 
                       name="Email" 
                       value="${this.customer?.Email || ''}"
                       class="mt-1 input-field">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" 
                       name="Phone" 
                       value="${this.customer?.Phone || ''}"
                       class="mt-1 input-field">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" 
                       name="Address" 
                       value="${this.customer?.Address || ''}"
                       class="mt-1 input-field">
              </div>
            </div>

            <div class="border-t pt-4 mt-6 flex justify-end space-x-3">
              <button type="button" 
                      onclick="customerForm.close()" 
                      class="btn-secondary">Cancel</button>
              <button type="submit" 
                      onclick="customerForm.save(event)" 
                      class="btn-primary">
                ${this.isEdit ? 'Update' : 'Create'} Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
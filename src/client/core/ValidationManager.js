class ValidationManager {
  static rules = {
    required: (value) => ({
      valid: !!value && value.toString().trim() !== '',
      message: 'This field is required'
    }),

    email: (value) => ({
      valid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Please enter a valid email address'
    }),

    phone: (value) => ({
      valid: !value || /^\+?[\d\s-]{10,}$/.test(value),
      message: 'Please enter a valid phone number'
    }),

    zip: (value) => ({
      valid: !value || /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value),
      message: 'Please enter a valid ZIP code'
    }),

    currency: (value) => ({
      valid: !value || /^\$?\d+(\.\d{2})?$/.test(value),
      message: 'Please enter a valid amount'
    }),

    date: (value) => ({
      valid: !value || !isNaN(Date.parse(value)),
      message: 'Please enter a valid date'
    })
  };

  static async validateForm(formData, schema) {
    const errors = {};
    const validations = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = formData[field];
      
      if (Array.isArray(rules)) {
        for (const rule of rules) {
          if (typeof rule === 'function') {
            // Custom validation function
            validations.push(
              Promise.resolve(rule(value, formData))
                .then(result => {
                  if (!result.valid) {
                    errors[field] = result.message;
                  }
                })
            );
          } else if (typeof rule === 'string' && this.rules[rule]) {
            // Built-in validation rule
            const result = this.rules[rule](value);
            if (!result.valid) {
              errors[field] = result.message;
            }
          }
        }
      }
    }

    await Promise.all(validations);
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static getFieldValidator(fieldType) {
    switch (fieldType) {
      case 'email':
        return this.rules.email;
      case 'phone':
        return this.rules.phone;
      case 'currency':
        return this.rules.currency;
      case 'zip':
        return this.rules.zip;
      case 'date':
        return this.rules.date;
      default:
        return null;
    }
  }

  // Custom validators based on blueprint requirements
  static validateEstimateAmount(amount, formData) {
    return {
      valid: amount > 0 && (!formData.contingencyAmount || amount > formData.contingencyAmount),
      message: 'Estimate amount must be greater than 0 and contingency amount'
    };
  }

  static validateProjectName(name) {
    return {
      valid: name && name.length >= 3 && name.length <= 100,
      message: 'Project name must be between 3 and 100 characters'
    };
  }

  static validateFileUpload(file) {
    const maxSize = 10485760; // 10MB from blueprint
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ];

    if (!file) {
      return { valid: false, message: 'Please select a file' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Invalid file type. Please upload a PDF, PNG, JPG, or GIF file' };
    }

    if (file.size > maxSize) {
      return { valid: false, message: 'File size exceeds 10MB limit' };
    }

    return { valid: true };
  }

  static validateStatusTransition(currentStatus, newStatus, workflowType) {
    const workflows = {
      project: this.getProjectWorkflow(),
      estimate: this.getEstimateWorkflow(),
      customer: this.getCustomerWorkflow()
    };

    const workflow = workflows[workflowType];
    if (!workflow) {
      return { valid: false, message: 'Invalid workflow type' };
    }

    const allowedTransitions = workflow[currentStatus] || [];
    return {
      valid: allowedTransitions.includes(newStatus),
      message: `Invalid status transition from ${currentStatus} to ${newStatus}`
    };
  }

  static getProjectWorkflow() {
    return {
      PENDING: ['APPROVED', 'CANCELLED'],
      APPROVED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: ['CLOSED'],
      CANCELLED: [],
      CLOSED: []
    };
  }

  static getEstimateWorkflow() {
    return {
      DRAFT: ['PENDING', 'CANCELLED'],
      PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
      APPROVED: ['COMPLETED', 'CANCELLED'],
      REJECTED: ['DRAFT', 'CANCELLED'],
      COMPLETED: ['CLOSED'],
      CANCELLED: [],
      CLOSED: []
    };
  }

  static getCustomerWorkflow() {
    return {
      PENDING: ['ACTIVE', 'INACTIVE'],
      ACTIVE: ['INACTIVE', 'ARCHIVED'],
      INACTIVE: ['ACTIVE', 'ARCHIVED'],
      ARCHIVED: ['ACTIVE']
    };
  }
}
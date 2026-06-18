// ==========================================
// Form Validation System
// ==========================================

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errors = {};
        this.init();
    }

    init() {
        if (!this.form) return;

        // Add event listeners for real-time validation
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.form.addEventListener('reset', () => this.clearErrors());

        // Real-time validation on input
        this.form.querySelectorAll('.form-input, .form-textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => {
                if (this.errors[field.name]) {
                    this.validateField(field);
                }
            });
        });

        // Character count for textarea
        const messageField = document.getElementById('message');
        if (messageField) {
            messageField.addEventListener('input', () => this.updateCharCount());
        }

        // Terms checkbox validation
        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', () => {
                if (this.errors['terms']) {
                    this.validateField(termsCheckbox);
                }
            });
        }
    }

    // ==========================================
    // Field Validation Methods
    // ==========================================

    validateField(field) {
        const fieldName = field.name;
        const fieldValue = field.value.trim();
        let error = '';

        // Check field type and validate accordingly
        if (field.type === 'checkbox') {
            if (!field.checked) {
                error = 'You must agree to the terms and conditions';
            }
        } else {
            // Check for empty fields
            if (!fieldValue) {
                error = this.getEmptyFieldError(fieldName);
            } else {
                // Specific validation based on field type
                switch (fieldName) {
                    case 'fullName':
                        error = this.validateName(fieldValue);
                        break;
                    case 'email':
                        error = this.validateEmail(fieldValue);
                        break;
                    case 'phone':
                        error = this.validatePhone(fieldValue);
                        break;
                    case 'message':
                        error = this.validateMessage(fieldValue);
                        break;
                }
            }
        }

        // Update error display
        this.updateFieldError(field, error);

        return !error;
    }

    validateName(name) {
        // Check minimum length
        if (name.length < 2) {
            return 'Name must be at least 2 characters long';
        }

        // Check maximum length
        if (name.length > 50) {
            return 'Name must not exceed 50 characters';
        }

        // Check for valid characters (letters, spaces, hyphens, apostrophes)
        const nameRegex = /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(name)) {
            return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }

        return '';
    }

    validateEmail(email) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address (e.g., user@example.com)';
        }

        // Check email length
        if (email.length > 100) {
            return 'Email address is too long';
        }

        // Additional validation: check for common typos
        const commonTypos = {
            'gmial.com': 'gmail.com',
            'yahooo.com': 'yahoo.com',
            'hotmial.com': 'hotmail.com'
        };

        const domain = email.split('@')[1];
        if (commonTypos[domain]) {
            return `Did you mean ${commonTypos[domain]}?`;
        }

        return '';
    }

    validatePhone(phone) {
        // Remove common formatting characters for validation
        const cleanPhone = phone.replace(/[\s\-()]+/g, '');

        // Check if it contains only digits and has reasonable length
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(cleanPhone)) {
            return 'Please enter a valid phone number (10-15 digits)';
        }

        // Format check: at least one of common formats
        const phonePattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!phonePattern.test(phone)) {
            return 'Please use a valid phone format (e.g., +1-234-567-8900 or (234) 567-8900)';
        }

        return '';
    }

    validateMessage(message) {
        // Check minimum length
        if (message.length < 10) {
            return 'Cover letter must be at least 10 characters long';
        }

        // Check maximum length
        if (message.length > 500) {
            return 'Cover letter cannot exceed 500 characters';
        }

        // Check for meaningful content (not just spaces or special characters)
        const meaningfulContent = message.replace(/[\s\W]/g, '');
        if (meaningfulContent.length < 10) {
            return 'Please provide a more detailed cover letter';
        }

        return '';
    }

    getEmptyFieldError(fieldName) {
        const errors = {
            'fullName': 'Please enter your full name',
            'email': 'Please enter your email address',
            'phone': 'Please enter your phone number',
            'message': 'Please enter your cover letter',
            'terms': 'You must agree to the terms and conditions'
        };

        return errors[fieldName] || 'This field is required';
    }

    // ==========================================
    // Error Display & Management
    // ==========================================

    updateFieldError(field, error) {
        const errorElement = document.getElementById(`${field.name}Error`);
        const fieldElement = field.type === 'checkbox' ? field : field;

        if (error) {
            this.errors[field.name] = error;
            
            if (errorElement) {
                errorElement.textContent = error;
                errorElement.classList.add('show');
            }

            // Add error class to field
            if (field.type !== 'checkbox') {
                field.classList.add('error');
            }
        } else {
            delete this.errors[field.name];

            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            }

            // Remove error class from field
            if (field.type !== 'checkbox') {
                field.classList.remove('error');
            }
        }
    }

    clearErrors() {
        this.errors = {};
        this.form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        this.form.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
            error.classList.remove('show');
        });
    }

    // ==========================================
    // Form Submission
    // ==========================================

    handleSubmit(e) {
        e.preventDefault();

        // Clear previous errors
        this.clearErrors();

        // Validate all fields
        const fields = this.form.querySelectorAll('.form-input, .form-textarea, .form-checkbox');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // If validation passes, show success message
        if (isValid) {
            this.showSuccessMessage();
        } else {
            // Scroll to first error
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    }

    showSuccessMessage() {
        const submitButton = this.form.querySelector('.btn-submit');
        const originalText = submitButton.textContent;

        // Disable button and show spinner
        submitButton.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            // Show success message
            const successMessage = document.getElementById('successMessage');
            if (successMessage) {
                successMessage.classList.remove('hidden');
            }

            // Log form data (in real app, this would be sent to server)
            this.logFormData();

            // Reset button
            submitButton.disabled = false;
        }, 1500);
    }

    logFormData() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        console.log('Form Data Submitted:');
        console.table(data);

        // In a real application, you would send this to your server:
        // fetch('/api/applications', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
    }

    // ==========================================
    // Utility Methods
    // ==========================================

    updateCharCount() {
        const messageField = document.getElementById('message');
        const charCount = document.getElementById('charCount');

        if (messageField && charCount) {
            charCount.textContent = messageField.value.length;
        }
    }
}

// ==========================================
// Initialize Form on DOM Load
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const validator = new FormValidator('jobApplicationForm');

    // Optional: Add some helpful UX features
    setupFormEnhancements();
});

// ==========================================
// Additional Form Enhancements
// ==========================================

function setupFormEnhancements() {
    // Prevent accidental form submission with unsaved changes
    const form = document.getElementById('jobApplicationForm');
    if (!form) return;

    let formDirty = false;

    form.querySelectorAll('.form-input, .form-textarea').forEach(field => {
        field.addEventListener('input', () => {
            formDirty = true;
        });
    });

    window.addEventListener('beforeunload', (e) => {
        if (formDirty && !form.classList.contains('submitted')) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    form.addEventListener('submit', () => {
        formDirty = false;
        form.classList.add('submitted');
    });

    // Auto-format phone number
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value.length <= 3) {
                    e.target.value = value;
                } else if (value.length <= 6) {
                    e.target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
                } else {
                    e.target.value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
                }
            }
        });
    }

    // Focus management for better accessibility
    const firstInput = form.querySelector('.form-input');
    if (firstInput && !firstInput.value) {
        setTimeout(() => {
            firstInput.focus();
        }, 100);
    }
}

// ==========================================
// Debugging Utilities (Optional)
// ==========================================

// Uncomment to enable debug mode
// window.FORM_DEBUG = true;

if (window.FORM_DEBUG) {
    console.log('Form Validation Debug Mode Enabled');

    // Log all validation events
    const originalValidateField = FormValidator.prototype.validateField;
    FormValidator.prototype.validateField = function(field) {
        const result = originalValidateField.call(this, field);
        console.log(`Field: ${field.name}, Valid: ${result}, Error: ${this.errors[field.name] || 'None'}`);
        return result;
    };
}

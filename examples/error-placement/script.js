// Example 1: Default Placement
// Errors appear immediately after the field (default behavior)
dv.validate('#defaultForm', {
  rules: {
    email: {
      required: true,
      email: true,
    },
    password: {
      required: true,
      minlength: 8,
    },
  },
  messages: {
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email',
    },
    password: {
      required: 'Password is required',
      minlength: 'Password must be at least 8 characters',
    },
  },
});

// Example 2: Specific Container
// Place errors in designated containers using data-error-placement attribute
dv.validate('#containerForm', {
  rules: {
    username: {
      required: true,
      minlength: 3,
    },
    email: {
      required: true,
      email: true,
    },
  },
  messages: {
    username: {
      required: 'Username is required',
      minlength: 'Username must be at least 3 characters',
    },
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email',
    },
  },
});

// Example 3: Grid Layout with Icons
// Errors appear in designated areas within grid rows
dv.validate('#gridForm', {
  rules: {
    firstName: {
      required: true,
      minlength: 2,
    },
    lastName: {
      required: true,
      minlength: 2,
    },
    phone: {
      required: true,
      minlength: 10,
    },
  },
  messages: {
    firstName: {
      required: 'First name is required',
      minlength: 'First name must be at least 2 characters',
    },
    lastName: {
      required: 'Last name is required',
      minlength: 'Last name must be at least 2 characters',
    },
    phone: {
      required: 'Phone number is required',
      minlength: 'Phone number must be at least 10 digits',
    },
  },
  errorElement: 'div',
  errorPlacement: (error, element) => {
    const row = element.closest('.form-row');
    const errorTarget = row ? row.querySelector('.error-target') : null;
    if (errorTarget) {
      errorTarget.appendChild(error);
    } else {
      element.parentElement.appendChild(error);
    }
  },
  highlight: (element) => {
    element.classList.add('error');
    const wrapper = element.closest('.input-wrapper');
    if (wrapper) {
      wrapper.classList.add('has-error');
    }
  },
  unhighlight: (element) => {
    element.classList.remove('error');
    const wrapper = element.closest('.input-wrapper');
    if (wrapper) {
      wrapper.classList.remove('has-error');
    }
  },
});

// Example 4: Error Summary
// All errors are collected and displayed at the top of the form
dv.validate('#summaryForm', {
  rules: {
    name: {
      required: true,
      minlength: 3,
    },
    email: {
      required: true,
      email: true,
    },
    message: {
      required: true,
      minlength: 10,
    },
  },
  messages: {
    name: {
      required: 'Full name is required',
      minlength: 'Name must be at least 3 characters',
    },
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email',
    },
    message: {
      required: 'Message is required',
      minlength: 'Message must be at least 10 characters',
    },
  },
  errorContainer: '#errorSummary',
  errorLabelContainer: '#errorList',
  wrapper: 'li',
  highlight: (element) => {
    element.classList.add('error');
  },
  unhighlight: (element) => {
    element.classList.remove('error');
  },
});

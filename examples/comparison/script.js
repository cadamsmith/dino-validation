function sharedConfig() {
  return {
    rules: {
      // Required field
      name: {
        required: true,
      },
      country: {
        required: true,
      },
      comments: {
        required: true,
      },
      contactMethod: {
        required: true,
      },

      // String format validators
      email: {
        required: true,
        email: true,
      },
      website: {
        required: true,
        url: true,
      },
      birthdate: {
        required: true,
        date: true,
      },
      startDate: {
        required: true,
        dateISO: true,
      },
      zipcode: {
        required: true,
        digits: true,
        minlength: 5,
        maxlength: 5,
      },
      price: {
        required: true,
        number: true,
      },

      // Length validators
      username: {
        required: true,
        minlength: 3,
        maxlength: 15,
      },
      bio: {
        required: true,
        rangelength: [10, 200],
      },
      interests: {
        required: true,
        minlength: 2,
      },
      skills: {
        required: true,
        maxlength: 3,
      },
      hobbies: {
        required: true,
        rangelength: [2, 4],
      },
      languages: {
        required: true,
        minlength: 2,
      },
      frameworks: {
        required: true,
        maxlength: 3,
      },
      topics: {
        required: true,
        rangelength: [2, 4],
      },

      // Numeric validators
      age: {
        required: true,
        number: true,
        min: 18,
      },
      discount: {
        required: true,
        number: true,
        max: 100,
      },
      rating: {
        required: true,
        number: true,
        range: [1, 5],
      },

      // Comparison validators
      password: {
        required: true,
      },
      confirmPassword: {
        required: true,
      },

      // Checkbox
      terms: {
        required: true,
      },
    },
    messages: {
      name: {
        required: 'Please enter your name',
      },
      country: {
        required: 'Please select a country',
      },
      comments: {
        required: 'Please enter your comments',
      },
      contactMethod: {
        required: 'Please select a contact method',
      },
      email: {
        required: 'Please enter your email',
        email: 'Please enter a valid email address',
      },
      website: {
        required: 'Please enter a website URL',
        url: 'Please enter a valid URL (e.g., https://example.com)',
      },
      birthdate: {
        required: 'Please enter your birth date',
        date: 'Please enter a valid date (e.g., 12/31/1990)',
      },
      startDate: {
        required: 'Please enter a start date',
        dateISO: 'Please enter a valid ISO date (e.g., 1990-12-31)',
      },
      zipcode: {
        required: 'Please enter a ZIP code',
        digits: 'ZIP code must contain only digits',
        minlength: 'ZIP code must be exactly {0} digits',
        maxlength: 'ZIP code must be exactly {0} digits',
      },
      price: {
        required: 'Please enter a price',
        number: 'Please enter a valid number',
      },
      username: {
        required: 'Please enter a username',
        minlength: 'Username must be at least {0} characters',
        maxlength: 'Username must be at most {0} characters',
      },
      bio: {
        required: 'Please enter a bio',
        rangelength: 'Bio must be between {0} and {1} characters',
      },
      interests: {
        required: 'Please select your interests',
        minlength: 'Please select at least {0} interests',
      },
      skills: {
        required: 'Please select your skills',
        maxlength: 'Please select at most {0} skills',
      },
      hobbies: {
        required: 'Please select your hobbies',
        rangelength: 'Please select between {0} and {1} hobbies',
      },
      languages: {
        required: 'Please select languages',
        minlength: 'Please select at least {0} languages',
      },
      frameworks: {
        required: 'Please select frameworks',
        maxlength: 'Please select at most {0} frameworks',
      },
      topics: {
        required: 'Please select topics',
        rangelength: 'Please select between {0} and {1} topics',
      },
      age: {
        required: 'Please enter your age',
        number: 'Please enter a valid number',
        min: 'You must be at least {0} years old',
      },
      discount: {
        required: 'Please enter a discount percentage',
        number: 'Please enter a valid number',
        max: 'Discount cannot exceed {0}%',
      },
      rating: {
        required: 'Please enter a rating',
        number: 'Please enter a valid number',
        range: 'Rating must be between {0} and {1}',
      },
      password: {
        required: 'Please enter a password',
      },
      confirmPassword: {
        required: 'Please confirm your password',
        equalTo: 'Passwords must match',
      },
      terms: {
        required: 'You must agree to the terms',
      },
    },
  };
}

function getJQConfig() {
  const config = sharedConfig();

  config.rules.confirmPassword.equalTo = '#jq-password';
  config.errorPlacement = (error, element) => {
    if (element.data('error-placement')) {
      document
        .querySelector(element.data('error-placement'))
        .appendChild(error[0]);
    } else {
      error.insertAfter(element);
    }
  };

  return config;
}

function getDVConfig() {
  const config = sharedConfig();

  config.rules.confirmPassword.equalTo = '#dv-password';

  return config;
}

// Initialize jQuery Validation form
const jqConfig = getJQConfig();
const jqValidator = $('#jqForm').validate(jqConfig);
jqValidator.form(); // Trigger validation on load

// Initialize dino-validation form
const dvConfig = getDVConfig();
const dvValidator = dv.validate('#dvForm', dvConfig);
dvValidator.form(); // Trigger validation on load

function syncForms(sourceId, targetId) {
  const sourceElement = document.getElementById(sourceId);
  const targetElement = document.getElementById(targetId);

  if (!sourceElement || !targetElement) {
    return;
  }

  if (sourceElement.type === 'checkbox' || sourceElement.type === 'radio') {
    targetElement.checked = sourceElement.checked;
  } else if (sourceElement.tagName === 'SELECT' && sourceElement.multiple) {
    // For multi-select, sync all options
    Array.from(sourceElement.options).forEach((option, index) => {
      targetElement.options[index].selected = option.selected;
    });
  } else {
    // For text inputs, textareas, single select
    targetElement.value = sourceElement.value;
  }

  if (targetId.startsWith('jq-')) {
    jqValidator.element(targetElement);
  } else {
    dvValidator.element(targetElement);
  }
}

// Add event listeners to all form elements
function setupFormSync() {
  const targets = ['select', 'textarea', 'input'];

  [...document.querySelectorAll(targets)].forEach((field) => {
    const fieldName = field.id.substring(3);

    // Get elements from both forms
    const jqElement = document.getElementById(`jq-${fieldName}`);
    const dvElement = document.getElementById(`dv-${fieldName}`);

    if (!(jqElement && dvElement)) {
      return;
    }

    // For regular inputs, use input event
    const eventType =
      jqElement.type === 'checkbox' || jqElement.type === 'radio'
        ? 'change'
        : 'input';

    // Add listeners for jQuery form elements
    jqElement.addEventListener(eventType, () => {
      syncForms(`jq-${fieldName}`, `dv-${fieldName}`, true);
    });

    // Add listeners for dino-validation form elements
    dvElement.addEventListener(eventType, () => {
      syncForms(`dv-${fieldName}`, `jq-${fieldName}`, false);
    });
  });
}

// Initialize form sync after validators are set up
setupFormSync();

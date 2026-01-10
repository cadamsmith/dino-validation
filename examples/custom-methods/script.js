// Define custom age verification method
dv.addMethod(
  'ageVerification',
  function ({ blank, value, param }) {
    if (blank) return true;

    // Parse the date
    const birthDate = new Date(value);
    const today = new Date();

    // Check if valid date
    if (isNaN(birthDate.getTime())) {
      return false;
    }

    // Check if date is not in the future
    if (birthDate > today) {
      return false;
    }

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Check minimum age (from param, defaults to 18)
    const minAge = param || 18;
    if (age < minAge) {
      return false;
    }

    // Check maximum reasonable age (120 years)
    return age <= 120;
  },
  'You must be at least {0} years old',
);

// Initialize validation
dv.validate('#signupForm', {
  rules: {
    birthdate: {
      required: true,
      ageVerification: 18, // Minimum age parameter
    },
  },
  messages: {
    birthdate: {
      required: 'Please enter your date of birth',
      ageVerification: 'You must be at least 18 years old to sign up',
    },
  },
  submitHandler: function (form, event) {
    // Prevent actual submission for demo
    event.preventDefault();

    // Show success message
    const successMsg = document.getElementById('success-message');
    successMsg.style.display = 'block';

    // Reset form
    form.reset();

    // Hide success message after 3 seconds
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 3000);
  },
});

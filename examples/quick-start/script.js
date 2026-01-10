// Initialize validation
dv.validate('#contactForm', {
  rules: {
    name: {
      required: true,
      minlength: 2,
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
      required: 'Please enter your name',
      minlength: 'Name must be at least 2 characters',
    },
    email: {
      required: 'Please enter your email address',
      email: 'Please enter a valid email address',
    },
    message: {
      required: 'Please enter a message',
      minlength: 'Message must be at least 10 characters',
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

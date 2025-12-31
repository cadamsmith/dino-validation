interface CodeExample {
  html: string;
  js: string;
  title: string;
  description?: string;
}

export const examples: Record<string, CodeExample> = {
  basic: {
    title: 'Basic Validation',
    description: 'Simple form with required field validation',
    html: `<form id="myForm">
  <input type="text" name="username" data-dino="required" />
  <button type="submit">Submit</button>
</form>`,
    js: `dv.validate("#myForm", {
  debug: true,
  success: "valid",
  rules: {
    username: {
      required: true
    }
  }
});`,
  },

  email: {
    title: 'Email Validation',
    description: 'Form with email validation',
    html: `<form id="emailForm">
  <input type="email" name="email" data-dino="required email" />
  <button type="submit">Subscribe</button>
</form>`,
    js: `dv.validate("#emailForm", {
  debug: true,
  success: "valid",
  rules: {
    email: {
      required: true,
      email: true
    }
  }
});`,
  },

  password: {
    title: 'Password Validation',
    description: 'Form with password and confirmation',
    html: `<form id="passwordForm">
  <input type="password" name="password" data-dino="required minlength:8" />
  <input type="password" name="confirmPassword" data-dino="required equalTo:password" />
  <button type="submit">Create Account</button>
</form>`,
    js: `dv.validate("#passwordForm", {
  debug: true,
  success: "valid",
  rules: {
    password: {
      required: true,
      minlength: 8
    },
    confirmPassword: {
      required: true,
      equalTo: "password"
    }
  }
});`,
  },
};

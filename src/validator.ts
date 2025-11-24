import {
  elementValue,
  escapeCssMeta,
  findByName,
  hideElement,
  idOrName,
  isBlankElement,
  isCheckableElement,
  isVisible,
  objectLength,
  showElement,
} from './helpers';
import { getRules, normalizeRule } from './rules';
import { getMessage } from './messages';
import { validatorStore } from './validatorStore';
import { store as methodStore } from './methods';
import { FormEventManager } from './eventDelegation';
import {
  FormControlElement,
  ValidationError,
  ValidationRuleset,
  ValidationRulesetParams,
  ValidatorSettings,
} from './types';

export class Validator {
  currentForm: HTMLFormElement;
  errorContext!: HTMLElement;
  submitted: Record<string, string> = {};
  invalid: Record<string, string> = {};
  successList: FormControlElement[] = [];
  errorList: ValidationError[] = [];
  errorMap: Record<string, string> = {};
  toShow: HTMLElement[] = [];
  toHide: HTMLElement[] = [];
  currentElements: FormControlElement[] = [];
  labelContainer: HTMLElement | null = null;
  containers: HTMLElement[] = [];

  /** normalized rules */
  rules: Record<string, ValidationRuleset> = {};

  /** event delegation manager */
  private eventDelegator!: FormEventManager;

  settings: ValidatorSettings = {
    ignore: ':hidden',
    errorClass: 'error',
    validClass: 'valid',
    errorElement: 'label',
    wrapper: null,
    errorLabelContainer: null,
    errorContainer: null,
    onfocusin: this.onFocusIn,
    onfocusout: this.onFocusOut,
    onkeyup: this.onKeyUp,
    onclick: this.onClick,
    highlight: this.highlight,
    unhighlight: this.unhighlight,
    errorPlacement: null,
    focusCleanup: false,
    rules: {},
    messages: {},
    escapeHtml: false,
  };

  /**
   * Initializes a new validator instance for the given form with optional configuration settings.
   * @param form - form element to validate
   * @param options - optional user configuration settings
   */
  constructor(form: HTMLFormElement, options?: Partial<ValidatorSettings>) {
    this.currentForm = form;
    this.settings = { ...this.settings, ...options };

    this.normalizeSettings();
    this.init();
  }

  /**
   * Normalizes Validator settings.
   * Currently, this only binds function settings to validator instance.
   */
  normalizeSettings(): void {
    // bind function settings to this validator instance
    [
      'onfocusin',
      'onfocusout',
      'onkeyup',
      'onclick',
      'highlight',
      'unhighlight',
      'errorPlacement',
      'invalidHandler',
    ].forEach((key) => {
      const setting = this.settings[key as keyof ValidatorSettings];
      if (setting && typeof setting === 'function') {
        (this.settings as any)[key] = setting.bind(this);
      }
    });
  }

  /**
   * Sets up DOM references and attaches event handlers to the form.
   */
  init(): void {
    if (this.settings.errorLabelContainer) {
      this.labelContainer = document.querySelector(
        this.settings.errorLabelContainer,
      );
    }
    this.errorContext = this.labelContainer || this.currentForm;

    const containers = [this.labelContainer];
    if (this.settings.errorContainer) {
      containers.push(document.querySelector(this.settings.errorContainer));
    }
    this.containers = containers.filter(Boolean) as HTMLElement[];

    this.rules = {};
    Object.entries(this.settings.rules).forEach(([key, value]) => {
      this.rules[key] = normalizeRule(value);
    });

    this.eventDelegator = new FormEventManager(
      this.currentForm,
      this.settings,
      (element) => this.shouldIgnore(element),
    );
    this.eventDelegator.attachEventHandlers();
  }

  /**
   * Resets the validator state.
   */
  reset(): void {
    this.successList = [];
    this.errorList = [];
    this.errorMap = {};
    this.toShow = [];
    this.toHide = [];
    this.currentElements = [];
  }

  /**
   * Validates all form elements.
   * @return true if the form is valid, false otherwise
   */
  form(): boolean {
    this.prepareForm();
    this.currentElements = this.elements();
    for (const element of this.currentElements) {
      this.check(element);
    }

    this.submitted = { ...this.submitted, ...this.errorMap };
    this.invalid = { ...this.errorMap };
    this.showErrors();
    return this.valid();
  }

  /**
   * Validates a single element within the form.
   * @param element - element to validate
   * @return true if the element is valid, false otherwise
   */
  element(element: FormControlElement): boolean {
    const target = this.validationTargetFor(element);
    if (target === undefined) {
      delete this.invalid[element.name];
      return true;
    }

    this.prepareElement(target);
    this.currentElements = [target];

    const result = this.check(target);
    if (result) {
      delete this.invalid[element.name];
    } else {
      this.invalid[target.name] = 'Invalid';
    }

    if (!this.numberOfInvalids()) {
      this.toHide.push(...this.containers);
    }
    this.showErrors();

    // add aria-invalid status for screen readers
    element.setAttribute('aria-invalid', (!result).toString());

    return result;
  }

  prepareElement(element: FormControlElement): void {
    this.reset();
    this.toHide = this.errorsFor(element);
  }

  /**
   * Returns true if there are currently no validation errors.
   * @return {boolean} - true if there are no validation errors, false otherwise
   */
  valid(): boolean {
    return this.size() === 0;
  }

  /**
   * Returns the number of validation errors.
   * @return number of validation errors
   */
  size(): number {
    return this.errorList.length;
  }

  /**
   * Returns a list of all form elements that need to be validated.
   * @return list of form elements
   */
  elements(): FormControlElement[] {
    const rulesCache: Record<string, boolean> = {};

    const selector = 'input, select, textarea';
    const notSelector =
      'input[type="submit"], [type="reset"], [type="image"], [disabled]';

    const elements = (
      Array.from(this.currentForm.querySelectorAll(selector)) as HTMLElement[]
    ).filter(
      (el) => !el.matches(notSelector) && !this.shouldIgnore(el),
    ) as FormControlElement[];

    return elements.filter((el) => {
      const form = el.form;
      if (form !== this.currentForm) {
        return false;
      }

      const name = el.name || el.getAttribute('name');
      if (
        !name ||
        name in rulesCache ||
        !objectLength(getRules(el, this.rules))
      ) {
        return false;
      }

      rulesCache[name] = true;
      return true;
    });
  }

  /**
   * Returns an array of currently valid elements from the last validation.
   * @return list of valid form elements
   */
  validElements(): FormControlElement[] {
    const invalid = this.invalidElements();
    return this.currentElements.filter((el) => !invalid.includes(el));
  }

  /**
   * Returns an array of currently invalid elements from the last validation.
   * @return list of invalid form elements
   */
  invalidElements(): FormControlElement[] {
    return this.errorList.map((e) => e.element);
  }

  /**
   * Runs all validation rules against an element and returns true if valid.
   * @param element - element to validate
   * @return true if the element is valid, false otherwise
   */
  check(element: FormControlElement): boolean {
    element = this.validationTargetFor(element);

    const rules = getRules(element, this.rules);
    const value = elementValue(element);
    const isBlank = isBlankElement(element);

    for (const method in rules) {
      const rule = { method, parameters: rules[method]! };

      const methodFunc = methodStore.get(method);
      if (!methodFunc) {
        console.warn(`Validation method "${method}" not found. Skipping.`);
        continue;
      }

      try {
        const result = methodFunc(isBlank, value, element, rule.parameters);

        if (!result) {
          this.formatAndAdd(element, rule);
          return false;
        }
      } catch (e) {
        throw e;
      }
    }

    if (objectLength(rules)) {
      this.successList.push(element);
    }
    return true;
  }

  /**
   * Returns all error label elements currently in the DOM.
   * @return array of error label elements
   */
  errors(): HTMLElement[] {
    const errorClass = this.errorClasses.join('.');
    return Array.from(
      this.errorContext.querySelectorAll(
        `${this.settings.errorElement}.${errorClass}`,
      ),
    );
  }

  showErrors(): void {
    for (const error of this.errorList) {
      if (typeof this.settings.highlight !== 'boolean') {
        this.settings.highlight(
          error.element,
          this.errorClasses,
          this.validClasses,
        );
      }
      this.showLabel(error.element, error.message);
    }

    if (this.errorList.length) {
      this.toShow = this.toShow.concat(this.containers);
    }

    if (typeof this.settings.unhighlight !== 'boolean') {
      for (const element of this.validElements()) {
        this.settings.unhighlight(
          element,
          this.errorClasses,
          this.validClasses,
        );
      }
    }

    this.toHide = this.toHide.filter((el) => !this.toShow.includes(el));
    this.hideErrors();
    this.addWrapper(...this.toShow).forEach(showElement);
  }

  formatAndAdd(
    element: FormControlElement,
    rule: { method: string; parameters: ValidationRulesetParams },
  ): void {
    const message = getMessage.call(
      this,
      element,
      rule,
      this.settings.messages,
    );

    this.errorList.push({ message, element, method: rule.method });
    this.errorMap[element.name] = message;
    this.submitted[element.name] = message;
  }

  prepareForm(): void {
    this.reset();
    this.toHide = this.errors().concat(this.containers);
  }

  highlight(
    element: FormControlElement,
    errorClasses: string[],
    validClasses: string[],
  ): void {
    let targets = [element];
    if (element.type === 'radio') {
      targets = findByName(element.form, element.name);
    }

    targets.forEach((el) => {
      el.classList.add(...errorClasses);
      el.classList.remove(...validClasses);
    });
  }

  unhighlight(
    element: FormControlElement,
    errorClasses: string[],
    validClasses: string[],
  ): void {
    let targets = [element];
    if (element.type === 'radio') {
      targets = findByName(element.form, element.name);
    }

    targets.forEach((el) => {
      el.classList.remove(...errorClasses);
      el.classList.add(...validClasses);
    });
  }

  onFocusIn(element: FormControlElement): void {
    if (this.settings.focusCleanup) {
      if (typeof this.settings.unhighlight !== 'boolean') {
        this.settings.unhighlight(
          element,
          this.errorClasses,
          this.validClasses,
        );
      }
      this.hideErrors(element);
    }
  }

  onFocusOut(element: FormControlElement): void {
    if (isCheckableElement(element)) {
      return;
    }
    if (!(element.name in this.submitted) && isBlankElement(element)) {
      return;
    }

    this.element(element);
  }

  onKeyUp(element: FormControlElement, event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.which === 9 && elementValue(element) === '') {
      return;
    }

    // Avoid revalidate the field when pressing one of the following keys
    // Shift       => 16
    // Ctrl        => 17
    // Alt         => 18
    // Caps lock   => 20
    // End         => 35
    // Home        => 36
    // Left arrow  => 37
    // Up arrow    => 38
    // Right arrow => 39
    // Down arrow  => 40
    // Insert      => 45
    // Num lock    => 144
    // AltGr key   => 225
    const excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];
    if (excludedKeys.includes(keyboardEvent.keyCode)) {
      return;
    }

    if (!(element.name in this.submitted) && !(element.name in this.invalid)) {
      return;
    }

    this.element(element);
  }

  onClick(element: FormControlElement): void {
    // Click on selects, radiobuttons and checkboxes
    if (element.name in this.submitted) {
      this.element(element);
    }
    // Or option elements, check parent select in that case
    else if (element.parentNode && element.parentElement) {
      const name = element.parentElement.getAttribute('name');

      if (name && name in this.submitted) {
        this.element(element.parentNode as FormControlElement);
      }
    }
  }

  hideErrors(element?: FormControlElement): void {
    // we're either hiding all errors, or just the errors for a specific element
    let targets = this.toHide;
    if (element) {
      targets = this.errorsFor(element);
    }

    for (const el of targets) {
      if (!this.containers.includes(el)) {
        el.innerText = '';
      }

      this.addWrapper(el).forEach(hideElement);
    }
  }

  addWrapper(...elements: HTMLElement[]): HTMLElement[] {
    const result = Array.isArray(elements) ? elements : [elements];

    if (!this.settings.wrapper) {
      return result;
    }

    const wrappers = result
      .map((el) => el.parentElement)
      .filter((el) => el && el.matches(this.settings.wrapper!));

    result.push(...(wrappers as HTMLElement[]));

    return result;
  }

  showLabel(element: FormControlElement, message?: string): void {
    let errors = this.errorsFor(element);
    const elementID = idOrName(element);
    const describedBy = element.getAttribute('aria-describedby');

    if (errors.length) {
      // Non-label error exists but is not currently associated with element via aria-describedby
      const labelSelector = `label[for='${escapeCssMeta(elementID)}']`;
      const nonLabelExists = errors
        .map((e) => e.closest(labelSelector))
        .every((e) => e === null);

      const noDescriberAssociation = () => {
        if (describedBy === null) {
          return true;
        }
        const firstErrorId = errors[0]?.getAttribute('id') ?? null;
        if (firstErrorId === null) {
          return true;
        }

        const split = describedBy.split(' ');
        return split.indexOf(firstErrorId) === -1;
      };

      if (nonLabelExists && noDescriberAssociation()) {
        const firstErrorId = errors[0]!.getAttribute('id')!;
        this.addErrorAriaDescribedBy(element, firstErrorId);
      }

      // Refresh error/success class
      errors.forEach((el) => {
        el.classList.remove(this.settings.validClass);
        el.classList.add(...this.errorClasses);
        if (this.settings.escapeHtml) {
          el.innerText = message || '';
        } else {
          el.innerHTML = message || '';
        }
      });
    } else {
      const newError = document.createElement(this.settings.errorElement);
      newError.setAttribute('id', `${elementID}-error`);
      newError.classList.add(...this.errorClasses);
      if (this.settings.escapeHtml) {
        newError.innerText = message || '';
      } else {
        newError.innerHTML = message || '';
      }

      // Maintain reference to the element(s) to be placed into the DOM
      let insert = newError;
      if (this.settings.wrapper) {
        const wrapper = document.createElement(this.settings.wrapper);
        wrapper.appendChild(newError);
        insert = wrapper;
      }

      if (this.labelContainer) {
        this.labelContainer.appendChild(insert);
      } else if (this.settings.errorPlacement) {
        this.settings.errorPlacement(insert, element);
      } else {
        element.after(insert);
      }

      const labelSelector = `label[for='${escapeCssMeta(elementID)}']`;
      const notLabelChild = errors
        .map((e) => e.parentElement)
        .every((e) => e !== null && !e.matches(labelSelector));

      if (newError.matches('label')) {
        newError.setAttribute('for', elementID);
      } else if (notLabelChild) {
        this.addErrorAriaDescribedBy(element, newError.getAttribute('id')!);
      }

      errors = [newError];
    }

    this.toShow.push(...errors);
  }

  addErrorAriaDescribedBy(element: FormControlElement, errorId: string) {
    let describedBy = element.getAttribute('aria-describedby');

    if (!describedBy) {
      describedBy = errorId;
    } else if (
      !describedBy.match(new RegExp(`\\b${escapeCssMeta(errorId)}\\b`))
    ) {
      describedBy += ` ${errorId}`;
    }

    element.setAttribute('aria-describedby', describedBy);
  }

  errorsFor(element: FormControlElement): HTMLElement[] {
    const name = escapeCssMeta(idOrName(element));
    const describer = element.getAttribute('aria-describedby');

    let selector = `label[for='${name}'], label[for='${name}'] *`;
    if (describer) {
      const escapedDescriber = escapeCssMeta(describer).replace(/\s+/g, ', #');
      selector += `, #${escapedDescriber}`;
    }

    return this.errors().filter((el) => el.matches(selector));
  }

  numberOfInvalids(): number {
    return objectLength(this.invalid);
  }

  destroy(): void {
    this.resetForm();
    validatorStore.delete(this.currentForm);
    this.eventDelegator.detachEventHandlers();
  }

  resetForm(): void {
    this.invalid = {};
    this.submitted = {};
    this.prepareForm();
    this.hideErrors();

    this.elements().forEach((el) => el.removeAttribute('aria-invalid'));
    this.resetElements();
  }

  resetElements(): void {
    if (this.settings.unhighlight) {
      for (const element of this.elements()) {
        this.unhighlight(element, this.errorClasses, []);
        findByName(element.form, element.name).forEach((el) =>
          el.classList.remove(...this.validClasses),
        );
      }
    } else {
      this.elements().forEach((el) => {
        el.classList.remove(...this.errorClasses);
        el.classList.remove(...this.validClasses);
      });
    }
  }

  validationTargetFor(element: FormControlElement): FormControlElement {
    let targets = [element];
    if (isCheckableElement(element)) {
      targets = findByName(element.form, element.name);
    }

    return targets.filter((t) => !this.shouldIgnore(t))[0]!;
  }

  /**
   * Returns true if the element should be skipped from receiving validation.
   * @param element - element to check
   * @return true if the element should be skipped, false otherwise
   */
  shouldIgnore(element: HTMLElement): boolean {
    if (!this.settings.ignore) {
      return false;
    }
    if (this.settings.ignore === ':hidden') {
      return !isVisible(element);
    }

    return element.matches(this.settings.ignore);
  }

  getMessage(
    element: FormControlElement,
    rule: string | { method: string; parameters?: ValidationRulesetParams },
  ) {
    return getMessage.call(this, element, rule, this.settings.messages);
  }

  get errorClasses(): string[] {
    return this.settings.errorClass.split(' ').filter(Boolean);
  }

  get validClasses(): string[] {
    return this.settings.validClass.split(' ').filter(Boolean);
  }
}

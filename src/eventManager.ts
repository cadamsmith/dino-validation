import {
  FormControlElement,
  ValidationError,
  ValidatorSettings,
} from './types';

/**
 * CSS selectors for different types of form elements that should receive validation events
 */
const EVENT_TARGETS = {
  FOCUS_TARGETS: [
    "[type='text']",
    "[type='password']",
    "[type='file']",
    'select',
    'textarea',
    "[type='number']",
    "[type='search']",
    "[type='tel']",
    "[type='url']",
    "[type='email']",
    "[type='datetime']",
    "[type='date']",
    "[type='month']",
    "[type='week']",
    "[type='time']",
    "[type='datetime-local']",
    "[type='range']",
    "[type='color']",
    "[type='radio']",
    "[type='checkbox']",
    'button',
    "input[type='button']",
  ],
  CLICK_TARGETS: ['select', "[type='radio']", "[type='checkbox']"],
} as const;

/**
 * Event handler function type for validation events
 */
type ValidationEventHandler =
  | boolean
  | ((element: FormControlElement, event: Event) => void);

/**
 * Manages event delegation for form validation.
 * Handles attaching and removing event listeners with proper delegation logic.
 */
export class FormEventManager {
  private boundEventHandlers: {
    onFocusIn: ((e: Event) => void) | null;
    onFocusOut: ((e: Event) => void) | null;
    onKeyUp: ((e: Event) => void) | null;
    onClick: ((e: Event) => void) | null;
    onClickSubmit: ((e: Event) => void) | null;
    onSubmit: ((e: Event) => void) | null;
  } = {
    onFocusIn: null,
    onFocusOut: null,
    onKeyUp: null,
    onClick: null,
    onClickSubmit: null,
    onSubmit: null,
  };

  private submitButton: HTMLInputElement | HTMLButtonElement | null = null;

  constructor(
    private form: HTMLFormElement,
    private settings: ValidatorSettings,
    private validateCallback: () => boolean,
    private focusInvalidCallback: () => void,
    private shouldIgnoreElement: (element: HTMLElement) => boolean,
  ) {}

  /**
   * Attaches all validation event listeners to the form
   */
  attachEventHandlers(): void {
    this.boundEventHandlers.onFocusIn = this.createDelegate(
      EVENT_TARGETS.FOCUS_TARGETS,
      this.settings.onfocusin,
    );
    this.boundEventHandlers.onFocusOut = this.createDelegate(
      EVENT_TARGETS.FOCUS_TARGETS,
      this.settings.onfocusout,
    );
    this.boundEventHandlers.onKeyUp = this.createDelegate(
      EVENT_TARGETS.FOCUS_TARGETS,
      this.settings.onkeyup,
    );
    this.boundEventHandlers.onClick = this.createDelegate(
      EVENT_TARGETS.CLICK_TARGETS,
      this.settings.onclick,
    );

    this.form.addEventListener('focusin', this.boundEventHandlers.onFocusIn);
    this.form.addEventListener('focusout', this.boundEventHandlers.onFocusOut);
    this.form.addEventListener('keyup', this.boundEventHandlers.onKeyUp);
    this.form.addEventListener('click', this.boundEventHandlers.onClick);

    if (this.settings.onsubmit) {
      this.boundEventHandlers.onClickSubmit = this.handleSubmitClick;
      this.boundEventHandlers.onSubmit = (e) =>
        this.handleSubmitForm(e as SubmitEvent);

      this.form.addEventListener('click', this.boundEventHandlers.onClick);
      this.form.addEventListener('submit', this.boundEventHandlers.onSubmit);
    }

    const invalidHandler = this.settings.invalidHandler;
    if (invalidHandler) {
      this.form.addEventListener('invalid-form', (e) => {
        if (!this.isCustomEvent(e)) {
          return;
        }
        invalidHandler(e);
      });
    }
  }

  triggerInvalidForm(errorList: ValidationError[]) {
    const event = new CustomEvent('invalid-form', {
      detail: errorList,
      cancelable: true,
    });
    this.form.dispatchEvent(event);
  }

  private isCustomEvent(event: Event): event is CustomEvent {
    return 'detail' in event;
  }

  private handleSubmitClick(e: Event) {
    const target = e.target as HTMLElement;

    // Track the used submit button to properly handle scripted
    // submits later.
    if (target.matches('button[type="submit"], input[type="submit"]')) {
      this.submitButton = e.target as HTMLInputElement | HTMLButtonElement;
    }
  }

  private handleSubmitForm(e: SubmitEvent) {
    if (this.settings.debug) {
      e.preventDefault();
    }

    const isValid = this.validateCallback();
    if (!isValid) {
      this.focusInvalidCallback();
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    let hidden: HTMLInputElement | null = null;

    // Insert a hidden input as a replacement for the missing submit button
    // if a submitHandler is passed as option
    if (this.submitButton && this.settings.submitHandler) {
      hidden = document.createElement('input');
      hidden.setAttribute('type', 'hidden');
      hidden.setAttribute('name', this.submitButton.name);
      hidden.setAttribute('value', this.submitButton.value);
      this.form.appendChild(hidden);
    }

    if (this.settings.submitHandler && !this.settings.debug) {
      const result = this.settings.submitHandler(this.form, e);
      if (hidden) {
        // And clean up afterwards
        hidden.remove();
      }

      if (!result) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }

  /**
   * Removes all validation event listeners from the form
   */
  detachEventHandlers(): void {
    if (this.boundEventHandlers.onFocusIn) {
      this.form.removeEventListener(
        'focusin',
        this.boundEventHandlers.onFocusIn,
      );
    }
    if (this.boundEventHandlers.onFocusOut) {
      this.form.removeEventListener(
        'focusout',
        this.boundEventHandlers.onFocusOut,
      );
    }
    if (this.boundEventHandlers.onKeyUp) {
      this.form.removeEventListener('keyup', this.boundEventHandlers.onKeyUp);
    }
    if (this.boundEventHandlers.onClick) {
      this.form.removeEventListener('click', this.boundEventHandlers.onClick);
    }
    if (this.boundEventHandlers.onClickSubmit) {
      this.form.removeEventListener(
        'click',
        this.boundEventHandlers.onClickSubmit,
      );
    }
    if (this.boundEventHandlers.onSubmit) {
      this.form.removeEventListener('submit', this.boundEventHandlers.onSubmit);
    }

    // Clear references
    this.boundEventHandlers.onFocusIn = null;
    this.boundEventHandlers.onFocusOut = null;
    this.boundEventHandlers.onKeyUp = null;
    this.boundEventHandlers.onClick = null;
    this.boundEventHandlers.onClickSubmit = null;
    this.boundEventHandlers.onSubmit = null;
  }

  /**
   * Creates a delegated event handler for the specified targets and handler
   */
  private createDelegate(
    targets: readonly string[],
    handler: ValidationEventHandler,
  ): (event: Event) => void {
    return (event: Event) => {
      let element = event.target as HTMLElement;
      if (element.tagName === 'OPTION') {
        element = element.closest('select') as HTMLElement;
      }

      // Skip if handler is disabled (boolean false)
      if (typeof handler === 'boolean') {
        return;
      }
      // Skip if element is null
      if (element === null) {
        return;
      }

      // Check if element matches any of the target selectors
      if (!element.matches(targets.join(', '))) {
        return;
      }

      // Ensure element belongs to the correct form
      if (!this.isElementInForm(element)) {
        return;
      }

      // Check if element should be ignored based on validator settings
      if (this.shouldIgnoreElement(element)) {
        return;
      }

      // Call the handler with the element and event
      handler(element as FormControlElement, event);
    };
  }

  /**
   * Checks if an element belongs to the validator's form
   */
  private isElementInForm(element: HTMLElement): boolean {
    const elementForm = (element as FormControlElement).form;
    return this.form === elementForm;
  }
}

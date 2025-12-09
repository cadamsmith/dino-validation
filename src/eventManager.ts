import { FormControlElement, ValidatorSettings } from './types';

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
  CLICK_TARGETS: ['select', 'option', "[type='radio']", "[type='checkbox']"],
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
  } = {
    onFocusIn: null,
    onFocusOut: null,
    onKeyUp: null,
    onClick: null,
  };

  constructor(
    private form: HTMLFormElement,
    private settings: ValidatorSettings,
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

    // Clear references
    this.boundEventHandlers.onFocusIn = null;
    this.boundEventHandlers.onFocusOut = null;
    this.boundEventHandlers.onKeyUp = null;
    this.boundEventHandlers.onClick = null;
  }

  /**
   * Creates a delegated event handler for the specified targets and handler
   */
  private createDelegate(
    targets: readonly string[],
    handler: ValidationEventHandler,
  ): (event: Event) => void {
    return (event: Event) => {
      // Skip if handler is disabled (boolean false)
      if (typeof handler === 'boolean') {
        return;
      }

      const element = event.target as HTMLElement;

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

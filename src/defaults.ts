import { FormControlElement, ValidatorSettings } from './types';
import {
  elementValue,
  findByName,
  isBlankElement,
  isCheckableElement,
} from './helpers';
import { Validator } from './validator';

export const ValidatorDefaults: ValidatorSettings = {
  ignore: ':hidden',
  errorClass: 'error',
  validClass: 'valid',
  errorElement: 'label',
  wrapper: null,
  errorLabelContainer: null,
  errorContainer: null,
  onfocusin: onFocusIn,
  onfocusout: onFocusOut,
  onkeyup: onKeyUp,
  onclick: onClick,
  highlight: highlight,
  unhighlight: unhighlight,
  errorPlacement: null,
  focusCleanup: false,
  rules: {},
  messages: {},
  escapeHtml: false,
  showErrors: null,
  ignoreTitle: false,
  success: null,
  onsubmit: true,
  debug: false,
  invalidHandler: null,
  submitHandler: null,
};

function onFocusIn(this: Validator, element: FormControlElement): void {
  this.lastActive = element;

  if (this.settings.focusCleanup) {
    if (this.settings.unhighlight) {
      this.settings.unhighlight(element, this.errorClasses, this.validClasses);
    }
    this.hideErrors(element);
  }
}

function onFocusOut(this: Validator, element: FormControlElement): void {
  if (isCheckableElement(element)) {
    return;
  }
  if (
    !(element.name in this.submitted) &&
    isBlankElement(element, this.currentForm)
  ) {
    return;
  }

  this.element(element);
}

function onKeyUp(
  this: Validator,
  element: FormControlElement,
  event: Event,
): void {
  const keyboardEvent = event as KeyboardEvent;
  if (
    keyboardEvent.which === 9 &&
    elementValue(element, this.currentForm) === ''
  ) {
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

function onClick(this: Validator, element: FormControlElement): void {
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

function highlight(
  this: Validator,
  element: FormControlElement,
  errorClasses: string[],
  validClasses: string[],
): void {
  let targets = [element];
  if (element.type === 'radio') {
    targets = findByName(this.currentForm, element.name);
  }

  targets.forEach((el) => {
    el.classList.add(...errorClasses);
    el.classList.remove(...validClasses);
  });
}

function unhighlight(
  this: Validator,
  element: FormControlElement,
  errorClasses: string[],
  validClasses: string[],
): void {
  let targets = [element];
  if (element.type === 'radio') {
    targets = findByName(this.currentForm, element.name);
  }

  targets.forEach((el) => {
    el.classList.remove(...errorClasses);
    el.classList.add(...validClasses);
  });
}

export interface ValidatorSettings {
  ignore: string;
  errorClass: string;
  validClass: string;
  errorElement: string;
  wrapper: string | null;
  errorLabelContainer: string | null;
  errorContainer: string | null;
  onfocusin: boolean | ((element: FormControlElement, event: Event) => void);
  onfocusout: boolean | ((element: FormControlElement, event: Event) => void);
  onkeyup: boolean | ((element: FormControlElement, event: Event) => void);
  highlight:
    | boolean
    | ((
        element: FormControlElement,
        errorClasses: string[],
        validClasses: string[],
      ) => void);
  unhighlight:
    | boolean
    | ((
        element: FormControlElement,
        errorClasses: string[],
        validClasses: string[],
      ) => void);
  onclick: boolean | ((element: FormControlElement, event: Event) => void);
  errorPlacement:
    | ((error: HTMLElement, element: FormControlElement) => void)
    | null;
  focusCleanup: boolean;
  rules: Record<string, ValidationRuleset | string>;
  messages: Record<string, any>;
  escapeHtml: boolean;
}

export interface ValidationError {
  element: FormControlElement;
  message: string;
  method: string;
}

export interface ValidationRuleset {
  [key: string]: any;
}

export type ValidationMethodInput = {
  blank: boolean;
  value: string | null;
  values: string[];
  length: number;
  element: FormControlElement;
  param: any;
};

export type ValidationMethod = (input: ValidationMethodInput) => boolean;

export interface FormControlElement extends HTMLElement {
  form: HTMLFormElement;
  name: string;
  value: string;
  type: string;
  selectedOptions?: HTMLCollectionOf<HTMLOptionElement>;
  validity?: ValidityState;
}

import { Validator } from './validator';

export interface ValidatorSettings {
  ignore: string;
  errorClass: string;
  validClass: string;
  errorElement: string;
  wrapper: string | null;
  errorLabelContainer: string | null;
  errorContainer: string | null;
  onfocusin: false | ((element: FormControlElement, event: Event) => void);
  onfocusout: false | ((element: FormControlElement, event: Event) => void);
  onkeyup: false | ((element: FormControlElement, event: Event) => void);
  highlight:
    | false
    | ((
        element: FormControlElement,
        errorClasses: string[],
        validClasses: string[],
      ) => void);
  unhighlight:
    | false
    | ((
        element: FormControlElement,
        errorClasses: string[],
        validClasses: string[],
      ) => void);
  onclick: false | ((element: FormControlElement, event: Event) => void);
  errorPlacement:
    | ((error: HTMLElement, element: FormControlElement) => void)
    | null;
  focusCleanup: boolean;
  rules: Record<string, ValidationRuleset | string>;
  messages: Record<string, string | Record<string, string>>;
  escapeHtml: boolean;
  showErrors:
    | ((
        this: Validator,
        errorMap: Record<string, string>,
        errorList: ValidationError[],
      ) => void)
    | null;
  ignoreTitle: boolean;
  success:
    | null
    | string
    | ((labels: HTMLElement[], element: FormControlElement) => void);
  onsubmit: boolean;
  debug: boolean;
  invalidHandler: null | ((event: CustomEvent<ValidationError[]>) => void);
  submitHandler:
    | null
    | ((form: HTMLFormElement, event: SubmitEvent) => boolean | undefined);
}

export type ValidationMessage =
  | string
  | ((params: any, element: FormControlElement) => string);

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
  value: string;
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
  files?: FileList;
}

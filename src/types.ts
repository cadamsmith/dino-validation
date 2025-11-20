export interface ValidatorSettings {
  ignore: string;
  errorClass: string;
  validClass: string;
  errorElement: string;
  wrapper: string | null;
  errorLabelContainer: string | null;
  errorContainer: string | null;
  onfocusin: Function;
  onfocusout: Function;
  onkeyup: Function;
  highlight: Function;
  unhighlight: Function;
  onclick: Function;
  errorPlacement: Function | null;
  invalidHandler: Function | null;
  success: string | Function | null;
  focusCleanup: boolean;
  rules: Record<string, ValidationRuleset | string>;
  messages: Record<string, any>;
  escapeHtml: boolean;
}

export interface ValidationError {
  element: FormControlElement;
  message: any;
  method: string;
}

export interface ValidationRuleset {
  [key: string]:
    | ValidationRulesetPrimitive
    | { param: ValidationRulesetPrimitive };
}

export type ValidationRulesetPrimitive =
  | boolean
  | string
  | number
  | [number, number];

export type ValidationMethod = (
  blank: boolean,
  value: string | string[],
  element: any,
  param: any,
) => boolean;

export interface FormControlElement extends HTMLElement {
  form: HTMLFormElement;
  name: string;
  value: string;
  type: string;
  selectedOptions?: HTMLCollectionOf<HTMLOptionElement>;
  validity?: ValidityState;
}

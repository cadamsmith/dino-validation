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
}

export interface ValidationError {
  element: any;
  message: any;
  method: string;
}

export interface ValidationRuleset {
  [key: string]: RulePrimitive | { param: RulePrimitive };
}

export type RulePrimitive = boolean | string | number | [number, number];

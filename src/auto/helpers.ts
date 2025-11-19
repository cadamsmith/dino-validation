export function escapeAttributeValue(value: string) {
  // As mentioned on http://api.jquery.com/category/selectors/
  return value.replace(/([!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g, '\\$1');
}

export function getModelPrefix(fieldName: string) {
  return fieldName.substr(0, fieldName.lastIndexOf('.') + 1);
}

export function appendModelPrefix(value: string, prefix: string) {
  if (value.indexOf('*.') === 0) {
    value = value.replace('*.', prefix);
  }
  return value;
}

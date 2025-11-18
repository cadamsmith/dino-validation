export function escapeAttributeValue(value) {
  // As mentioned on http://api.jquery.com/category/selectors/
  return value.replace(/([!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g, '\\$1');
}

export function getModelPrefix(fieldName) {
  return fieldName.substr(0, fieldName.lastIndexOf('.') + 1);
}

export function appendModelPrefix(value, prefix) {
  if (value.indexOf('*.') === 0) {
    value = value.replace('*.', prefix);
  }
  return value;
}

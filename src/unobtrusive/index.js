import adapters from './adapters.js';
import { parseDocument, parseElement } from './parsers.js';

const unobtrusive = {
  adapters,
  parseElement,
  parseDocument
};

// Auto-parse on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    unobtrusive.parseDocument();
  });
} else {
  // DOM already loaded
  unobtrusive.parseDocument();
}

export default unobtrusive;

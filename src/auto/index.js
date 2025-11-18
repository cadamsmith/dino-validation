import adapters from './adapters.js';
import { parseDocument, parseElement } from './parsers.js';

class AutoValidator {
  constructor() {
    this.adapters = adapters;

    // Auto-parse on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.parseDocument();
      });
    } else {
      // DOM already loaded
      this.parseDocument();
    }
  }

  parseDocument() {
    return parseDocument();
  }

  parseElement(element) {
    return parseElement(element);
  }
}

// Create singleton instance
const auto = new AutoValidator();

export default auto;

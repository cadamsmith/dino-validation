import adapters from './adapters.js';
import { parseDocument, parseElement } from './parsers.js';

// Re-export all base dv functionality
export {
  validate,
  valid,
  rules,
  addMethod,
  messages,
  methods,
  default as dv,
} from '../index.js';

const auto = {
  adapters,
  parseDocument,
  parseElement,
};

// Auto-parse on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    auto.parseDocument();
  });
} else {
  // DOM already loaded
  auto.parseDocument();
}

export default auto;

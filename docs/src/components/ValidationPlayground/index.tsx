import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { examples } from '@site/src/examples';
import styles from './styles.module.css';

declare global {
  interface Window {
    dv: any;
  }
}

type EditorTab = 'html' | 'javascript';

interface ValidationPlaygroundProps {
  exampleId?: string;
  initialHtml?: string;
  initialJs?: string;
}

export function ValidationPlayground({
  exampleId = 'basic',
  initialHtml,
  initialJs,
}: ValidationPlaygroundProps) {
  const example = examples[exampleId];
  const previewRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [htmlCode, setHtmlCode] = useState(initialHtml ?? example.html);
  const [jsCode, setJsCode] = useState(initialJs ?? example.js);

  useEffect(() => {
    if (!previewRef.current || !window.dv) return;

    // Update HTML
    previewRef.current.innerHTML = htmlCode;

    // Clear any previous validation
    const forms = previewRef.current.querySelectorAll('form');
    forms.forEach((form) => {
      if (window.dv && window.dv.validatorStore) {
        const validator = window.dv.validatorStore.get(form);
        if (validator) {
          validator.destroy();
        }
      }
    });

    // Initialize validation with error handling
    try {
      // First try to parse the JS to catch syntax errors
      Function('return ' + jsCode);

      // If parsing succeeds, execute it
      const executeJs = new Function('dv', jsCode);
      executeJs(window.dv);
    } catch (error) {
      console.error('Invalid JavaScript:', error);
      // Don't throw the error - let the user continue editing
    }
  }, [htmlCode, jsCode]);

  return (
    <div className={styles.playgroundContainer}>
      {example.title && (
        <div className={styles.header}>
          <h3>{example.title}</h3>
          {example.description && <p>{example.description}</p>}
        </div>
      )}
      <div className={styles.editorContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'html' ? styles.active : ''}`}
            onClick={() => setActiveTab('html')}
          >
            HTML
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'javascript' ? styles.active : ''}`}
            onClick={() => setActiveTab('javascript')}
          >
            JavaScript
          </button>
        </div>
        <div className={styles.editorPane}>
          {activeTab === 'html' ? (
            <CodeMirror
              value={htmlCode}
              onChange={setHtmlCode}
              extensions={[html()]}
              theme="dark"
              height="300px"
            />
          ) : (
            <CodeMirror
              value={jsCode}
              onChange={setJsCode}
              extensions={[javascript()]}
              theme="dark"
              height="300px"
            />
          )}
        </div>
      </div>
      <div className={styles.previewPane}>
        <h3>Live Preview</h3>
        <div ref={previewRef} className="preview" />
      </div>
    </div>
  );
}

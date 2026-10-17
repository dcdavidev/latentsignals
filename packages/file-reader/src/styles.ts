/* cspell:words hljs */

/**
 * styles.ts
 * =========
 *
 * Embedded stylesheet for web-ready formatted HTML.
 */

export const DEFAULT_WEB_THEME_CSS = `
.latentsignals-viewer {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  background-color: #0d1117;
  color: #e6edf3;
  border-radius: 8px;
  border: 1px solid #30363d;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  margin: 1rem 0;
}
.latentsignals-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
  color: #8b949e;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.latentsignals-code {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  white-space: pre;
}
.latentsignals-code code {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}
.latentsignals-line {
  display: block;
}
.latentsignals-line-number {
  display: inline-block;
  width: 3.5rem;
  padding-right: 1.25rem;
  user-select: none;
  text-align: right;
  color: #484f58;
}
.latentsignals-line-content {
  display: inline;
}
/* Highlight.js syntax tokens */
.hljs-keyword, .hljs-selector-tag, .hljs-subst { color: #ff7b72; font-weight: 600; }
.hljs-string, .hljs-title, .hljs-section, .hljs-attribute, .hljs-literal, .hljs-template-tag, .hljs-template-variable, .hljs-type, .hljs-addition { color: #a5d6ff; }
.hljs-comment, .hljs-quote, .hljs-deletion, .hljs-meta { color: #8b949e; font-style: italic; }
.hljs-number, .hljs-regexp, .hljs-link { color: #79c0ff; }
.hljs-variable, .hljs-symbol, .hljs-bullet { color: #ffa657; }
.hljs-built_in, .hljs-class .hljs-title { color: #d2a8ff; font-weight: 600; }
.hljs-function .hljs-title, .hljs-attr { color: #7ee787; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: 700; }
`.trim();

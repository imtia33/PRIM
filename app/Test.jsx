import React, { useState, useEffect, useRef } from 'react';
import CompactMarkdown from '../componants/markdown/MarkdownText.web';

const initialMarkdown = `
# Live Markdown Editor

Hello there! This is a live preview of your Markdown. As you type in the left pane, the right pane will render the formatted output.

## Features
* Live preview of Markdown
* Supports all standard Markdown syntax
* Syntax highlighting for code blocks
* Dark and light themes
* Responsive design for mobile and desktop

### Code Block Examples

Here's an example of a JavaScript code block:

\`\`\`js
const message = "Hello, world!";
console.log(message);

function greet(name) {
  // A simple function to log a greeting
  return \`Hello, \${name}!\`;
}
\`\`\`

And a Python example:

\`\`\`python
def fibonacci(n):
    a, b = 0, 1
    while a < n:
        print(a, end=' ')
        a, b = b, a + b
    print()

fibonacci(100)
\`\`\`

### Mermaid Diagram Example

Here's an example of a Mermaid diagram:

\`\`\`mermaid
graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]
\`\`\`

### Large Mermaid Diagram Example

Here's an example of a larger Mermaid diagram to test sizing constraints:

\`\`\`mermaid
graph LR
    A[Start] --> B{Decision 1}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[Subprocess A]
    C --> F[Subprocess B]
    D --> G[Subprocess C]
    D --> H[Subprocess D]
    E --> I[Result 1]
    F --> I
    G --> J[Result 2]
    H --> J
    I --> K{Decision 2}
    J --> K
    K -->|Accept| L[End - Success]
    K -->|Reject| M[End - Failure]
    L --> N[Feedback Loop]
    M --> N
    N --> A
\`\`\`

### Other Markdown Syntax

* **Bold text** and *italic text*
* [A link to Google](https://www.google.com)
* > This is a blockquote.
> It can span multiple lines.

1. First item
2. Second item
3. Third item

Here's some inline code: \`console.log("Hello World")\` and \`const x = 5;\`

Testing line breaks:
This is line 1

This is line 2

This is line 3

---
`;

export default function App() {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body { 
          font-family: "Inter", sans-serif; 
          transition: background-color 0.3s; 
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .theme-toggle {
          padding: 10px 15px;
          border-radius: 5px;
          background-color: #e5e5e5;
          color: #1f2937;
          border: none;
          cursor: pointer;
        }
        .dark .theme-toggle {
          background-color: #374151;
          color: #d1d5db;
        }
        .editor-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .editor-container {
            flex-direction: row;
          }
        }
        .editor-pane, .preview-pane {
          flex: 1;
          min-height: 500px;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .editor-pane {
          background-color: #fff;
          border: 1px solid #d1d5db;
        }
        .dark .editor-pane {
          background-color: #1f2937;
          border-color: #4b5563;
        }
        .preview-pane {
          background-color: #fff;
          overflow-y: auto;
        }
        .dark .preview-pane {
          background-color: #1f2937;
        }
        textarea {
          width: 100%;
          height: 100%;
          border: none;
          resize: none;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
        }
        .editor-pane textarea {
          background-color: #fff;
          color: #1f2937;
        }
        .dark .editor-pane textarea {
          background-color: #1f2937;
          color: #d1d5db;
        }
        .dark {
          background-color: #111827;
          color: #d1d5db;
        }
      `}} />
      <div className={theme === 'dark' ? 'dark' : ''}>
        <div className="container">
          <div className="header">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Markdown Editor</h1>
            <button 
              onClick={toggleTheme}
              className="theme-toggle"
            >
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>

          <div className="editor-container">
            <div className="editor-pane">
              <textarea
                placeholder="Start typing your Markdown here..."
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
              />
            </div>
            <div className="preview-pane">
              <CompactMarkdown 
                markdown={markdown} 
                renderMermaid={true}
                theme={{ mode: theme }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

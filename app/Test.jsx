import React from 'react';
import MarkdownText from '../componants/markdown/MarkdownText.web';

// Example markdown content with various elements including Mermaid diagrams
const exampleMarkdown = `
# Markdown with Mermaid Diagrams

This component demonstrates rendering markdown with Mermaid diagrams using CDN libraries.

## Code Block Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

## Flowchart Diagram

\`\`\`mermaid
flowchart TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Ship it 🚀]
  B -->|No| D[Fix it 🔧]
  D --> B
\`\`\`

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
  participant User
  participant App
  participant Server

  User->>App: Open app
  App->>Server: Request data
  Server-->>App: Send response
  App-->>User: Display results
\`\`\`

## Class Diagram

\`\`\`mermaid
classDiagram
  class Animal {
    +String name
    +eat()
    +sleep()
  }

  class Dog {
    +bark()
  }

  Animal <|-- Dog
\`\`\`

## State Diagram

\`\`\`mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Loading : Start
  Loading --> Success : Done
  Loading --> Error : Fail
  Success --> [*]
  Error --> Idle
\`\`\`

## Pie Chart

\`\`\`mermaid
pie showData
  title Project Contributions
  "Frontend" : 40
  "Backend" : 35
  "DevOps" : 25
\`\`\`

---

Try editing this markdown to see how the component renders different elements!
`;

const MarkdownTextExample = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>MarkdownText Component Example</h1>
      <p>This example shows how to use the MarkdownText component with various markdown elements including Mermaid diagrams.</p>
      
      <div className='max-h-full' style={{ marginTop: '20px', overflowY: 'auto' ,maxHeight:'1000px'}}>
        <MarkdownText markdown={exampleMarkdown} />
      </div>
        
    </div>
  );
};

export default MarkdownTextExample;
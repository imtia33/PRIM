import React, { useState } from 'react';
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

const ReadmeGenerator = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoStructure, setRepoStructure] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [generatedReadme, setGeneratedReadme] = useState('');
  const [step, setStep] = useState(1); // 1: input, 2: structure, 3: file selection, 4: generated

  // Function to fetch repository structure from GitHub
  const fetchRepoStructure = async () => {
    setLoading(true);
    try {
      // Extract owner and repo from URL
      const url = new URL(repoUrl);
      const pathParts = url.pathname.split('/').filter(part => part);
      const owner = pathParts[0];
      const repo = pathParts[1];
      
      // Fetch repository structure using GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'README-Generator'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      setRepoStructure(data);
      setStep(2);
    } catch (error) {
      console.error('Error fetching repository structure:', error);
      alert('Error fetching repository structure. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch file content from GitHub
  const fetchFileContent = async (filePath) => {
    try {
      const url = new URL(repoUrl);
      const pathParts = url.pathname.split('/').filter(part => part);
      const owner = pathParts[0];
      const repo = pathParts[1];
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'README-Generator'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      return atob(data.content); // Decode base64 content
    } catch (error) {
      console.error('Error fetching file content:', error);
      return '';
    }
  };

  // Function to handle file selection
  const handleFileSelect = (file) => {
    setSelectedFiles(prev => {
      if (prev.some(f => f.path === file.path)) {
        return prev.filter(f => f.path !== file.path);
      } else {
        return [...prev, file];
      }
    });
  };

  // Function to generate README content
  const generateReadme = async () => {
    setLoading(true);
    try {
      // Fetch content of selected files
      const fileContents = await Promise.all(
        selectedFiles.map(async (file) => {
          const content = await fetchFileContent(file.path);
          return { path: file.path, content };
        })
      );
      
      // Create a prompt for AI to generate README
      const prompt = `
      Based on the following repository structure and file contents, generate a comprehensive README.md file.
      
      Repository Structure:
      ${JSON.stringify(repoStructure, null, 2)}
      
      Selected Files and Contents:
      ${fileContents.map(file => `
      File: ${file.path}
      Content:
      ${file.content}
      `).join('\n')}
      
      Please create a well-structured README.md that includes:
      1. Project title and description
      2. Installation instructions
      3. Usage examples
      4. Key features
      5. Technology stack
      6. Contributing guidelines
      7. License information
      `;
      
      // For now, we'll generate a basic README. In a real implementation, this would call an AI service
      const basicReadme = `# ${repoUrl.split('/').filter(part => part)[1]}

## Description
This project was analyzed from the repository structure.

## Installation
\`\`\`bash
# Clone the repository
git clone ${repoUrl}

# Install dependencies
npm install
\`\`\`

## Usage
Instructions for using this project would go here.

## Key Features
- Feature 1
- Feature 2
- Feature 3

## Technology Stack
- Technology 1
- Technology 2
- Technology 3

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.
`;
      
      setGeneratedReadme(basicReadme);
      setStep(4);
    } catch (error) {
      console.error('Error generating README:', error);
      alert('Error generating README. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>README Generator</h1>
      <p>Enter a GitHub repository URL to generate a README.md file based on the codebase.</p>
      
      {step === 1 && (
        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            style={{ width: '70%', padding: '10px', marginRight: '10px' }}
          />
          <button 
            onClick={fetchRepoStructure} 
            disabled={loading || !repoUrl}
            style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            {loading ? 'Analyzing...' : 'Analyze Repository'}
          </button>
        </div>
      )}
      
      {step === 2 && repoStructure && (
        <div style={{ marginTop: '20px' }}>
          <h2>Repository Structure</h2>
          <p>Select the files you want to analyze for README generation:</p>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
            {repoStructure.map((item, index) => (
              <div key={index} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                <input
                  type="checkbox"
                  checked={selectedFiles.some(f => f.path === item.path)}
                  onChange={() => handleFileSelect(item)}
                  id={`file-${index}`}
                />
                <label htmlFor={`file-${index}`} style={{ marginLeft: '10px' }}>
                  {item.type === 'dir' ? '📁' : '📄'} {item.name}
                </label>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setStep(3)} 
            disabled={selectedFiles.length === 0}
            style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Continue with Selected Files ({selectedFiles.length})
          </button>
          <button 
            onClick={() => setStep(1)} 
            style={{ marginTop: '15px', marginLeft: '10px', padding: '10px 20px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '5px' }}
          >
            Back
          </button>
        </div>
      )}
      
      {step === 3 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Selected Files for Analysis</h2>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <button 
            onClick={generateReadme} 
            disabled={loading}
            style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            {loading ? 'Generating README...' : 'Generate README'}
          </button>
          <button 
            onClick={() => setStep(2)} 
            style={{ marginTop: '15px', marginLeft: '10px', padding: '10px 20px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '5px' }}
          >
            Back
          </button>
        </div>
      )}
      
      {step === 4 && generatedReadme && (
        <div style={{ marginTop: '20px' }}>
          <h2>Generated README</h2>
          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generatedReadme);
                alert('README copied to clipboard!');
              }}
              style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}
            >
              Copy to Clipboard
            </button>
            <button 
              onClick={() => setStep(1)}
              style={{ padding: '10px 20px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '5px' }}
            >
              Start Over
            </button>
          </div>
          <div className='max-h-full' style={{ marginTop: '20px', overflowY: 'auto', maxHeight: '1000px', border: '1px solid #ddd', padding: '15px' }}>
            <MarkdownText markdown={generatedReadme} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadmeGenerator;
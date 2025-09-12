import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ColorMode';

const MarkdownText = ({ markdown = "", renderMermaid = true }) => {
  const previewRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const renderMarkdown = async () => {
      if (!previewRef.current) return;

      // Load required libraries from CDN if not already loaded
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      try {
        // Load required libraries
        const libraries = [
          loadScript('https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js')
        ];
        
        // Only load mermaid if we're supposed to render it
        if (renderMermaid) {
          libraries.push(loadScript('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'));
        }
        
        libraries.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/js/all.min.js'));

        await Promise.all(libraries);

        // Initialize libraries
        const marked = window.marked;
        const hljs = window.hljs;
        const mermaid = renderMermaid ? window.mermaid : null;

        if (!marked || !hljs) {
          throw new Error('Failed to load required libraries');
        }

        if (renderMermaid && mermaid) {
          mermaid.initialize({
            theme: theme.mode === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose'
          });
        }

        // Animation duration for viewBox transitions
        const animationDuration = 200;
        
        // Function to animate SVG viewBox changes
        const animateViewBox = (svg, start, end) => {
          const startTime = performance.now();
          
          const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            const newX = start[0] + (end[0] - start[0]) * progress;
            const newY = start[1] + (end[1] - start[1]) * progress;
            const newWidth = start[2] + (end[2] - start[2]) * progress;
            const newHeight = start[3] + (end[3] - start[3]) * progress;
            
            svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
            
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };
          
          requestAnimationFrame(step);
        };

        // Setup controls for Mermaid diagrams
        const setupControls = (mermaidSVG) => {
          const controlsDiv = document.createElement('div');
          controlsDiv.className = 'controls-wrapper';
          controlsDiv.innerHTML = `
            <div class="control-grid">
              <button class="up control-button" aria-label="Pan Up"><i class="fas fa-chevron-up"></i></button>
              <button class="left control-button" aria-label="Pan Left"><i class="fas fa-chevron-left"></i></button>
              <button class="reset control-button" aria-label="Reset View"><i class="fas fa-sync-alt"></i></button>
              <button class="right control-button" aria-label="Pan Right"><i class="fas fa-chevron-right"></i></button>
              <button class="down control-button" aria-label="Pan Down"><i class="fas fa-chevron-down"></i></button>
              <button class="zoom-in control-button" aria-label="Zoom In"><i class="fas fa-plus"></i></button>
              <button class="zoom-out control-button" aria-label="Zoom Out"><i class="fas fa-minus"></i></button>
            </div>
          `;

          const initialViewBox = mermaidSVG.getAttribute('viewBox');

          controlsDiv.querySelector('.up').addEventListener('click', () => {
            const [x, y, width, height] = mermaidSVG.getAttribute('viewBox').split(' ').map(Number);
            animateViewBox(mermaidSVG, [x, y, width, height], [x, y - 20, width, height]);
          });
          controlsDiv.querySelector('.down').addEventListener('click', () => {
            const [x, y, width, height] = mermaidSVG.getAttribute('viewBox').split(' ').map(Number);
            animateViewBox(mermaidSVG, [x, y, width, height], [x, y + 20, width, height]);
          });
          controlsDiv.querySelector('.left').addEventListener('click', () => {
            const [x, y, width, height] = mermaidSVG.getAttribute('viewBox').split(' ').map(Number);
            animateViewBox(mermaidSVG, [x, y, width, height], [x - 20, y, width, height]);
          });
          controlsDiv.querySelector('.right').addEventListener('click', () => {
            const [x, y, width, height] = mermaidSVG.getAttribute('viewBox').split(' ').map(Number);
            animateViewBox(mermaidSVG, [x, y, width, height], [x + 20, y, width, height]);
          });
          controlsDiv.querySelector('.zoom-in').addEventListener('click', () => {
            const [x, y, width, height] = mermaidSVG.getAttribute('viewBox').split(' ').map(Number);
            const newWidth = width * 0.9;
            const newHeight = height * 0.9;
            animateViewBox(mermaidSVG, [x, y, width, height], [x + (width - newWidth) / 2, y + (height - newHeight) / 2, newWidth, newHeight]);
          });
          controlsDiv.querySelector('.zoom-out').addEventListener('click', () => {
            const [x, y, width, height] = mermaidSVG.getAttribute('viewBox').split(' ').map(Number);
            const newWidth = width * 1.1;
            const newHeight = height * 1.1;
            animateViewBox(mermaidSVG, [x, y, width, height], [x + (width - newWidth) / 2, y + (height - newHeight) / 2, newWidth, newHeight]);
          });
          controlsDiv.querySelector('.reset').addEventListener('click', () => {
            const [x, y, width, height] = mermaidSVG.getAttribute('viewBox').split(' ').map(Number);
            const initialParts = initialViewBox.split(' ').map(Number);
            animateViewBox(mermaidSVG, [x, y, width, height], initialParts);
          });

          return controlsDiv;
        };

        // Create custom renderer for marked
        const renderer = new marked.Renderer();
        
        renderer.code = (code, language) => {
          if (language && language.toLowerCase() === 'mermaid' && renderMermaid && mermaid) {
            return `<div class="mermaid-placeholder" data-mermaid-code="${encodeURIComponent(code)}"></div>`;
          }
          
          // Check if this is a diff code block
          const isDiff = language && language.toLowerCase() === 'diff';
          
          let highlightedCode;
          if (language && hljs.getLanguage(language)) {
            highlightedCode = hljs.highlight(code, { language }).value;
          } else {
            highlightedCode = hljs.highlightAuto(code).value;
            language = 'auto';
          }
          
          // Add diff highlighting if this is a diff block
          if (isDiff) {
            const lines = highlightedCode.split('\n');
            highlightedCode = lines.map(line => {
              // Check for addition lines (+)
              if (line.trim().startsWith('+') && !line.trim().startsWith('++')) {
                return `<span class="diff-add-line">${line}</span>`;
              }
              // Check for deletion lines (-)
              else if (line.trim().startsWith('-') && !line.trim().startsWith('--')) {
                return `<span class="diff-remove-line">${line}</span>`;
              }
              return line;
            }).join('\n');
          }
          
          return `<div class="code-container"><pre><code class="language-${language}">${highlightedCode}</code></pre><button class="copy-button">Copy</button></div>`;
        };

        marked.use({ renderer, async: false });

        // Process markdown
        let tempHtml = markdown;
        if (renderMermaid && mermaid) {
          const mermaidRegex = /```mermaid\n([\s\S]+?)\n```/g;
          tempHtml = markdown.replace(mermaidRegex, (match, code) => {
            return `<div class="mermaid-placeholder" data-mermaid-code="${encodeURIComponent(code)}"></div>`;
          });
        }

        const parsedHtml = marked.parse(tempHtml);
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = parsedHtml;

        // Process Mermaid diagrams only if we're supposed to render them
        if (renderMermaid && mermaid) {
          const placeholders = tempContainer.querySelectorAll('.mermaid-placeholder');
          const mermaidPromises = [];

          placeholders.forEach((placeholder, index) => {
            const code = decodeURIComponent(placeholder.getAttribute('data-mermaid-code'));
            const id = 'mermaid-diagram-' + index + '-' + Date.now();
            
            const renderPromise = mermaid.render(id, code)
              .then(({ svg }) => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = svg;
                const mermaidSVG = tempDiv.querySelector('svg');
                
                if (mermaidSVG) {
                  const wrapper = document.createElement('div');
                  wrapper.className = 'mermaid-container';
                  
                  // Create a div for the diagram content
                  const contentDiv = document.createElement('div');
                  contentDiv.className = 'mermaid-diagram-content';
                  contentDiv.appendChild(mermaidSVG);
                  
                  wrapper.appendChild(contentDiv);
                  wrapper.appendChild(setupControls(mermaidSVG));
                  placeholder.replaceWith(wrapper);
                }
              })
              .catch(err => {
                placeholder.outerHTML = `<div class="text-red-400 p-2">Error rendering diagram: <br>${err.message}</div>`;
              });
            mermaidPromises.push(renderPromise);
          });

          await Promise.all(mermaidPromises);
        }

        // Update preview
        previewRef.current.innerHTML = '';
        while (tempContainer.firstChild) {
          previewRef.current.appendChild(tempContainer.firstChild);
        }

        // Add copy functionality
        previewRef.current.querySelectorAll('.copy-button').forEach(button => {
          button.addEventListener('click', () => {
            const code = button.previousElementSibling.querySelector('code')?.textContent || '';
            navigator.clipboard.writeText(code).then(() => {
              button.textContent = 'Copied!';
              setTimeout(() => { button.textContent = 'Copy'; }, 2000);
            });
          });
        });

        // Apply syntax highlighting
        hljs.highlightAll();
      } catch (error) {
        if (previewRef.current) {
          previewRef.current.innerHTML = `<div class="text-red-400 p-2">Error rendering markdown: <br>${error.message}</div>`;
        }
      }
    };

    renderMarkdown();
  }, [markdown, theme, renderMermaid]);

  return (
    <div>
      <style>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
          background-color: ${theme.background};
          color: ${theme.text};
        }
        .header-bg {
          background-color: ${theme.mode === 'dark' ? '#21262d' : '#f6f8fa'};
          border-bottom: 1px solid ${theme.borderColor};
        }
        .border-github {
          border-color: ${theme.borderColor};
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background-color: ${theme.mode === 'dark' ? '#161b22' : '#f0f0f0'};
        }
        ::-webkit-scrollbar-thumb {
          background-color: ${theme.mode === 'dark' ? '#4b5563' : '#c1c1c1'};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: ${theme.mode === 'dark' ? '#6b7280' : '#a1a1a1'};
        }

        /* Styling for the copy button */
        .code-container {
          position: relative;
          background-color: ${theme.cardBackground};
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow: hidden;
        }
        .copy-button {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.25rem 0.5rem;
          background-color: ${theme.mode === 'dark' ? 'rgba(55, 65, 81, 0.7)' : 'rgba(200, 200, 200, 0.7)'};
          color: ${theme.text};
          border-radius: 0.25rem;
          font-size: 0.75rem;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
          border: none;
        }
        .code-container:hover .copy-button {
          opacity: 1;
        }
        
        /* Highlight for inline code */
        :not(pre) > code {
          background-color: ${theme.mode === 'dark' ? 'rgba(110, 118, 129, 0.4)' : 'rgba(175, 184, 193, 0.2)'};
          color: ${theme.text};
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
        }
        
        /* Ensure code blocks have a margin for better separation */
        pre {
          margin: 0 !important;
          background-color: transparent !important;
          padding: 0 !important;
          overflow: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        /* GitHub theme styles based on current theme */
        .hljs {
          background: ${theme.cardBackground};
          color: ${theme.text};
        }
        
        ${theme.mode === 'dark' ? `
        .hljs-comment,
        .hljs-quote {
          color: #8b949e;
        }
        
        .hljs-deletion,
        .hljs-name,
        .hljs-regexp,
        .hljs-selector-class,
        .hljs-selector-id,
        .hljs-tag,
        .hljs-template-variable,
        .hljs-variable {
          color: #ffa198;
        }
        
        .hljs-built_in,
        .hljs-link,
        .hljs-literal,
        .hljs-meta,
        .hljs-number,
        .hljs-params,
        .hljs-type {
          color: #79c0ff;
        }
        
        .hljs-attribute {
          color: #79c0ff;
        }
        
        .hljs-addition,
        .hljs-bullet,
        .hljs-string,
        .hljs-symbol {
          color: #a5d6ff;
        }
        
        .hljs-section,
        .hljs-title {
          color: #d2a8ff;
        }
        
        .hljs-keyword,
        .hljs-selector-tag {
          color: #ff7b72;
        }
        ` : `
        .hljs-comment,
        .hljs-quote {
          color: #6e7781;
        }
        
        .hljs-deletion,
        .hljs-name,
        .hljs-regexp,
        .hljs-selector-class,
        .hljs-selector-id,
        .hljs-tag,
        .hljs-template-variable,
        .hljs-variable {
          color: #d73a49;
        }
        
        .hljs-built_in,
        .hljs-link,
        .hljs-literal,
        .hljs-meta,
        .hljs-number,
        .hljs-params,
        .hljs-type {
          color: #0550ae;
        }
        
        .hljs-attribute {
          color: #0550ae;
        }
        
        .hljs-addition,
        .hljs-bullet,
        .hljs-string,
        .hljs-symbol {
          color: #0a3069;
        }
        
        .hljs-section,
        .hljs-title {
          color: #9e60ce;
        }
        
        .hljs-keyword,
        .hljs-selector-tag {
          color: #cf222e;
        }
        `}
        
        .hljs-emphasis {
          font-style: italic;
        }
        
        .hljs-strong {
          font-weight: bold;
        }
        
        ${theme.mode === 'dark' ? `
        .hljs-addition {
          color: #a5d6ff;
          background-color: rgba(46, 160, 67, 0.15);
        }
        
        .hljs-deletion {
          color: #ffa198;
          background-color: rgba(248, 81, 73, 0.15);
        }
        ` : `
        .hljs-addition {
          color: #0a3069;
          background-color: rgba(99, 205, 116, 0.15);
        }
        
        .hljs-deletion {
          color: #d73a49;
          background-color: rgba(255, 129, 130, 0.15);
        }
        `}
        
        /* Diff-specific styles */
        .diff-add-line {
          background-color: ${theme.mode === 'dark' ? 'rgba(46, 160, 67, 0.72) !important' : 'rgba(99, 205, 116, 0.72) !important'};
          display: block;
          margin: 0 -1rem;
          padding: 0 1rem;
        }
        
        .diff-remove-line {
          background-color: ${theme.mode === 'dark' ? 'rgb(208, 47, 47) !important' : 'rgb(255, 129, 130) !important'};
          display: block;
          margin: 0 -1rem;
          padding: 0 1rem;
        }
        
        .hljs-attr { color: ${theme.mode === 'dark' ? '#79c0ff' : '#0550ae'}; }
        .hljs-string { color: ${theme.mode === 'dark' ? '#a5d6ff' : '#0a3069'}; }
        .mermaid-container { 
          overflow: auto; 
          position: relative;
          background-color: ${theme.cardBackground};
          border-radius: 0.5rem;
          margin: 1rem 0;
          min-height: 200px;
        }
        
        .mermaid-diagram-content {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          width: 100%;
        }
        
        .controls-wrapper {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          z-index: 0;
          background-color: ${theme.mode === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
          border-radius: 0.5rem;
          padding: 0.25rem;
        }
        
        /* Control styles */
        .control-button {
          padding: 0.5rem;
          border-radius: 0.375rem;
          background-color: ${theme.mode === 'dark' ? '#374151' : '#e5e5e5'};
          color: ${theme.text};
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 0.75rem;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .control-button:hover {
          background-color: ${theme.mode === 'dark' ? '#4b5563' : '#d4d4d4'};
        }
        
        .control-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 0.25rem;
          width: fit-content;
        }
        
        .control-grid .left { grid-column: 1; grid-row: 2; }
        .control-grid .up { grid-column: 2; grid-row: 1; }
        .control-grid .right { grid-column: 3; grid-row: 2; }
        .control-grid .down { grid-column: 2; grid-row: 3; }
        .control-grid .reset { grid-column: 2; grid-row: 2; }
        .control-grid .zoom-in { grid-column: 3; grid-row: 1; }
        .control-grid .zoom-out { grid-column: 3; grid-row: 3; }
        
        /* Responsive controls for mobile */
        @media (max-width: 768px) {
          .control-button {
            padding: 0.25rem;
            font-size: 0.6rem;
            width: 1.5rem;
            height: 1.5rem;
          }
          
          .control-grid {
            gap: 0.1rem;
          }
          
          .controls-wrapper {
            bottom: 0.25rem;
            right: 0.25rem;
            padding: 0.1rem;
          }
        }

        .text-red-400 { color: #f87171; }
        .p-2 { padding: 0.5rem; }
        
        /* Ensure proper styling for markdown elements */
        .prose {
          width: 100%;
          max-width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .prose h1, .prose h2, .prose h3, 
        .prose h4, .prose h5, .prose h6 {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          color: ${theme.text};
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .prose p {
          margin-bottom: 0.5rem;
          line-height: 1.4;
          color: ${theme.text};
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .prose ul, .prose ol {
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
        }
        
        .prose li {
          margin-bottom: 0.25rem;
          color: ${theme.text};
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.4;
        }
        
        .prose a {
          color: ${theme.mode === 'dark' ? '#58a6ff' : '#0969da'};
          text-decoration: none;
          line-height: 1.4;
        }
        
        .prose a:hover {
          text-decoration: underline;
        }
        
        .prose blockquote {
          border-left: 4px solid ${theme.borderColor};
          padding-left: 1rem;
          margin: 1rem 0;
          color: ${theme.secondaryText};
        }
        
        .prose hr {
          border: 0;
          border-top: 1px solid ${theme.borderColor};
          margin: 1.5rem 0;
        }
        
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          display: block;
          overflow-x: auto;
          white-space: nowrap;
        }
        
        .prose th, .prose td {
          padding: 0.5rem;
          border: 1px solid ${theme.borderColor};
        }
        
        .prose th {
          background-color: ${theme.headerBackground};
          font-weight: 600;
          color: ${theme.text};
        }
        
        .prose td {
          color: ${theme.text};
        }
        
        /* Ensure proper text wrapping */
        .prose * {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
        }
        
        /* Fix for code blocks */
        .prose pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        /* Fix for table overflow */
        .prose table {
          display: block;
          overflow-x: auto;
          white-space: nowrap;
        }
      `}</style>
      <div 
        ref={previewRef} 
        className="prose prose-invert max-w-none"
        style={{ 
          width: '100%', 
          maxWidth: '100%', 
          wordWrap: 'break-word', 
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      />
    </div>
  );
};

export default MarkdownText;
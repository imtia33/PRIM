"use client"

import React, { useEffect, useRef, useCallback, useState, memo } from "react"
import { useTheme } from '../../context/ColorMode'

// Global cache for loaded libraries to prevent redundant loading
const libraryCache = {
  marked: null,
  hljs: null,
  mermaid: null,
  fontAwesome: null
};

// Cache for loaded scripts to prevent redundant loading
const loadedScripts = new Set()

// Function to load scripts with caching
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (loadedScripts.has(src)) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = src
    script.onload = () => {
      loadedScripts.add(src)
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const CompactMarkdown = ({ markdown = "", renderMermaid = true, className, messageId, isStreaming = false }) => {
  const previewRef = useRef(null)
  const { theme } = useTheme()
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Check for dark mode
  useEffect(() => {
    setIsDarkMode(theme.mode === 'dark')
  }, [theme])

  // Animation duration for viewBox transitions
  const animationDuration = 200

  // Store rendered content to prevent unnecessary re-renders
  const renderedContentRef = useRef(null)
  const lastMarkdownRef = useRef(null)
  const isRenderingRef = useRef(false)
  const lastIsStreamingRef = useRef(isStreaming)
  // Store the last processed markdown for streaming updates
  const lastProcessedMarkdownRef = useRef("")

  // Function to get a hash of the markdown content for comparison
  const getMarkdownHash = (content) => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  // Function to animate SVG viewBox changes
  const animateViewBox = (svg, start, end) => {
    const startTime = performance.now()

    const step = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      const newX = start[0] + (end[0] - start[0]) * progress
      const newY = start[1] + (end[1] - start[1]) * progress
      const newWidth = start[2] + (end[2] - start[2]) * progress
      const newHeight = start[3] + (end[3] - start[3]) * progress

      svg.setAttribute("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`)

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }

  // Setup controls for Mermaid diagrams
  const setupControls = (mermaidSVG) => {
    const controlsDiv = document.createElement("div")
    controlsDiv.className = "controls-wrapper"
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
    `

    const initialViewBox = mermaidSVG.getAttribute("viewBox")

    controlsDiv.querySelector(".up").addEventListener("click", () => {
      const [x, y, width, height] = mermaidSVG.getAttribute("viewBox").split(" ").map(Number)
      animateViewBox(mermaidSVG, [x, y, width, height], [x, y - 20, width, height])
    })
    controlsDiv.querySelector(".down").addEventListener("click", () => {
      const [x, y, width, height] = mermaidSVG.getAttribute("viewBox").split(" ").map(Number)
      animateViewBox(mermaidSVG, [x, y, width, height], [x, y + 20, width, height])
    })
    controlsDiv.querySelector(".left").addEventListener("click", () => {
      const [x, y, width, height] = mermaidSVG.getAttribute("viewBox").split(" ").map(Number)
      animateViewBox(mermaidSVG, [x, y, width, height], [x - 20, y, width, height])
    })
    controlsDiv.querySelector(".right").addEventListener("click", () => {
      const [x, y, width, height] = mermaidSVG.getAttribute("viewBox").split(" ").map(Number)
      animateViewBox(mermaidSVG, [x, y, width, height], [x + 20, y, width, height])
    })
    controlsDiv.querySelector(".zoom-in").addEventListener("click", () => {
      const [x, y, width, height] = mermaidSVG.getAttribute("viewBox").split(" ").map(Number)
      const newWidth = width * 0.9
      const newHeight = height * 0.9
      // Keep the container size fixed, only change the viewBox for zooming
      animateViewBox(mermaidSVG, [x, y, width, height], [x + (width - newWidth) / 2, y + (height - newHeight) / 2, newWidth, newHeight])
    })
    controlsDiv.querySelector(".zoom-out").addEventListener("click", () => {
      const [x, y, width, height] = mermaidSVG.getAttribute("viewBox").split(" ").map(Number)
      const newWidth = width * 1.1
      const newHeight = height * 1.1
      // Keep the container size fixed, only change the viewBox for zooming
      animateViewBox(mermaidSVG, [x, y, width, height], [x + (width - newWidth) / 2, y + (height - newHeight) / 2, newWidth, newHeight])
    })
    controlsDiv.querySelector(".reset").addEventListener("click", () => {
      const [x, y, width, height] = mermaidSVG.getAttribute("viewBox").split(" ").map(Number)
      const initialParts = initialViewBox.split(" ").map(Number)
      animateViewBox(mermaidSVG, [x, y, width, height], initialParts)
    })

    return controlsDiv
  }

  // Process code blocks with syntax highlighting
  const processCodeBlocks = useCallback((container) => {
    const codeBlocks = container.querySelectorAll("pre code")

    codeBlocks.forEach((codeBlock) => {
      // Use the globally cached hljs library
      if (libraryCache.hljs) {
        libraryCache.hljs.highlightElement(codeBlock)
      }

      const preElement = codeBlock.parentElement
      if (preElement && !preElement.querySelector(".code-header")) {
        const classNames = codeBlock.className.split(" ")
        const languageClass = classNames.find((cls) => cls.startsWith("language-") || cls.startsWith("hljs-"))
        let language = "plaintext"

        if (languageClass) {
          if (languageClass.startsWith("language-")) {
            language = languageClass.replace("language-", "")
          } else if (languageClass.startsWith("hljs-")) {
            language = languageClass.replace("hljs-", "")
          }
        }

        const header = document.createElement("div")
        header.className = "code-header"

        header.innerHTML = `
          <span class="text-xs font-medium">${language.toUpperCase()}</span>
          <button class="copy-btn text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors">Copy</button>`
        preElement.prepend(header)

        const copyButton = header.querySelector(".copy-btn")
        copyButton?.addEventListener("click", () => {
          const code = codeBlock.textContent || ""
          navigator.clipboard.writeText(code).then(() => {
            const originalText = copyButton.textContent
            copyButton.textContent = "Copied!"
            setTimeout(() => {
              copyButton.textContent = originalText
            }, 2000)
          })
        })
      }
    })
  }, [])

  // Render a single Mermaid diagram
  const renderMermaidDiagram = async (placeholder, index) => {
    // Use the globally cached mermaid library
    const mermaid = libraryCache.mermaid;
    if (!mermaid) return;

    let code = decodeURIComponent(placeholder.getAttribute('data-mermaid-code') || "")
    const id = `mermaid-diagram-${index}-${Date.now()}`

    // Minimal preprocessing - only escape quotes in node labels
    const preprocessMermaidCode = (mermaidCode) => {
      // Fix common syntax issues in Mermaid diagrams
      let processedCode = mermaidCode;
      
      // Handle different line endings
      processedCode = processedCode.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      
      // Escape parentheses in node labels that might cause parsing issues
      // Handle cases like: B{Load Content Template: e.g., email-magic-url.tpl (now a partial)}
      processedCode = processedCode.replace(/(\{[^}]*?)\(([^)]*?)\)([^}]*?\})/g, (match, before, content, after) => {
        // Only escape if the parentheses are within quotes or might cause issues
        return before + '\\(' + content + '\\)' + after;
      });
      
      // Also escape parentheses in regular node text
      processedCode = processedCode.replace(/([^\\])\(([^)]*?)\)/g, (match, before, content) => {
        // Only escape if not already escaped
        return before + '\\(' + content + '\\)';
      });
      
      // Only escape quotes in node labels - this is the most common issue
      // Handle cases like: B{User Clicks "Login"} -> B{User Clicks \"Login\"}
      processedCode = processedCode.replace(/(\{[^}]*?)"(.*?[^\\])"([^}]*?\})/g, (match, before, content, after) => {
        // Escape quotes in the content
        const escapedContent = content.replace(/\\"/g, '"').replace(/"/g, '\\"');
        return before + '\"' + escapedContent + '\"' + after;
      });
      
      // Also handle quotes in regular node text
      processedCode = processedCode.replace(/([^\\])"(.*?[^\\])"/g, (match, before, content) => {
        // Escape quotes in the content
        const escapedContent = content.replace(/\\"/g, '"').replace(/"/g, '\\"');
        return before + '\"' + escapedContent + '\"';
      });
      
      return processedCode;
    };

    // Preprocess the code before rendering
    const processedCode = preprocessMermaidCode(code);

    try {
      // Initialize mermaid with proper configuration before rendering
      mermaid.initialize({
        theme: isDarkMode ? "dark" : "default",
        securityLevel: "loose",
        startOnLoad: false, // Don't auto-render
        flowchart: {
          useMaxWidth: true,
          htmlLabels: false, // Use SVG labels for better compatibility
        },
        sequence: {
          useMaxWidth: true,
          wrap: true,
          mirrorActors: true,
        },
        gantt: {
          useMaxWidth: true,
        },
        state: {
          useMaxWidth: true,
          defaultRenderer: 'dagre',
        },
        pie: {
          useMaxWidth: true,
        },
        requirement: {
          useMaxWidth: true,
        },
        git: {
          useMaxWidth: true,
        },
        class: {
          useMaxWidth: true,
        },
        journey: {
          useMaxWidth: true,
        },
        quadrantChart: {
          useMaxWidth: true,
        },
        // Better error handling
        logLevel: 1, // Reduce logging
        // Configuration for better rendering
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
        fontSize: 16,
        // Fix for special characters
        useMaxWidth: true,
        // Ensure diagrams fit their containers
        secure: ['secure', 'sanitize', 'startOnLoad'],
      });

      const { svg, bindFunctions } = await mermaid.render(id, processedCode);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = svg;
      const mermaidSVG = tempDiv.querySelector("svg");

      if (mermaidSVG) {
        // Set proper CSS for the SVG to ensure it scales correctly without conflicts
        mermaidSVG.style.maxWidth = "100%";
        mermaidSVG.style.width = "100%";
        mermaidSVG.style.height = "auto";
        mermaidSVG.style.display = "block";
        
        // Adjust the viewBox to fit properly without making diagrams too large
        const viewBox = mermaidSVG.getAttribute("viewBox");
        if (viewBox) {
          const [x, y, width, height] = viewBox.split(" ").map(Number);
          // Use a smaller padding to prevent diagrams from becoming too large
          const padding = Math.max(width, height) * 0.05; // Reduced from 20% to 5%
          const newX = x - padding / 2;
          const newY = y - padding / 2;
          const newWidth = width + padding;
          const newHeight = height + padding;
          mermaidSVG.setAttribute("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`);
        }

        // Find the wrapper container
        const wrapperContainer = placeholder.closest('.mermaid-container-wrapper');
        if (wrapperContainer) {
          const wrapper = document.createElement("div");
          wrapper.className = "mermaid-container my-2 p-4 border border-border rounded-md bg-card text-center";
          // Set dimensions for the container to prevent scrollbars
          wrapper.style.maxWidth = "100%";
          wrapper.style.width = "100%";
          // Remove fixed max height and overflow to prevent scrollbars
          wrapper.style.overflow = "hidden";

          // Create a div for the diagram content with fixed dimensions
          const contentDiv = document.createElement("div");
          contentDiv.className = "mermaid-diagram-content";
          contentDiv.style.width = "100%";
          contentDiv.style.display = "flex";
          contentDiv.style.justifyContent = "center";
          contentDiv.style.alignItems = "center";
          contentDiv.style.minHeight = "200px";
          // Prevent content overflow
          contentDiv.style.overflow = "hidden";
          contentDiv.appendChild(mermaidSVG);

          wrapper.appendChild(contentDiv);
          wrapper.appendChild(setupControls(mermaidSVG));
          
          // Replace the entire wrapper container with the new diagram container
          // This prevents diagrams from being rendered inside other diagrams
          wrapperContainer.replaceWith(wrapper);
        }
        
        // Bind functions if they exist
        if (bindFunctions) {
          bindFunctions(contentDiv);
        }
      }
    } catch (err) {
      console.error("Mermaid rendering error:", err);
      // Try to identify common syntax issues
      let errorMessage = err.message;
      if (errorMessage.includes('Parse error')) {
        errorMessage += ' (This might be due to unescaped quotes or syntax issues in node labels)';
      }
      
      // Find the wrapper container
      const wrapperContainer = placeholder.closest('.mermaid-container-wrapper');
      if (wrapperContainer) {
        // Hide the original code block and show only the error
        wrapperContainer.innerHTML = `
          <div class="mermaid-container my-2 p-4 border border-destructive rounded-md bg-destructive/10 text-center">
            <div class="text-destructive p-2 text-sm">
              <div class="font-medium">Error rendering diagram:</div>
              <div class="mt-1 text-xs">${errorMessage}</div>
              <details class="mt-2">
                <summary class="cursor-pointer text-xs">Show original diagram code</summary>
                <pre class="mt-1 text-xs overflow-auto max-h-32">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
              </details>
              <details class="mt-2">
                <summary class="cursor-pointer text-xs">Show processed diagram code</summary>
                <pre class="mt-1 text-xs overflow-auto max-h-32">${processedCode.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
              </details>
              <div class="mt-2 text-xs">Tip: Ensure all special characters in node labels are properly escaped. For example:
                <ul class="text-left mt-1 list-disc list-inside">
                  <li>Use double quotes around labels containing special characters: A["Label with (parentheses)"]</li>
                  <li>Escape parentheses: A[Label with \(parentheses\)]</li>
                  <li>Escape quotes: B{User Clicks \"Login\"}</li>
                </ul>
              </div>
            </div>
          </div>`;
      }
    }
  };

  // Main rendering effect
  useEffect(() => {
    // Skip rendering if content hasn't changed or if already rendering
    if (lastMarkdownRef.current === markdown && renderedContentRef.current && lastIsStreamingRef.current === isStreaming) {
      return
    }
    
    // Skip rendering if currently rendering
    if (isRenderingRef.current) {
      return
    }

    // For streaming, we want to render as we receive content
    // For non-streaming, we can skip if content is the same
    if (!isStreaming && lastMarkdownRef.current === markdown) {
      return
    }

    const renderMarkdown = async () => {
      isRenderingRef.current = true
      lastIsStreamingRef.current = isStreaming
      
      if (!previewRef.current) {
        isRenderingRef.current = false
        return
      }

      try {
        // Load required libraries with global caching
        const libraries = [
          loadScript("https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js"),
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"),
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/js/all.min.js")
        ]

        if (renderMermaid) {
          libraries.push(loadScript("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"))
        }

        await Promise.all(libraries)

        // Initialize libraries from global cache or window object
        if (!libraryCache.marked) {
          libraryCache.marked = window.marked;
        }
        
        if (!libraryCache.hljs) {
          libraryCache.hljs = window.hljs;
        }
        
        if (renderMermaid && !libraryCache.mermaid) {
          libraryCache.mermaid = window.mermaid;
        }

        const marked = libraryCache.marked;
        const hljs = libraryCache.hljs;
        const mermaid = renderMermaid ? libraryCache.mermaid : null;

        if (!marked || !hljs) {
          throw new Error("Failed to load required libraries")
        }

        // Only initialize Mermaid if we have diagrams to render
        if (renderMermaid && mermaid && markdown.includes('```mermaid')) {
          try {
            mermaid.initialize({
              theme: isDarkMode ? "dark" : "default",
              securityLevel: "loose",
              startOnLoad: false, // Don't auto-render
              flowchart: {
                useMaxWidth: true,
                htmlLabels: false, // Use SVG labels for better compatibility
              },
              sequence: {
                useMaxWidth: true,
                wrap: true,
                mirrorActors: true,
              },
              gantt: {
                useMaxWidth: true,
              },
              state: {
                useMaxWidth: true,
                defaultRenderer: 'dagre',
              },
              pie: {
                useMaxWidth: true,
              },
              requirement: {
                useMaxWidth: true,
              },
              git: {
                useMaxWidth: true,
              },
              class: {
                useMaxWidth: true,
              },
              journey: {
                useMaxWidth: true,
              },
              quadrantChart: {
                useMaxWidth: true,
              },
              // Better error handling
              logLevel: 1, // Reduce logging
              // Configuration for better rendering
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
              fontSize: 16,
              // Fix for special characters
              useMaxWidth: true,
              // Ensure diagrams fit their containers
              secure: ['secure', 'sanitize', 'startOnLoad'],
            })
          } catch (initError) {
            console.error("Mermaid initialization error:", initError)
          }
        }

        // Create custom renderer for marked
        const renderer = new marked.Renderer()

        renderer.code = (code, language) => {
          // Don't interfere with mermaid code blocks as they're handled separately
          if (language && language.toLowerCase() === "mermaid" && renderMermaid && mermaid) {
            return false; // Let the markdown parser handle it normally
          }

          return false
        }

        // Configure marked
        marked.use({
          renderer,
          async: false,
          breaks: true,
          gfm: true,
        })

        // Process markdown with mermaid code blocks
        let tempHtml = markdown
        if (renderMermaid && mermaid) {
          const mermaidRegex = /```mermaid\n([\s\S]+?)\n```/g
          tempHtml = markdown.replace(mermaidRegex, (match, code) => {
            // Create a unique wrapper for each mermaid diagram to prevent nesting issues
            return `<div class="mermaid-container-wrapper" data-mermaid-index="${Date.now()}-${Math.random()}">
                      <div class="mermaid-placeholder" data-mermaid-code="${encodeURIComponent(code)}"></div>
                    </div>`
          })
        }

        const parsedHtml = marked.parse(tempHtml)
        const tempContainer = document.createElement("div")
        tempContainer.innerHTML = parsedHtml

        if (isStreaming) {
          const currentHash = getMarkdownHash(markdown);
          const lastHash = getMarkdownHash(lastProcessedMarkdownRef.current);
          
          // If content hasn't really changed, skip full re-render
          if (currentHash === lastHash && renderedContentRef.current) {
            // Still process any new diagrams that might have appeared
            if (renderMermaid && mermaid) {
              const placeholders = previewRef.current.querySelectorAll(".mermaid-placeholder:not(.processed)")
              await Promise.all(Array.from(placeholders).map((placeholder, index) => {
                placeholder.classList.add('processed'); // Mark as processed
                return renderMermaidDiagram(placeholder, index)
              }));
            }
            isRenderingRef.current = false
            return
          }
          lastProcessedMarkdownRef.current = markdown;
          
          previewRef.current.innerHTML = ""
          while (tempContainer.firstChild) {
            previewRef.current.appendChild(tempContainer.firstChild)
          }
        } else {
          // For non-streaming, replace the entire content
          previewRef.current.innerHTML = ""
          while (tempContainer.firstChild) {
            previewRef.current.appendChild(tempContainer.firstChild)
          }
        }

        // Apply syntax highlighting to code blocks
        processCodeBlocks(previewRef.current)
        
        // Store rendered content to prevent re-renders
        lastMarkdownRef.current = markdown
        renderedContentRef.current = previewRef.current.innerHTML

        // Process Mermaid diagrams in parallel without blocking text content
        if (renderMermaid && mermaid) {
          // For streaming, only process unprocessed placeholders
          // For non-streaming, process all placeholders
          const selector = isStreaming 
            ? ".mermaid-placeholder:not(.processed)" 
            : ".mermaid-placeholder"
          const placeholders = previewRef.current.querySelectorAll(selector)
          
          // Render each diagram independently
          // Use Promise.all to ensure all diagrams are rendered before considering the render complete
          await Promise.all(Array.from(placeholders).map((placeholder, index) => {
            if (isStreaming) {
              placeholder.classList.add('processed'); // Mark as processed
            }
            return renderMermaidDiagram(placeholder, index)
          }));
        }
      } catch (error) {
        console.error("Markdown rendering error:", error)
        if (previewRef.current) {
          previewRef.current.innerHTML = `<div class="text-destructive p-2 text-sm">Error rendering markdown: ${error.message}</div>`
        }
      } finally {
        isRenderingRef.current = false
      }
    }

    // For streaming, render immediately to provide responsive feedback
    // For non-streaming, debounce to avoid excessive re-renders
    if (isStreaming) {
      renderMarkdown()
    } else {
      // Debounce the rendering to avoid excessive re-renders
      const timeoutId = setTimeout(renderMarkdown, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [markdown, renderMermaid, processCodeBlocks, isDarkMode, isStreaming])

  return (
    <div className={`compact-markdown ${className || ""}`}>
      {/* Preload critical resources */}
      <link rel="preload" as="script" href="https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js" />
      <link
        rel="preload"
        as="script"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
      />
      {renderMermaid && (
        <link rel="preload" as="script" href="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js" />
      )}

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
        id="lightTheme"
        disabled={isDarkMode}
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        id="darkTheme"
        disabled={!isDarkMode}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .compact-markdown {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
          font-size: 16px;
          line-height: 1.5;
          color: ${isDarkMode ? 'hsl(210, 10%, 85%)' : 'hsl(210, 15%, 15%)'};
        }
        
        /* Compact spacing for chat bubbles */
        .compact-markdown h1 { 
          font-size: 1.5rem; 
          font-weight: 600; 
          margin: 0.5rem 0 0.25rem 0;
          line-height: 1.25;
          border-bottom: 1px solid ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
          padding-bottom: 0.25rem;
        }
        .compact-markdown h2 { 
          font-size: 1.25rem; 
          font-weight: 600; 
          margin: 0.5rem 0 0.25rem 0;
          line-height: 1.25;
          border-bottom: 1px solid ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
          padding-bottom: 0.25rem;
        }
        .compact-markdown h3 { 
          font-size: 1.125rem; 
          font-weight: 600; 
          margin: 0.5rem 0 0.25rem 0;
          line-height: 1.25;
        }
        .compact-markdown h4, .compact-markdown h5, .compact-markdown h6 { 
          font-size: 1rem; 
          font-weight: 600; 
          margin: 0.5rem 0 0.25rem 0;
          line-height: 1.25;
        }
        
        .compact-markdown p { 
          margin: 0.25rem 0;
          line-height: 1.5;
        }
        
        /* Enhanced list styling with better bullet visibility and contrast */
        .compact-markdown ul, .compact-markdown ol { 
          margin: 0.25rem 0;
          padding-left: 1.5rem;
          list-style-position: outside;
        }
        
        .compact-markdown ul {
          list-style-type: disc;
        }
        
        .compact-markdown ol {
          list-style-type: decimal;
        }
        
        .compact-markdown ul ul {
          list-style-type: circle;
          margin-top: 0.125rem;
        }
        
        .compact-markdown ul ul ul {
          list-style-type: square;
        }
        
        .compact-markdown li { 
          margin: 0.125rem 0;
          line-height: 1.4;
          display: list-item;
        }
        
        /* Force bullet visibility with explicit colors */
        .compact-markdown ul li::marker {
          color: ${isDarkMode ? 'hsl(210, 10%, 85%)' : 'hsl(210, 15%, 15%)'};
        }
        
        .compact-markdown ol li::marker {
          color: ${isDarkMode ? 'hsl(210, 10%, 85%)' : 'hsl(210, 15%, 15%)'};
        }
        
        .compact-markdown blockquote { 
          border-left: 0.25rem solid ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
          margin: 0.5rem 0;
          padding: 0 1rem;
          color: ${isDarkMode ? 'hsl(215, 10%, 65%)' : 'hsl(215, 15%, 35%)'};
          background-color: ${isDarkMode ? 'hsl(220, 13%, 18%)' : 'hsl(210, 40%, 98%)'};
          border-radius: 0 6px 6px 0;
        }
        
        .compact-markdown a { 
          color: #0969da;
          text-decoration: none;
        }
        .compact-markdown a:hover { 
          text-decoration: underline;
        }
        
        .dark .compact-markdown a { 
          color: #58a6ff;
        }
        
        .compact-markdown img { 
          max-width: 100%; 
          height: auto; 
          border-radius: 6px;
          margin: 0.5rem 0;
          border: 1px solid ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
        }
        
        /* Enhanced table styling with better border contrast */
        .compact-markdown table { 
          border-collapse: collapse; 
          margin: 0.5rem 0;
          width: 100%;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid ${isDarkMode ? "hsl(217, 19%, 27%)" : "hsl(213, 27%, 84%)"};
          background-color: ${isDarkMode ? 'hsl(220, 13%, 15%)' : 'hsl(0, 0%, 100%)'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .compact-markdown th, .compact-markdown td { 
          border: 1px solid ${isDarkMode ? "hsl(217, 19%, 27%)" : "hsl(213, 27%, 84%)"};
          padding: 8px 12px;
          text-align: left;
        }
        
        .compact-markdown th { 
          font-weight: 600;
          background-color: ${isDarkMode ? 'hsl(220, 13%, 18%)' : 'hsl(210, 40%, 98%)'};
          border-bottom: 2px solid ${isDarkMode ? "hsl(217, 19%, 27%)" : "hsl(213, 27%, 84%)"};
        }

        .compact-markdown tr:nth-child(even) {
          background-color: ${isDarkMode ? 'hsl(220, 13%, 18%)/0.5' : 'hsl(210, 40%, 98%)/0.5'};
        }
        
        /* Better table container with visible borders like code blocks */
        .compact-markdown table {
          box-shadow: 0 0 0 1px ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
        }
        
        /* Enhanced code block styling with better contrast */
        .compact-markdown pre { 
          background-color: ${isDarkMode ? 'hsl(220, 13%, 18%)' : 'hsl(210, 40%, 98%)'};
          border: 2px solid ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
          border-radius: 6px;
          font-size: 85%;
          line-height: 1.45;
          margin: 0.5rem 0;
          position: relative;
          box-shadow: 0 0 0 1px ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
        }
        
        .compact-markdown pre .code-header {
          background-color: ${isDarkMode ? "hsl(220, 13%, 18%)" : "hsl(210, 40%, 98%)"};
          border-bottom: 2px solid ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 4px 4px 0 0;
          font-size: 12px;
          border: 1px solid ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
          border-bottom: 2px solid ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
        }
        
        .compact-markdown pre code { 
          background: transparent;
          border: 0;
          display: block;
          line-height: inherit;
          margin: 0;
          max-width: auto;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 16px;
          white-space: pre;
          word-wrap: normal;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 12px;
          margin-top: 0;
          color: ${isDarkMode ? 'hsl(210, 10%, 85%)' : 'hsl(210, 15%, 15%)'};
        }
        
        .compact-markdown :not(pre) > code {
          background-color: ${isDarkMode ? 'hsl(220, 13%, 18%)' : 'hsl(210, 40%, 98%)'};
          border: 1px solid ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
          border-radius: 3px;
          font-size: 85%;
          margin: 0;
          padding: 0.2em 0.4em;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          color: ${isDarkMode ? 'hsl(210, 10%, 85%)' : 'hsl(210, 15%, 15%)'};
        }
        
        .compact-markdown hr {
          background-color: ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
          border: 0;
          height: 0.25em;
          margin: 24px 0;
          padding: 0;
          border-radius: 2px;
        }
        
        /* Mermaid diagram styles */
        .compact-markdown .mermaid-container-wrapper {
          position: relative;
          margin: 0.5rem 0;
        }
        
        .compact-markdown .mermaid-container-wrapper pre {
          margin: 0;
          border-radius: 6px 6px 0 0;
          border-bottom: none;
        }
        
        .compact-markdown .mermaid-container { 
          overflow: hidden; 
          position: relative;
          background-color: ${isDarkMode ? 'hsl(220, 13%, 15%)' : 'hsl(0, 0%, 100%)'};
          border-radius: 0 0 6px 6px;
          margin: 0;
          max-width: 100%;
          width: 100%;
          border: 2px solid ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
          border-top: none;
        }
        
        .compact-markdown .mermaid-diagram-content {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          width: 100%;
          min-height: 200px;
          overflow: hidden;
        }
        
        .compact-markdown .mermaid-diagram-content svg {
          max-width: 100%;
          max-height: 100%;
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
        }
        
        .compact-markdown .controls-wrapper {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          z-index: 10;
          background-color: ${isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
          border-radius: 0.5rem;
          padding: 0.25rem;
        }
        
        /* Control styles */
        .compact-markdown .control-button {
          padding: 0.5rem;
          border-radius: 0.375rem;
          background-color: ${isDarkMode ? '#374151' : '#e5e5e5'};
          color: ${isDarkMode ? '#d1d5db' : '#1f2937'};
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
        
        .compact-markdown .control-button:hover {
          background-color: ${isDarkMode ? '#4b5563' : '#d4d4d4'};
        }
        
        .compact-markdown .control-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 0.25rem;
          width: fit-content;
        }
        
        .compact-markdown .control-grid .left { grid-column: 1; grid-row: 2; }
        .compact-markdown .control-grid .up { grid-column: 2; grid-row: 1; }
        .compact-markdown .control-grid .right { grid-column: 3; grid-row: 2; }
        .compact-markdown .control-grid .down { grid-column: 2; grid-row: 3; }
        .compact-markdown .control-grid .reset { grid-column: 2; grid-row: 2; }
        .compact-markdown .control-grid .zoom-in { grid-column: 3; grid-row: 1; }
        .compact-markdown .control-grid .zoom-out { grid-column: 3; grid-row: 3; }
        
        /* Responsive controls for mobile */
        @media (max-width: 768px) {
          .compact-markdown .control-button {
            padding: 0.25rem;
            font-size: 0.6rem;
            width: 1.5rem;
            height: 1.5rem;
          }
          
          .compact-markdown .control-grid {
            gap: 0.1rem;
          }
          
          .compact-markdown .controls-wrapper {
            bottom: 0.25rem;
            right: 0.25rem;
            padding: 0.1rem;
          }
        }

        /* Better dark mode support with enhanced contrast */
        .dark .compact-markdown {
          color: ${isDarkMode ? 'hsl(210, 10%, 85%)' : 'hsl(210, 15%, 15%)'};
        }
        
        .dark .compact-markdown pre {
          background-color: ${isDarkMode ? 'hsl(220, 13%, 18%)' : 'hsl(210, 40%, 98%)'};
          border-color: ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
        }
        
        .dark .compact-markdown :not(pre) > code {
          background-color: ${isDarkMode ? 'hsl(220, 13%, 18%)' : 'hsl(210, 40%, 98%)'};
          border-color: ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
        }
        
        .dark .compact-markdown table {
          background-color: ${isDarkMode ? 'hsl(220, 13%, 15%)' : 'hsl(0, 0%, 100%)'};
          border-color: ${isDarkMode ? 'hsl(217, 19%, 27%)' : 'hsl(213, 27%, 84%)'};
        }
        
        .dark .compact-markdown table th {
          background-color: ${isDarkMode ? 'hsl(220, 13%, 18%)' : 'hsl(210, 40%, 98%)'};
        }
        
        .dark .compact-markdown tr:nth-child(even) {
          background-color: ${isDarkMode ? 'hsl(220, 13%, 18%)/0.3' : 'hsl(210, 40%, 98%)/0.5'};
        }
        
        .dark .compact-markdown ul li::marker,
        .dark .compact-markdown ol li::marker {
          color: ${isDarkMode ? 'hsl(210, 10%, 85%)' : 'hsl(210, 15%, 15%)'};
        }
        
        /* Absolute positioning for copy button */
        .compact-markdown .code-header {
          position: relative;
        }
        
        .compact-markdown .copy-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
        }
      `,
        }}
      />

      <div ref={previewRef} className="prose prose-sm max-w-none" />
    </div>
  )
}

export default React.memo(CompactMarkdown, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.markdown === nextProps.markdown &&
    prevProps.renderMermaid === nextProps.renderMermaid &&
    prevProps.className === nextProps.className &&
    prevProps.messageId === nextProps.messageId &&
    prevProps.isStreaming === nextProps.isStreaming
  );
});
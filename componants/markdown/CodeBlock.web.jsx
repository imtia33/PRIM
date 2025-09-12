import React, { useState } from "react";

// ─── Syntax Colors & Styles ─────────────────────────────
const getSyntaxColors = (theme) => ({
  keyword: { color: "#54adf6", fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
  builtin: { color: "#569cda", fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
  classname: { color: "#4ecab0", fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
  string: { color: "#64cac0", fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
  number: { color: "#EE4060", fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
  comment: { color: "#58a467", fontStyle: "italic", fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
  funcname: { color: "#e2ad6d", fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
  variable: { color: theme.text, fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
  operator: { color: "#dfdfdf", fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
  punctuation: { color: theme.text, fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
  plain: { color: theme.text, fontFamily: "Consolas, Monaco, monospace", fontWeight: "550" },
});

// ─── Tokenizer Function ────────────────────────────────
function tokenizeCode(code) {
  const regexPatterns = [
    { type: "comment", regex: /^\/\/.*$/ },
    { type: "string", regex: /^(['"`])(?:\\.|[^\1\\])*?\1/ },
    { type: "number", regex: /^\d+(\.\d+)?/ },
    { type: "keyword", regex: /^(import|const|let|class|function|return|await|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|this|super|extends|static|get|set|async|await|yield|export|default|from|as)\b/ },
    { type: "builtin", regex: /^(console|Math|JSON|Array|Object|String|Number|Boolean|Date|RegExp|Error|Promise|Map|Set|WeakMap|WeakSet|Symbol|Proxy|Reflect|Client|Account)\b/ },
    { type: "funcname", regex: /^[a-zA-Z_][a-zA-Z0-9_]*(?=\()/ },
    { type: "classname", regex: /^[A-Z][a-zA-Z0-9_]*/ },
    { type: "operator", regex: /^[=+\-*/.%!<>?:&|~^]/ },
    { type: "punctuation", regex: /^[{}()[\];.,]/ },
    { type: "variable", regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
  ];

  const tokens = [];
  let i = 0;

  while (i < code.length) {
    let matched = false;

    for (let { type, regex } of regexPatterns) {
      const substring = code.slice(i);
      const match = substring.match(regex);
      if (match) {
        tokens.push({ type, content: match[0] });
        i += match[0].length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Fallback for plain text
      tokens.push({ type: "plain", content: code[i] });
      i++;
    }
  }

  return tokens;
}

// ─── Code Block Component ──────────────────────────────
const CodeBlock = ({ code, language, fontSize = 12, theme }) => {
  // Default theme if none provided
  const currentTheme = theme || {
    text: '#333',
    cardBackground: '#f8f8f8',
    secondTabBackground: '#e0e0e0',
    secondaryText: '#666',
    borderColor: '#ddd'
  };
  
  const syntaxColors = getSyntaxColors(currentTheme);
  
  // Split lines for display, preserving all whitespace
  const lines = code.split("\n");
  
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      backgroundColor: "transparent", // No background for the container
      borderRadius: 8,
      overflow: "hidden",
      margin: "12px 0",
      fontFamily: "Inter, sans-serif",
      padding: "5px 10px", // Added padding around the code block
    }}>
      {/* Header Bar with language and copy button */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: currentTheme.secondTabBackground || "#e0e0e0",
        padding: "8px 12px",
        borderBottom: `1px solid ${currentTheme.borderColor || "#ddd"}`,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}>
        <span style={{
          color: currentTheme.secondaryText || "#666",
          fontSize: 12,
          textTransform: "uppercase",
          fontWeight: "500",
        }}>
          {language && language !== 'text' ? language.charAt(0).toUpperCase() + language.slice(1) : "Code"}
        </span>
        <button 
          onClick={copyToClipboard}
          style={{
            backgroundColor: "#FD366E",
            color: "white",
            border: "none",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontWeight: "500",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      
      {/* Code Content with horizontal scrolling */}
      <div style={{
        overflowX: "auto",
        backgroundColor: currentTheme.cardBackground || "#f8f8f8",
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        
      }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          padding: "12px 0",
        }}>
          {/* Code with inline line numbers */}
          <div style={{
            padding: "0 4px",
            minWidth: "fit-content", // Ensure proper sizing for long lines
          }}>
            {lines.map((line, lineIdx) => {
              // Process the entire line as a single unit to preserve all whitespace
              const lineTokens = tokenizeCode(line);
              
              return (
                <div key={lineIdx} style={{
                  display: "flex",
                  flexWrap: "nowrap", // Prevent wrapping
                  alignItems: "flex-start", // Align to top
                }}>
                  {/* Line number at the start of each line (unselectable) */}
                  <span style={{ 
                    color: currentTheme.secondaryText || "#858585",
                    fontFamily: "Consolas, Monaco, monospace",
                    paddingRight: 10,
                    paddingLeft: 10,
                    fontSize: fontSize,
                    lineHeight: `${fontSize * 1.5}px`,
                    userSelect: "none",
                    minWidth: "24px", // Fixed width for alignment
                    textAlign: "right",
                  }}>
                    {String(lineIdx + 1).padStart(2, '0')}
                  </span>
                  
                  {/* Render tokenized content with preserved whitespace */}
                  {lineTokens.map((token, tokenIdx) => (
                    <span
                      key={tokenIdx}
                      style={{ 
                        ...syntaxColors[token.type], 
                        fontSize: fontSize, 
                        lineHeight: `${fontSize * 1.5}px`,
                        backgroundColor: token.type === "code_inline" ? "rgba(0,0,0,0.05)" : "transparent",
                        whiteSpace: "pre", // Preserve whitespace within tokens
                      }}
                    >
                      {token.content}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useTheme } from "../../context/ColorMode";

// ─── Syntax Colors & Styles ─────────────────────────────
const getSyntaxColors = (theme) => ({
  keyword: { color: "#54adf6", fontFamily: "cc-regular", fontWeight: "550" },
  builtin: { color: "#569cda", fontFamily: "cc-regular", fontWeight: "550" },
  classname: { color: "#4ecab0", fontFamily: "cc-regular", fontWeight: "550" },
  string: { color: "#64cac0", fontFamily: "cc-regular", fontWeight: "550" },
  number: { color: "#EE4060", fontFamily: "cc-regular", fontWeight: "550" },
  comment: { color: "#58a467", fontStyle: "italic", fontFamily: "cc-bold", fontWeight: "550" },
  funcname: { color: "#e2ad6d", fontFamily: "cc-regular", fontWeight: "550" },
  variable: { color: theme.text, fontFamily: "cc-regular", fontWeight: "550" },
  operator: { color: "#dfdfdf", fontFamily: "cc-regular", fontWeight: "550" },
  punctuation: { color: theme.text, fontFamily: "cc-regular", fontWeight: "550" },
  plain: { color: theme.text, fontFamily: "cc-regular", fontWeight: "550" },
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
const CodeBlock = ({ code, language , fontSize = 14 }) => {
  const { theme } = useTheme();
  const syntaxColors = getSyntaxColors(theme);
  
  // Split lines for display
  const lines = code.split("\n");

  return (
    <View style={{
      backgroundColor: theme.cardBackground || "#1e1e1e",
      borderRadius: 8,
      overflow: "hidden",
      marginVertical: 4,
      borderWidth: 1,
      borderColor: theme.borderColor || "#333",
      margin: "8px 0",
      padding: 3,
    }}>
      {/* Simple Header Bar without dots */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.secondTabBackground || "#2d2d2d",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColor || "#333",
      }}>
        <Text style={{
          color: theme.secondaryText || "#888",
          fontFamily: "cc-regular",
          fontSize: 10,
          textTransform: "uppercase",
        }}>
          {language && language !== 'text' ? language.charAt(0).toUpperCase() + language.slice(1) : "Code"}
        </Text>
      </View>
      
      {/* Code Content */}
      <ScrollView 
        horizontal 
        style={{
          backgroundColor: theme.cardBackground || "#1e1e1e",
        }}
        showsHorizontalScrollIndicator={true}
      >
        <View style={{
          flexDirection: "row",
          paddingVertical: 8,
        }}>
          {/* Code with inline line numbers */}
          <View style={{
            flex: 1,
            paddingHorizontal: 4,
          }}>
            {lines.map((line, lineIdx) => {
              // Process the entire line as a single unit to preserve all whitespace
              const lineTokens = tokenizeCode(line);
              
              return (
                <View key={lineIdx} style={{
                  flexDirection: "row",
                  flexWrap: "nowrap",
                }}>
                  {/* Line number at the start of each line (unselectable) */}
                  <Text style={[{ 
                    color: theme.secondaryText || "#858585",
                    fontFamily: "cc-regular",
                    paddingRight: 12,
                    minWidth: 20,
                    textAlign: "right",
                  }, { fontSize, lineHeight: fontSize * 1.3 }]} selectable={false}>
                    {String(lineIdx + 1).padStart(2, '0')}
                  </Text>
                  
                  {/* Render tokenized content with preserved whitespace */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {lineTokens.map((token, tokenIdx) => (
                      <Text
                        key={tokenIdx}
                        selectable={true}
                        style={[syntaxColors[token.type], { 
                          fontSize, 
                          lineHeight: fontSize * 1.3,
                          flexWrap: 'wrap',
                        }]}
                      >
                        {token.content}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CodeBlock;
import React from "react";
import { View } from "react-native";
import Markdown from "react-native-markdown-display";
import CodeBlock from "./CodeBlock";
import { useTheme } from "../../context/ColorMode";

const MarkdownText = ({markdown="", style, renderMermaid = true, textStyle = {}}) => {
  const { theme } = useTheme();

  const getMarkdownStyles = (theme) => ({
    body: { 
      color: theme.text, 
      fontSize: 16, 
      fontFamily: "cc-regular",
      flexWrap: 'wrap',
      flexShrink: 1,
      margin: 0,
      padding: 0,
    },
    heading1: { 
      color: theme.accent || "#4da6ff", 
      marginBottom: 4, 
      fontFamily: "cc-regular", 
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 8,
    },
    heading2: { 
      color: theme.accent2 || "#66ccff", 
      marginBottom: 4, 
      fontFamily: "cc-regular", 
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 8,
    },
    heading3: { 
      color: theme.primary || "#80dfff", 
      marginBottom: 4, 
      fontFamily: "cc-regular", 
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 8,
    },
    paragraph: { 
      fontFamily: "cc-regular", 
      fontSize: 16, 
      color: theme.text,
      flexWrap: 'wrap',
      flexShrink: 1,
      margin: 0,
      padding: 0,
      lineHeight: 20,
    },
    strong: { 
      fontFamily: "cc-regular", 
      fontSize: 16, 
      fontWeight: "bold",
      flexWrap: 'wrap',
      flexShrink: 1,
      margin: 0,
      padding: 0,
      lineHeight: 20,
    },
    em: { 
      fontFamily: "cc-regular", 
      fontSize: 16, 
      fontStyle: "italic",
      flexWrap: 'wrap',
      flexShrink: 1,
      margin: 0,
      padding: 0,
      lineHeight: 20,
    },
    link: { 
      fontFamily: "cc-regular", 
      fontSize: 16, 
      color: theme.accent || "#4da6ff",
      textDecorationLine: 'underline',
      margin: 0,
      padding: 0,
      lineHeight: 20,
    },
    list_item: { 
      fontFamily: "cc-regular", 
      fontSize: 16, 
      color: theme.text,
      flexWrap: 'wrap',
      flexShrink: 1,
      margin: 0,
      padding: 0,
      lineHeight: 20,
    },
    bullet_list: { 
      fontFamily: "cc-regular", 
      fontSize: 16,
      margin: 0,
      padding: 0,
      lineHeight: 20,
    },
    ordered_list: { 
      fontFamily: "cc-regular", 
      fontSize: 16,
      margin: 0,
      padding: 0,
      lineHeight: 20,
    },
    text: { 
      fontFamily: "cc-regular", 
      fontSize: 16, 
      color: theme.text,
      flexWrap: 'wrap',
      flexShrink: 1,
      margin: 0,
      padding: 0,
      lineHeight: 20,
    },
    code_inline: {
      backgroundColor: "rgba(0,0,0,0.05)",
      color: theme.text || "#333",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: "cc-regular",
      fontSize: 14,
      fontWeight: "500"
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: theme.borderColor || "#888",
      paddingLeft: 8,
      color: theme.secondaryText || "#ccc",
      fontFamily: "cc-regular",
      fontSize: 16,
    },
    fence: {
      backgroundColor: "transparent",
      marginVertical: 12,
    },
  });

  // Filter out mermaid code blocks if we're not supposed to render them
  const processedMarkdown = renderMermaid ? markdown : markdown.replace(/```mermaid[\s\S]*?```/g, '');

  return (
    <View style={[{
      flex: 1,
      backgroundColor: theme.background || "#111",
      width: '100%',
    }, style]}>
        <Markdown
          style={getMarkdownStyles(theme)}
          rules={{
            fence: (node, children, parent, styles) => {
              const language = node.language || "javascript";
              return (
                <CodeBlock
                  code={node.content}
                  language={language}
                />
              );
            },
          }}
        >
          {processedMarkdown}
        </Markdown>
    </View>
  );
};

export default MarkdownText;
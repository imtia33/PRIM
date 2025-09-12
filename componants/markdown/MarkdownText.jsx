import React from "react";
import { View } from "react-native";
import Markdown from "react-native-markdown-display";
import CodeBlock from "./CodeBlock";
import { useTheme } from "../../context/ColorMode";

const MarkdownText = ({markdown="", style, renderMermaid = true}) => {
  const { theme } = useTheme();

  const getMarkdownStyles = (theme) => ({
    body: { color: theme.text, fontSize: 16, fontFamily: "cc-regular" },
    heading1: { color: theme.accent || "#4da6ff", marginBottom: 8, fontFamily: "cc-regular", fontSize: 16 },
    heading2: { color: theme.accent2 || "#66ccff", marginBottom: 6, fontFamily: "cc-regular", fontSize: 16 },
    heading3: { color: theme.primary || "#80dfff", marginBottom: 4, fontFamily: "cc-regular", fontSize: 16 },
    heading4: { color: theme.focusedText || "#99e6ff", marginBottom: 4, fontFamily: "cc-regular", fontSize: 16 },
    heading5: { color: theme.unfocusedText || "#b3ecff", marginBottom: 2, fontFamily: "cc-regular", fontSize: 16 },
    heading6: { color: theme.secondaryText || "#ccf2ff", marginBottom: 2, fontFamily: "cc-regular", fontSize: 16 },
    paragraph: { fontFamily: "cc-regular", fontSize: 16, color: theme.text },
    strong: { fontFamily: "cc-regular", fontSize: 16, fontWeight: "bold" },
    em: { fontFamily: "cc-regular", fontSize: 16, fontStyle: "italic" },
    link: { fontFamily: "cc-regular", fontSize: 16, color: theme.accent || "#4da6ff" },
    list_item: { fontFamily: "cc-regular", fontSize: 16, color: theme.text },
    bullet_list: { fontFamily: "cc-regular", fontSize: 16 },
    ordered_list: { fontFamily: "cc-regular", fontSize: 16 },
    text: { fontFamily: "cc-regular", fontSize: 16, color: theme.text },
    code_inline: {
      backgroundColor: "rgba(0,0,0,0.05)", // Semi-transparent greyish background
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
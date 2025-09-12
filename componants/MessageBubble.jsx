import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import MarkdownText from './markdown/MarkdownText';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const MessageBubble = ({ message, theme, isLastMessage, messageBubbleWidth, copyToClipboard, isDesktop }) => {
  const isAIMessage = message.role === 'model';
  const isStreaming = message.isStreaming;
  
  // State to track if we should render mermaid diagrams
  const [shouldRenderMermaid, setShouldRenderMermaid] = useState(!isStreaming);
  
  // When streaming is complete, enable mermaid rendering
  useEffect(() => {
    if (!isStreaming && !shouldRenderMermaid) {
      setShouldRenderMermaid(true);
    }
  }, [isStreaming]);
  
  // For AI messages on mobile, use full width
  const effectiveBubbleWidth = isAIMessage && !isDesktop ? '100%' : messageBubbleWidth;
  
  const containerStyle = isAIMessage ? 
    [styles.aiMessageContainer, { marginBottom: isLastMessage ? 40 : 8 }] :
    [styles.userMessageContainer, { marginBottom: isLastMessage ? 40 : 8 }];
    
  // Different styles for AI and user messages
  const bubbleStyle = isAIMessage ?
    [styles.aiMessageBubble, { 
      backgroundColor: theme.mode === 'dark' ? 'hsl(210, 11%, 11%)' : 'hsl(0, 0%, 98%)',
      borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)',
      width: effectiveBubbleWidth,
    }] :
    [styles.userMessageBubble, { 
      backgroundColor: theme.mode === 'dark' ? 'hsl(210, 11%, 11%)' : 'hsl(0, 0%, 98%)',
      borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)',
      width: effectiveBubbleWidth,
    }];

  // Check if the message contains mermaid diagrams
  const containsMermaid = message.content && message.content.includes('```mermaid');
  
  // Show loading indicator for mermaid diagrams while streaming
  if (isStreaming && containsMermaid && !shouldRenderMermaid) {
    return (
      <View style={containerStyle}>
        <View style={bubbleStyle}>
          <ActivityIndicator 
            size="small" 
            color={theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(165, 96%, 71%)'} 
            style={{ marginVertical: 10 }}
          />
          <MarkdownText 
            markdown={message.content} 
            theme={theme}
            renderMermaid={false}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={bubbleStyle}>
        {message.content ? (
          <MarkdownText 
            markdown={message.content} 
            theme={theme}
            textStyle={{ 
              color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
            }}
            renderMermaid={shouldRenderMermaid}
          />
        ) : null}
        
        {isAIMessage && isStreaming && (
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, { backgroundColor: theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(165, 96%, 71%)' }]} />
            <View style={[styles.typingDot, { backgroundColor: theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(165, 96%, 71%)' }]} />
            <View style={[styles.typingDot, { backgroundColor: theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(165, 96%, 71%)' }]} />
          </View>
        )}
      </View>
      
      {message.content && (
        <Pressable 
          onPress={() => copyToClipboard(message.content)}
          style={({ pressed }) => [
            styles.copyButton,
            { 
              opacity: pressed ? 0.7 : 1,
              marginTop: 4,
              backgroundColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.1)' : 'hsla(165, 96%, 71%, 0.1)',
              padding: 4,
              borderRadius: 12,
            }
          ]}
        >
          <FontAwesome5 
            name="copy" 
            size={12} 
            color={theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(165, 96%, 71%)'} 
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  aiMessageContainer: {
    marginBottom: 8,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  userMessageContainer: {
    marginBottom: 8,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '100%',
  },
  aiMessageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    maxWidth: '100%',
    minWidth: 100,
  },
  userMessageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    maxWidth: '100%',
    minWidth: 100,
  },
  copyButton: {
    padding: 8,
    borderRadius: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
    height: 16,
    paddingLeft: 12,
    paddingBottom: 0,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    opacity: 0.7,
  },
});

export default MessageBubble;
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
    [styles.aiMessageContainer, { marginBottom: isLastMessage ? 80 : 16 }] :
    [styles.userMessageContainer, { marginBottom: isLastMessage ? 80 : 16 }];
    
  const bubbleStyle = isAIMessage ?
    [styles.aiMessageBubble, { 
      backgroundColor: theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
      borderColor: theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
      width: effectiveBubbleWidth,
    }] :
    [styles.userMessageBubble, { 
      backgroundColor: theme.mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(249, 250, 251, 0.9)',
      borderColor: theme.mode === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)',
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
            color={theme.mode === 'dark' ? '#93c5fd' : '#3b82f6'} 
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
            textStyle={isAIMessage ? {} : { 
              color: theme.mode === 'dark' ? '#f3f4f6' : '#f9fafb',
              textAlign: 'center', // Center text for better appearance
            }}
            renderMermaid={shouldRenderMermaid}
          />
        ) : null}
        
        {isAIMessage && isStreaming && (
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, { backgroundColor: theme.mode === 'dark' ? '#93c5fd' : '#3b82f6' }]} />
            <View style={[styles.typingDot, { backgroundColor: theme.mode === 'dark' ? '#93c5fd' : '#3b82f6' }]} />
            <View style={[styles.typingDot, { backgroundColor: theme.mode === 'dark' ? '#93c5fd' : '#3b82f6' }]} />
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
              marginTop: 8,
              backgroundColor: theme.mode === 'dark' ? 'rgba(79, 70, 229, 0.3)' : 'rgba(99, 102, 241, 0.1)',
              padding: 6,
              borderRadius: 12,
            }
          ]}
        >
          <FontAwesome5 
            name="copy" 
            size={14} 
            color={theme.mode === 'dark' ? '#c7d2fe' : '#4f46e5'} 
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  aiMessageContainer: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  aiMessageBubble: {
    paddingHorizontal: 15,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    paddingTop:10
  },
  userMessageContainer: {
    marginBottom: 16,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '100%',
  },
  userMessageBubble: {
    borderRadius: 20,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    paddingTop:10,
    paddingLeft:10
  },
  copyButton: {
    padding: 8,
    borderRadius: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    height: 20,
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
import React, { useState, useEffect, useMemo } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import MarkdownText from './markdown/MarkdownText';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const MessageBubble = ({ message, theme, messageBubbleWidth, copyToClipboard, isDesktop }) => {
  const isAIMessage = message.role === 'model';
  const isStreaming = message.isStreaming;
  
  // State to track if we should render mermaid diagrams
  const [shouldRenderMermaid, setShouldRenderMermaid] = useState(true);
  
  // For AI messages on mobile, use full width
  const effectiveBubbleWidth = isAIMessage && !isDesktop ? '100%' : messageBubbleWidth;
  
  const containerStyle = isAIMessage ? 
    {
      marginBottom: 8,
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
      maxWidth: '100%',
    } :
    {
      marginBottom: 8,
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
      maxWidth: '100%',
    };
    
  // Different styles for AI and user messages
  const bubbleStyle = isAIMessage ?
    {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderBottomLeftRadius: 4,
      maxWidth: isDesktop?'60%':'100%',
      minWidth: 100,
    } :
    {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderBottomRightRadius: 4,
      borderWidth: 1,
      maxWidth: '100%',
      minWidth: 100,
      backgroundColor: theme.mode === 'dark' ? 'hsl(210, 11%, 11%)' : 'hsl(0, 0%, 98%)',
      borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)',
      width: effectiveBubbleWidth,
    };

  // Check if the message contains mermaid diagrams
  const containsMermaid = useMemo(() => {
    return message.content && message.content.includes('```mermaid');
  }, [message.content]);

  return (
    <View style={containerStyle} className={isAIMessage ? 'aiMessageContainer' : 'userMessageContainer'}>
      <View style={bubbleStyle}>
        {message.content ? (
          <MarkdownText 
            markdown={message.content} 
            theme={theme}
            textStyle={{ 
              color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
            }}
            renderMermaid={true}
            messageId={message.id}
            isStreaming={isStreaming}
          />
        ) : null}
        
        {isAIMessage && isStreaming && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            marginTop: 4,
            height: 16,
            paddingLeft: 12,
            paddingBottom: 0,
          }}>
            <View style={{ 
              width: 6,
              height: 6,
              borderRadius: 3,
              marginHorizontal: 2,
              opacity: 0.7,
              backgroundColor: theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(165, 96%, 71%)' 
            }} />
            <View style={{ 
              width: 6,
              height: 6,
              borderRadius: 3,
              marginHorizontal: 2,
              opacity: 0.7,
              backgroundColor: theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(165, 96%, 71%)' 
            }} />
            <View style={{ 
              width: 6,
              height: 6,
              borderRadius: 3,
              marginHorizontal: 2,
              opacity: 0.7,
              backgroundColor: theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(165, 96%, 71%)' 
            }} />
          </View>
        )}
      </View>
      
      {message.content && (
        <Pressable 
          onPress={() => copyToClipboard(message.content)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            marginTop: 4,
            backgroundColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.1)' : 'hsla(165, 96%, 71%, 0.1)',
            padding: 4,
            borderRadius: 12,
          })}
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

export default React.memo(MessageBubble, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isStreaming === nextProps.message.isStreaming &&
    prevProps.theme.mode === nextProps.theme.mode &&
    prevProps.messageBubbleWidth === nextProps.messageBubbleWidth &&
    prevProps.isDesktop === nextProps.isDesktop
  );
});
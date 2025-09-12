import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import { useTheme } from '../../../context/ColorMode';
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatInterface from '../../../componants/ChatInput';
import { extractPRInfo, fetchPRData } from '../../../backend/github';
import { generatePRReviewPrompt, createAIChatService } from '../../../backend/ai';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MessageBubble from '../../../componants/MessageBubble';
import * as Clipboard from 'expo-clipboard';

const GEMINI_API_KEY = "gemini_api_key";

const Test = () => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  const aiServiceRef = useRef(null);
  const [currentMode, setCurrentMode] = useState('chat');
  const [isResponding, setIsResponding] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);
  const [messages, setMessages] = useState([]);
  const messageIdCounter = useRef(2);

  const scrollViewRef = useRef(null);

  const isDesktop = width >= 768;
  const messageContainerWidth = isDesktop ? '70%' : '100%';
  const messageBubbleWidth = isDesktop ? '70%' : '85%';

  const modes = {
    'pr-review': { placeholder: "Provide instructions & PR link...", status: "PR Review Mode Activated." },
    'documentation': { placeholder: "Provide instructions & project link...", status: "Documentation Mode Activated." },
    'web-browsing': { placeholder: "Ask a question to search...", status: "Web Browsing Mode Activated." },
  };

  const initializeAIService = (key) => {
    if (key) {
      aiServiceRef.current = createAIChatService(key);
      setApiKey(key);
    }
  };

  const saveApiKey = async (key) => {
    try {
      await AsyncStorage.setItem(GEMINI_API_KEY, key);
    } catch (error) {
      console.error("Failed to save API key", error);
    }
  };

  const loadApiKey = async () => {
    try {
      const storedApiKey = await AsyncStorage.getItem(GEMINI_API_KEY);
      if (storedApiKey) {
        initializeAIService(storedApiKey);
      } else {
        setShowApiKeyModal(true);
      }
    } catch (error) {
      console.error("Failed to load API key", error);
      setShowApiKeyModal(true);
    }
  };

  const handleApiKeySubmit = async () => {
    if (tempApiKey.trim()) {
      await saveApiKey(tempApiKey);
      initializeAIService(tempApiKey);
      setShowApiKeyModal(false);
      setTempApiKey("");
    } else {
      Alert.alert("Error", "Please enter a valid API key");
    }
  };

  useEffect(() => {
    loadApiKey();
  }, []);

  // Ultra-smooth scroll handling
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const isScrollingRef = useRef(false);

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    // If user scrolls up, set flag to prevent auto-scrolling
    if (!isAtBottom) {
      setUserScrolledUp(true);
    } else {
      setUserScrolledUp(false);
    }
  };

  useEffect(() => {
    // Clear any existing timeouts
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Only auto-scroll if:
    // 1. User hasn't scrolled up manually
    // 2. There are messages to display
    if (messages.length > 0 && !userScrolledUp) {
      // Check if this is a new message or content update
      const lastMessage = messages[messages.length - 1];
      const isNewMessage = lastMessageIdRef.current !== lastMessage.id;
      lastMessageIdRef.current = lastMessage.id;

      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        
        if (isNewMessage) {
          // For new messages, use smooth animation
          scrollTimeoutRef.current = setTimeout(() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
            isScrollingRef.current = false;
          }, 100);
        } else {
          // For streaming updates, use instant scroll without animation
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: false });
          }
          isScrollingRef.current = false;
        }
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, userScrolledUp]);

  const showStatusMessage = (message, type) => {
    if (type === 'error') {
      Alert.alert("Error", message);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      showStatusMessage("Copied to clipboard!", 'success');
    } catch (error) {
      console.error("Failed to copy text: ", error);
      showStatusMessage("Failed to copy to clipboard", 'error');
    }
  };

  const updateQueueUI = () => {
    // Not needed in React Native
  };

  const renderQueue = () => {
    // Not needed in React Native
  };

  const addMessage = (content, role, isStreaming = false) => {
    const newId = messageIdCounter.current++;
    const newMessage = {
      id: newId,
      role,
      content,
      isStreaming
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessageContent = (id, content, isStreaming = false) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, content, isStreaming } : msg
      )
    );
  };

  const processQueue = () => {
    if (isResponding || messageQueue.length === 0) return;
    const nextMessage = {...messageQueue[0]};
    setMessageQueue(prevQueue => prevQueue.slice(1));
    addMessage(nextMessage.text, 'user');
    getAiResponse(nextMessage.text);
  };

  const stopResponse = () => {
    if (!aiServiceRef.current) {
      showStatusMessage('Please enter your Gemini API key first.', 'error');
      return;
    }
    
    aiServiceRef.current.stopResponse();
    setIsResponding(false);
    
    setMessages(prev => {
      const lastAiMessage = [...prev].reverse().find(msg => msg.role === 'model' && msg.isStreaming);
      if (lastAiMessage) {
        return prev.map(msg => 
          msg.id === lastAiMessage.id ? { ...msg, isStreaming: false } : msg
        );
      }
      return prev;
    });
    
    processQueue();
  };

  const sendMessage = (messageData) => {
    if (!aiServiceRef.current) {
      showStatusMessage('Please enter your Gemini API key first.', 'error');
      return;
    }
    
    let messageText = '';
    let isPRReview = false;
    let prUrl = null;
    
    if (typeof messageData === 'string') {
      messageText = messageData;
    } else if (messageData.type === 'pr') {
      isPRReview = true;
      messageText = messageData.content;
      prUrl = messageData.url;
    } else {
      messageText = messageData.content || '';
    }

    if (!messageText) return;

    if (isResponding) {
      setMessageQueue(prevQueue => [...prevQueue, { text: messageText, isPRReview, prUrl }]);
      showStatusMessage("Message added to queue.", 'success');
    } else {
      if (currentMode === 'pr-review' && isPRReview && prUrl) {
        processPRReview(prUrl, messageText);
        return;
      } else if (currentMode === 'pr-review' && !prUrl) {
        showStatusMessage("Please enter a valid GitHub PR URL.", 'error');
        return;
      }
      
      addMessage(messageText, 'user');
      getAiResponse(messageText);
    }
  };

  const processPRReview = async (prUrl, instructions) => {
    if (!aiServiceRef.current) {
      showStatusMessage('Please enter your Gemini API key first.', 'error');
      return;
    }
    
    try {
      const loadingMessageId = addMessage("Fetching PR data...", 'user');
      
      const prInfo = extractPRInfo(prUrl);
      if (!prInfo) {
        updateMessageContent(loadingMessageId, "Invalid PR URL format. Please provide a valid GitHub PR URL.", false);
        showStatusMessage("Invalid PR URL format.", 'error');
        return;
      }
      
      const { owner, repo, prNumber } = prInfo;
      
      updateMessageContent(loadingMessageId, "Fetching PR data from GitHub...", false);
      const prData = await fetchPRData(owner, repo, prNumber);
      
      updateMessageContent(loadingMessageId, `Processing PR: ${prData.title}`, false);
      
      const prompt = generatePRReviewPrompt(prData);
      
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
      
      await getAiResponse(prompt, true);
    } catch (error) {
      console.error('Error processing PR review:', error);
      addMessage(`Failed to process PR review: ${error.message}`, 'model');
      showStatusMessage("Failed to process PR review.", 'error');
    }
  };

  const getAiResponse = async (userMessage, isPRReview = false) => {
    if (!aiServiceRef.current) {
      showStatusMessage('Please enter your Gemini API key first.', 'error');
      return;
    }
    
    setIsResponding(true);
    
    const aiMessageId = addMessage('', 'model', true);
    
    try {
      const onProgress = (partialResponse) => {
        updateMessageContent(aiMessageId, partialResponse, true);
      };
      
      const fullResponse = await aiServiceRef.current.getAIResponse(
        userMessage, 
        isPRReview ? 'pr-review' : currentMode,
        onProgress
      );
      
      updateMessageContent(aiMessageId, fullResponse, false);
    } catch (error) {
      console.error('Error:', error);
      updateMessageContent(aiMessageId, `Error: ${error.message}`, false);
    } finally {
      setIsResponding(false);
      processQueue();
    }
  };

  const setMode = (newMode) => {
    if (!aiServiceRef.current) {
      showStatusMessage('Please enter your Gemini API key first.', 'error');
      return;
    }
    
    const mappedMode = newMode === 'pr' ? 'pr-review' : newMode;
    const isTogglingOff = currentMode === mappedMode;
    const mode = isTogglingOff ? 'chat' : mappedMode;
    setCurrentMode(mode);

    if (mode !== currentMode) {
      aiServiceRef.current.resetChat();
    }
    
    if (!isTogglingOff && modes[mappedMode]) {
      showStatusMessage(modes[mappedMode].status, 'success');
    }
  };

  const renderMessage = (message, index) => {
    const isLastMessage = index === messages.length - 1;
    
    return (
      <MessageBubble
        key={message.id}
        message={message}
        theme={theme}
        isLastMessage={isLastMessage}
        messageBubbleWidth={messageBubbleWidth}
        copyToClipboard={copyToClipboard}
        isDesktop={isDesktop}
      />
    );
  };

  const ApiKeyModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showApiKeyModal}
      onRequestClose={() => {}}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <FontAwesome5 name="key" size={24} color="#3b82f6" style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Enter Gemini API Key
            </Text>
          </View>
          
          <Text style={[styles.modalDescription, { color: theme.secondaryText }]}>
            To use the AI features, please enter your Gemini API key. You can get one from the Google AI Studio.
          </Text>
          
          <TextInput
            style={[styles.apiKeyInput, { 
              backgroundColor: theme.mode === 'dark' ? '#374151' : '#f9fafb',
              color: theme.text,
              borderColor: theme.mode === 'dark' ? '#4b5563' : '#e5e7eb'
            }]}
            placeholder="Enter your Gemini API key"
            placeholderTextColor={theme.mode === 'dark' ? '#9ca3af' : '#9ca3af'}
            value={tempApiKey}
            onChangeText={setTempApiKey}
            secureTextEntry={true}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary, { 
                backgroundColor: theme.mode === 'dark' ? '#374151' : '#f3f4f6',
              }]}
              onPress={() => setShowApiKeyModal(false)}
            >
              <Text style={{ color: theme.text }}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handleApiKeySubmit}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ApiKeyModal />
      
      <View style={styles.mainContent}>
        <ScrollView
          ref={scrollViewRef}
          style={[styles.messageScrollView, { backgroundColor: theme.background }]}
          contentContainerStyle={[styles.messageContainer, { width: messageContainerWidth }]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <View style={[styles.welcomeContent, { 
                backgroundColor: theme.mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                width: isDesktop ? '70%' : '90%',
              }]}>
                <View style={styles.welcomeIconContainer}>
                  <View style={[styles.iconBackground, {
                    backgroundColor: theme.mode === 'dark' ? '#3b82f6' : '#3b82f6',
                  }]}>
                    <FontAwesome5 name="robot" size={24} color="white" />
                  </View>
                </View>
                
                <Text style={[styles.welcomeTitle, { color: theme.text }]}>
                  Welcome to PR Assistant!
                </Text>
                
                <Text style={[styles.welcomeDescription, { color: theme.secondaryText }]}>
                  I'm your AI coding companion, ready to help with:
                </Text>
                
                <View style={styles.featuresGrid}>
                  <View style={[styles.featureItem, { 
                    backgroundColor: theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                    borderColor: theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                  }]}>
                    <FontAwesome5 name="code" size={16} color="#3b82f6" style={styles.featureIcon} />
                    <Text style={[styles.featureText, { color: theme.text }]}>
                      Code reviews and suggestions
                    </Text>
                  </View>
                  
                  <View style={[styles.featureItem, { 
                    backgroundColor: theme.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)',
                    borderColor: theme.mode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                  }]}>
                    <FontAwesome5 name="file-code" size={16} color="#8b5cf6" style={styles.featureIcon} />
                    <Text style={[styles.featureText, { color: theme.text }]}>
                      PR analysis and feedback
                    </Text>
                  </View>
                  
                  <View style={[styles.featureItem, { 
                    backgroundColor: theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                    borderColor: theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                  }]}>
                    <FontAwesome5 name="book" size={16} color="#10b981" style={styles.featureIcon} />
                    <Text style={[styles.featureText, { color: theme.text }]}>
                      Documentation generation
                    </Text>
                  </View>
                  
                  <View style={[styles.featureItem, { 
                    backgroundColor: theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
                    borderColor: theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                  }]}>
                    <FontAwesome5 name="question-circle" size={16} color="#f59e0b" style={styles.featureIcon} />
                    <Text style={[styles.featureText, { color: theme.text }]}>
                      Technical question answering
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.welcomeFooter, { color: theme.secondaryText }]}>
                  Send me a message or try one of the special modes to get started!
                </Text>
              </View>
            </View>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
        </ScrollView>

        <View style={styles.chatInputContainer}>
          <ChatInterface 
            onSendMessage={sendMessage} 
            onModeChange={setMode}
            currentMode={currentMode === 'pr-review' ? 'pr-review' : currentMode}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',

  },
  messageScrollView: {
    flex: 1,
    width: '100%',
  },
  messageContainer: {
    padding: 16,
    paddingBottom: 100,
    alignItems: 'center',
    alignSelf:'center'
  },
  aiMessageContainer: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  aiMessageBubble: {
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  userMessageContainer: {
    marginBottom: 16,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '100%',
  },
  userMessageBubble: {
    padding: 16,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    borderWidth: 1,
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
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  welcomeContent: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  welcomeIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBackground: {
    padding: 16,
    borderRadius: 9999,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  featuresGrid: {
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
  },
  welcomeFooter: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  chatInputContainer: {
    paddingHorizontal: 1,
    paddingTop: 12,
    paddingBottom: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    maxWidth:550,
    marginHorizontal:'auto'
    
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  modalButtonSecondary: {
    // Styles are applied inline with theme
  },
  modalButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
});

export default Test;
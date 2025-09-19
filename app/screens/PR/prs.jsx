import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
import { extractPRInfo, fetchPRData, generatePRReviewPrompt, createAIChatService, fetchLatestCommitSHA, fetchCommitDiff, fetchCommitDetails, generateDocumentation, getAIReview } from '../../../backend/ai';
import { loadIdentities } from '../../../backend/appwrite';
import MessageBubble from '../../../componants/MessageBubble';
import * as Clipboard from 'expo-clipboard';
import ApiKeyModal from '../../../componants/modals/ApiKeyModal';
import DocumentationModal from '../../../componants/modals/DocumentationModal';
import { useAppwriteContext } from '../../../context/appwriteContext';

const GEMINI_API_KEY = "gemini_api_key";

const Test = () => {
  const { width } = useWindowDimensions();
  const { theme: originalTheme } = useTheme();
  const { apiKey, updateApiKey } = useAppwriteContext();
  
  // Memoize theme object to prevent unnecessary re-renders
  const theme = useMemo(() => originalTheme, [originalTheme.mode]);
  
  // Memoize isDesktop to prevent unnecessary re-renders
  const isDesktop = useMemo(() => width >= 768, [width]);
  
  // Memoize message container and bubble widths
  const messageContainerWidth = useMemo(() => isDesktop ? '70%' : '100%', [isDesktop]);
  const messageBubbleWidth = useMemo(() => isDesktop ? '70%' : '85%', [isDesktop]);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  const aiServiceRef = useRef(null);
  const [currentMode, setCurrentMode] = useState('chat');
  const [isResponding, setIsResponding] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);
  const [messages, setMessages] = useState([]);
  const messageIdCounter = useRef(2);
  
  // Documentation modal state
  const [showDocumentationModal, setShowDocumentationModal] = useState(false);
  const [repoLink, setRepoLink] = useState('');
  const [branchName, setBranchName] = useState('');

  const scrollViewRef = useRef(null);

  const modes = {
    'pr-review': { placeholder: "Provide instructions & PR link...", status: "PR Review Mode Activated." },
    'documentation': { placeholder: "Enter repo info (owner/repo@branch)...", status: "Documentation Mode Activated." },
    'web-browsing': { placeholder: "Ask a question to search...", status: "Web Browsing Mode Activated." },
  };

  const initializeAIService = (key) => {
    if (key) {
      aiServiceRef.current = createAIChatService(key);
    }
  };

  // Initialize AI service when API key changes
  useEffect(() => {
    if (apiKey) {
      initializeAIService(apiKey);
    }
  }, [apiKey]);

  const handleApiKeySubmit = async () => {
    if (tempApiKey.trim()) {
      await updateApiKey(tempApiKey);
      setShowApiKeyModal(false);
      setTempApiKey("");
    } else {
      Alert.alert("Error", "Please enter a valid API key");
    }
  };

  const handleApiKeyClose = () => {
    setShowApiKeyModal(false);
  };

  // Show API key modal on app start if no key is found
  useEffect(() => {
    if (!apiKey) {
      setShowApiKeyModal(true);
    }
  }, [apiKey]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false })
    }
  }

  // Ultra-smooth scroll handling
  const [userScrolledUp, setUserScrolledUp] = useState(false)
  const scrollTimeoutRef = useRef(null)
  const lastMessageIdRef = useRef(null)
  const isScrollingRef = useRef(false)
  const shouldAutoScrollRef = useRef(true)

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const paddingToBottom = 20
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
    
    // If user scrolls up, set flag to prevent auto-scrolling
    if (!isAtBottom) {
      shouldAutoScrollRef.current = false
    } else {
      shouldAutoScrollRef.current = true
    }
  }

  useEffect(() => {
    // Clear any existing timeouts
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Only auto-scroll if:
    // 1. User hasn't scrolled up manually
    // 2. There are messages to display
    if (messages.length > 0 && shouldAutoScrollRef.current) {
      // Check if this is a new message or content update
      const lastMessage = messages[messages.length - 1]
      const isNewMessage = lastMessageIdRef.current !== lastMessage.id
      lastMessageIdRef.current = lastMessage.id

      if (!isScrollingRef.current) {
        isScrollingRef.current = true
        
        if (isNewMessage) {
          // For new messages, scroll to bottom
          scrollTimeoutRef.current = setTimeout(() => {
            scrollToBottom()
            isScrollingRef.current = false
          }, 100)
        } else {
          // For streaming updates, scroll to bottom without animation
          scrollToBottom()
          isScrollingRef.current = false
        }
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [messages])

  const showStatusMessage = (message, type) => {
    if (type === 'error') {
      Alert.alert("Error", message);
    }
  };

  const copyToClipboard = useCallback(async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      showStatusMessage("Copied to clipboard!", 'success');
    } catch (error) {
      console.error("Failed to copy text: ", error);
      showStatusMessage("Failed to copy to clipboard", 'error');
    }
  }, [showStatusMessage]);

  const updateQueueUI = () => {
    // Not needed in React Native
  };

  const renderQueue = () => {
    // Not needed in React Native
  };

  const addMessage = useCallback((content, role, isStreaming = false) => {
    const newId = messageIdCounter.current++;
    const newMessage = {
      id: newId,
      role,
      content,
      isStreaming
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessageContent = useCallback((id, content, isStreaming = false) => {
    setMessages(prev => {
      // Find the message that needs to be updated
      const messageIndex = prev.findIndex(msg => msg.id === id);
      
      // If message not found, return previous state unchanged
      if (messageIndex === -1) return prev;
      
      // If the content and streaming status are the same, don't update
      if (prev[messageIndex].content === content && prev[messageIndex].isStreaming === isStreaming) {
        return prev;
      }
      
      // Create a new array with the updated message
      const newMessages = [...prev];
      newMessages[messageIndex] = { ...newMessages[messageIndex], content, isStreaming };
      
      return newMessages;
    });
  }, []);

  const processQueue = () => {
    if (isResponding || messageQueue.length === 0) return;
    const nextMessage = {...messageQueue[0]};
    setMessageQueue(prevQueue => prevQueue.slice(1));
    addMessage(nextMessage.text, 'user');
    getAiResponse(nextMessage.text);
  };

  const stopResponse = () => {
    if (!aiServiceRef.current) {
      // Show the API key modal instead of just an error message
      setShowApiKeyModal(true);
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
      // Show the API key modal instead of just an error message
      setShowApiKeyModal(true);
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

    // Universal PR link detection - works in any mode
    const prUrlRegex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
    const prMatch = messageText.match(prUrlRegex);
    if (prMatch && prMatch[0]) {
      // If a PR URL is detected, switch to PR review mode and process it
      setMode('pr-review');
      processPRReview(prMatch[0], messageText);
      return;
    }

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
      } else if (currentMode === 'documentation') {
        // Handle documentation mode
        processDocumentation(messageText);
        return;
      } else if (isPRReview && prUrl) {
        // If PR URL is provided but not in PR review mode, switch to PR review mode
        setMode('pr-review');
        processPRReview(prUrl, messageText);
        return;
      }
      
      addMessage(messageText, 'user');
      getAiResponse(messageText);
    }
  };

  const processPRReview = async (prUrl, instructions) => {
    if (!aiServiceRef.current) {
      // Show the API key modal instead of just an error message
      setShowApiKeyModal(true);
      return;
    }
    
    try {
      const prInfo = extractPRInfo(prUrl);
      if (!prInfo) {
        addMessage("Invalid PR URL format. Please provide a valid GitHub PR URL.", 'model');
        return;
      }
      
      const { owner, repo, prNumber } = prInfo;
      
      // Add the initial user message
      addMessage(`Review PR: ${owner}/${repo}#${prNumber}`, 'user');
      
      // Add a single loading message that we'll update throughout the process
      const loadingMessageId = addMessage("Fetching PR data from GitHub...", 'model');
      
      // Load GitHub token if needed
      await loadIdentities();
      
      // Check if we have a token after loading identities
      let currentToken = null;
      try {
        const appwriteModule = await import('../../../backend/appwrite');
        currentToken = appwriteModule.token;
      } catch (e) {
        console.log('Could not access token from appwrite module');
      }
      
      // Note: We don't fail if there's no token since public repos can be accessed without auth
      // But we'll use the token if available for private repos
      
      const prData = await fetchPRData(owner, repo, prNumber);
      updateMessageContent(loadingMessageId, `Processing PR: ${prData.title}`, false);
      
      const prompt = generatePRReviewPrompt(prData);
      
      // Generate PR review with the AI service using streaming
      updateMessageContent(loadingMessageId, "", true); // Set to streaming mode
      
      const review = await aiServiceRef.current.getAIResponse(prompt, 'pr-review', (partialResponse) => {
        updateMessageContent(loadingMessageId, partialResponse, true);
      });
      updateMessageContent(loadingMessageId, review, false); // Final content, not streaming
      
      // Add the review to the AI service chat history so it can be referenced in future messages
      if (aiServiceRef.current) {
        aiServiceRef.current.addMessageToHistory("user", `Review for PR: ${owner}/${repo}#${prNumber}`);
        aiServiceRef.current.addMessageToHistory("model", review);
      }
      
      // Keep PR review mode selected so user can continue asking questions about the review
      // The mode will only be deselected when user explicitly switches modes
    } catch (error) {
      console.error('Error processing PR review:', error);
      addMessage(`Failed to process PR review: ${error.message}`, 'model');
      showStatusMessage("Failed to process PR review.", 'error');
      // Even on error, keep the PR review mode selected so user can try again
    }
  };

  const processDocumentation = async (messageText) => {
    if (!aiServiceRef.current) {
      // Show the API key modal instead of just an error message
      setShowApiKeyModal(true);
      return;
    }
    
    try {
      // Extract repository information from the message
      // Handle both URL format and direct input
      let owner, repo, branch = 'main';
      
      if (messageText.includes('github.com')) {
        // Handle full GitHub URL
        const urlMatch = messageText.match(/github\.com\/([^\/]+)\/([^\/\s]+)(?:\/tree\/([^\/\s]+))?/);
        if (urlMatch) {
          owner = urlMatch[1];
          repo = urlMatch[2].replace(/\.git$/, ''); // Remove .git if present
          branch = urlMatch[3] || 'main';
        }
      } else if (messageText.includes('@')) {
        // Handle owner/repo@branch format
        const parts = messageText.split('@');
        branch = parts[1] || 'main';
        const repoParts = parts[0].split('/');
        owner = repoParts[0];
        repo = repoParts[1];
      } else {
        // Handle owner/repo format
        const repoParts = messageText.split('/');
        owner = repoParts[0];
        repo = repoParts[1];
      }
      
      if (!owner || !repo) {
        addMessage("Please provide valid repository information in the format: owner/repo or a GitHub URL", 'model');
        return;
      }
      
      // Add the initial user message
      addMessage(`Generate documentation for ${owner}/${repo}@${branch}`, 'user');
      
      // Add a single loading message that we'll update throughout the process
      const loadingMessageId = addMessage("Fetching latest commit...", 'model');
      
      // 1. Fetch branch information to get the latest commit SHA
      const latestCommitSha = await fetchLatestCommitSHA(owner, repo, branch);
      updateMessageContent(loadingMessageId, "Fetching commit diff...", false);

      // 2. Fetch the specific commit details with the full diff content
      const diffContent = await fetchCommitDiff(owner, repo, latestCommitSha);
      updateMessageContent(loadingMessageId, "Fetching commit details...", false);

      // 3. Fetch commit details to get the commit message
      const commitData = await fetchCommitDetails(owner, repo, latestCommitSha);
      const commitMessage = commitData.commit.message;
      updateMessageContent(loadingMessageId, "Generating documentation...", false);

      // 4. Generate AI prompt for documentation
      const prompt = `You are a world-class software developer, a documentation expert, and a senior code reviewer. Your task is to generate a comprehensive, professional, GitHub-level documentation for a pending Pull Request. The documentation should be clear, concise, and easy to understand for developers and project managers. The documentation must include a test plan, detailed Mermaid diagrams to explain workflows when applicable, and AI suggestions for improving the code.

                    CRITICAL REQUIREMENT: You MUST include a Mermaid diagram in the "Workflow Diagram" section to visually represent the workflow of the code changes. This is mandatory for any non-trivial changes. Use a 'graph TD' (top-down) or 'flowchart' diagram. Label all nodes and connections clearly. Include decision points, data flow, and key processing steps.

                    IMPORTANT MERMAID DIAGRAM FORMATTING RULES:
                    - Always use double quotes around node labels that contain special characters like parentheses, brackets, or quotes
                    - Example: A["Load Content Template: e.g., email-magic-url.tpl (now a partial)"]
                    - Escape special characters when needed with backslashes
                    - Keep diagrams simple and focused on the key workflow steps

                    Your markdown should follow this structure exactly:

                    ## 🚀 What does this PR do?

                    [A high-level summary of the purpose of this PR. Explain the problem it solves or the new feature it introduces.]

                    ## 🔍 Key Changes & Code Examples

                    [Provide a detailed, bulleted list of the main changes based on the diffs provided. For one of the key changes, include a code block that shows the relevant code snippet from the diffs. Explain what the code does.]

                    \`\`\`javascript
                    // Example code snippet
                    // Explain what this code does
                    \`\`\`

                    ---

                    ### 📊 AI Review & Rating

                    [Based on the analysis of the code changes, simulate a review and provide a score. Explain the rating, what passed and what failed, and if there are any immediate improvements needed.]
                    
                    * **Code Quality Rating:** [A numerical score out of 10, e.g., 9/10]
                    * **Test Coverage Rating:** [A numerical score out of 10, e.g., 7/10]
                    * **Review Summary:** [Provide a high-level summary. Mention what the code does well, and what could be improved.]
                    
                    ### 🧪 "Failed" Test Cases

                    [Based on your review, list specific, Codeforces-style test cases that would likely fail and explain why. This is a simulated failure report.]
                    
                    * **Test Case 1: [Name the test, e.g., 'Negative Input Handling']**
                        * **Input:** [Specific input data, e.g., 'A = -5, B = 10']
                        * **Expected Output:** [Expected correct result, e.g., 'An error message should be displayed.']
                        * **Actual (Simulated) Output:** [Simulated incorrect result, e.g., '-5 is treated as a valid number, resulting in a false-positive calculation.']
                    
                    * **Test Case 2: [Name the test, e.g., 'Empty String Input']**
                        * **Input:** [Specific input, e.g., ""]
                        * **Expected Output:** [Correct result, e.g., "The function should return an empty array."]
                        * **Actual (Simulated) Output:** [Simulated incorrect result, e.g., "The function throws a NullPointerException."]

                    ---

                    ## 🌊 Workflow Diagram

                    [Create a Mermaid flowchart or graph to visually represent the workflow of the code changes. This is mandatory for any non-trivial changes. Use a 'graph TD' (top-down) or 'flowchart' diagram. Label all nodes and connections clearly. Include decision points, data flow, and key processing steps.]

                    \`\`\`mermaid
                    graph TD;
                        A[Start] --> B["Initialize Components (with parentheses)"];
                        B --> C{Condition Check};
                        C -->|True| D[Process Path 1];
                        C -->|False| E[Process Path 2];
                        D --> F[Combine Results];
                        E --> F;
                        F --> G[Return Response];
                        G --> H[End];
                    \`\`\`

                    ## 📁 Files Changed

                    [List all the files that were modified, including the number of additions and deletions. This should be a direct, unedited list from the API data.]

                    Here is the commit data and the full file diff content to use:
                    Commit Message: ${commitMessage}
                    
                    ---
                    
                    Full Git Diff:
                    ${diffContent}
                    `;

      // Generate documentation with the AI service using streaming
      updateMessageContent(loadingMessageId, "", true); // Set to streaming mode
      
      const documentation = await generateDocumentation(prompt, apiKey);
      updateMessageContent(loadingMessageId, documentation, false); // Final content, not streaming
      
      // Add the documentation to the AI service chat history so it can be referenced in future messages
      if (aiServiceRef.current) {
        aiServiceRef.current.addMessageToHistory("user", `Generated documentation for ${owner}/${repo}@${branch}`);
        aiServiceRef.current.addMessageToHistory("model", documentation);
      }
      
      // Keep documentation mode selected so user can continue asking questions about the report
      // The mode will only be deselected when user explicitly switches modes
    } catch (error) {
      console.error('Error processing documentation:', error);
      addMessage(`Failed to generate documentation: ${error.message}`, 'model');
      showStatusMessage("Failed to generate documentation.", 'error');
      // Even on error, keep the documentation mode selected so user can try again
    }
  };

  const getAiResponse = async (userMessage, isPRReview = false, mode = null) => {
    if (!aiServiceRef.current) {
      // Show the API key modal instead of just an error message
      setShowApiKeyModal(true);
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
        isPRReview ? 'pr-review' : (mode || currentMode),
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
      // Show the API key modal instead of just an error message
      setShowApiKeyModal(true);
      return;
    }
    
    const mappedMode = newMode === 'pr' ? 'pr-review' : newMode;
    const isTogglingOff = currentMode === mappedMode;
    const mode = isTogglingOff ? 'chat' : mappedMode;
    setCurrentMode(mode);

    if (mode !== currentMode) {
      aiServiceRef.current.resetChat();
    }
    
    // Show documentation modal when documentation mode is activated
    if (!isTogglingOff && mode === 'documentation') {
      setShowDocumentationModal(true);
      setRepoLink('');
      setBranchName('');
    } else if (isTogglingOff && currentMode === 'documentation') {
      // Close modal when toggling off documentation mode
      setShowDocumentationModal(false);
    }
    
    // Handle PR review mode (no modal needed)
    if (!isTogglingOff && mode === 'pr-review') {
      showStatusMessage('PR Review Mode Activated. Paste a GitHub PR URL to review.', 'success');
    }
    
    if (!isTogglingOff && modes[mappedMode]) {
      showStatusMessage(modes[mappedMode].status, 'success');
    }
  };

  const renderMessage = useCallback((message, index) => {
    return (
      <MessageBubble
        key={message.id}
        message={message}
        theme={theme}
        messageBubbleWidth={messageBubbleWidth}
        copyToClipboard={copyToClipboard}
        isDesktop={isDesktop}
      />
    );
  }, [theme, messageBubbleWidth, copyToClipboard, isDesktop]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ApiKeyModal 
        visible={showApiKeyModal}
        onClose={handleApiKeyClose}
        onSubmit={handleApiKeySubmit}
        apiKey={tempApiKey}
        setApiKey={setTempApiKey}
      />
      <DocumentationModal
        visible={showDocumentationModal}
        onClose={() => {
          setShowDocumentationModal(false);
          // Don't automatically switch to chat mode - let user explicitly switch if needed
        }}
        onSubmit={(repoInfo) => {
          setShowDocumentationModal(false);
          processDocumentation(repoInfo);
        }}
        repoLink={repoLink}
        setRepoLink={setRepoLink}
        branchName={branchName}
        setBranchName={setBranchName}
      />
      
      <View style={styles.mainContent}>
        <ScrollView
          ref={scrollViewRef}
          style={[styles.messageScrollView, { backgroundColor: theme.background }]}
          contentContainerStyle={[styles.messageContainer, { width: messageContainerWidth }]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Show chat history even when there's no API key, but show API key prompt when there are no messages */}
          {messages.length === 0 && !apiKey ? (
            <View style={styles.welcomeContainer}>
              <View style={[styles.welcomeContent, { 
                backgroundColor: theme.mode === 'dark' ? 'hsl(210, 11%, 9%)' : 'hsl(0, 0%, 100%)',
                borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)',
                width: isDesktop ? '70%' : '90%',
                borderRadius: 12,
                borderWidth: 1,
                padding: 24,
              }]}>
                <Text style={[styles.welcomeTitle, { 
                  color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: 12,
                }]}>
                  API Key Required
                </Text>
                
                <Text style={[styles.welcomeDescription, { 
                  color: theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)',
                  fontSize: 16,
                  textAlign: 'center',
                  marginBottom: 20,
                  lineHeight: 22,
                }]}>
                  Please enter your Gemini API key to use the PR Assistant features.
                </Text>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary, { 
                    alignSelf: 'center',
                    minWidth: 120,
                  }]}
                  onPress={() => setShowApiKeyModal(true)}
                >
                  <Text style={{ 
                    color: '#ffffff', 
                    fontSize: 16, 
                    fontWeight: '500' 
                  }}>
                    Enter API Key
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <View style={[styles.welcomeContent, { 
                backgroundColor: theme.mode === 'dark' ? 'hsl(210, 11%, 9%)' : 'hsl(0, 0%, 100%)',
                borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)',
                width: isDesktop ? '70%' : '90%',
                borderRadius: 12,
                borderWidth: 1,
                padding: 24,
              }]}>
                <Text style={[styles.welcomeTitle, { 
                  color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: 12,
                }]}>
                  Welcome to PR Assistant!
                </Text>
                
                <Text style={[styles.welcomeDescription, { 
                  color: theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)',
                  fontSize: 16,
                  textAlign: 'center',
                  marginBottom: 20,
                  lineHeight: 22,
                }]}>
                  I'm your AI coding companion, ready to help with:
                </Text>
                
                <View style={[styles.featuresGrid, { gap: 12, marginBottom: 20 }]}>
                  <View style={[styles.featureItem, { 
                    backgroundColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.08)' : 'hsla(210, 11%, 15%, 0.08)',
                    borderColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.2)' : 'hsla(210, 11%, 15%, 0.2)',
                    borderRadius: 12,
                    borderWidth: 1,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }]}>
                    <Text style={[styles.featureText, { 
                      color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
                      flex: 1,
                      fontSize: 14,
                    }]}>
                      Code reviews and suggestions
                    </Text>
                  </View>
                  
                  <View style={[styles.featureItem, { 
                    backgroundColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.08)' : 'hsla(210, 11%, 15%, 0.08)',
                    borderColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.2)' : 'hsla(210, 11%, 15%, 0.2)',
                    borderRadius: 12,
                    borderWidth: 1,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }]}>
                    <Text style={[styles.featureText, { 
                      color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
                      flex: 1,
                      fontSize: 14,
                    }]}>
                      PR analysis and feedback
                    </Text>
                  </View>
                  
                  <View style={[styles.featureItem, { 
                    backgroundColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.08)' : 'hsla(210, 11%, 15%, 0.08)',
                    borderColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.2)' : 'hsla(210, 11%, 15%, 0.2)',
                    borderRadius: 12,
                    borderWidth: 1,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }]}>
                    <Text style={[styles.featureText, { 
                      color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
                      flex: 1,
                      fontSize: 14,
                    }]}>
                      Documentation generation
                    </Text>
                  </View>
                  
                  <View style={[styles.featureItem, { 
                    backgroundColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.08)' : 'hsla(210, 11%, 15%, 0.08)',
                    borderColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.2)' : 'hsla(210, 11%, 15%, 0.2)',
                    borderRadius: 12,
                    borderWidth: 1,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }]}>
                    <Text style={[styles.featureText, { 
                      color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
                      flex: 1,
                      fontSize: 14,
                    }]}>
                      Technical question answering
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.welcomeFooter, { 
                  color: theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)',
                  fontSize: 14,
                  textAlign: 'center',
                  lineHeight: 20,
                }]}>
                  Send me a message or try one of the special modes to get started!
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ width: '100%' }}>
              {messages.map((message, index) => renderMessage(message, index))}
              <View style={{ height: 40 }} />
            </View>
          )}
        </ScrollView>

        {/* Always show the ChatInterface, but disable it when there's no API key */}
        <View style={styles.chatInputContainer}>
          <ChatInterface 
            onSendMessage={sendMessage} 
            onModeChange={setMode}
            currentMode={currentMode === 'pr-review' ? 'pr-review' : currentMode}
            disabled={!apiKey}
            placeholder={apiKey ? "Type your message..." : "Enter API key to start chatting..."}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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
    padding: 2,
    paddingBottom: 80,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  aiMessageContainer: {
    marginBottom: 8,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    maxWidth: '100%',
    width: '100%',
  },
  userMessageContainer: {
    marginBottom: 8,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '100%',
    width: '100%',
  },
  aiMessageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    maxWidth: '100%',
  },
  userMessageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    maxWidth: '100%',
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
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
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
    paddingTop: 8,
    paddingBottom: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    maxWidth: 550,
    marginHorizontal: 'auto'
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
});

export default React.memo(Test);

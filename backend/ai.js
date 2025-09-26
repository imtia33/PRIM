import { githubApiCall } from './github';

// Function to extract GitHub PR information from a URL
export const extractPRInfo = (url) => {
  try {
    // Handle both full URLs and short URLs
    const fullUrl = url.startsWith('http') ? url : `https://github.com/${url}`;
    const prUrl = new URL(fullUrl);
    
    // Check if it's a GitHub URL
    if (prUrl.hostname !== 'github.com') {
      return null;
    }
    
    const pathParts = prUrl.pathname.split('/').filter(part => part);
    
    // Expected format: /{owner}/{repo}/pull/{prNumber}
    if (pathParts.length >= 4 && pathParts[2] === 'pull') {
      const owner = pathParts[0];
      const repo = pathParts[1];
      const prNumber = pathParts[3];
      
      // Validate that prNumber is actually a number
      if (isNaN(parseInt(prNumber))) {
        return null;
      }
      
      return { owner, repo, prNumber };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing PR URL:', error);
    return null;
  }
};

// Function to fetch PR data from GitHub
export const fetchPRData = async (owner, repo, prNumber) => {
  try {
    // Try to load GitHub token
    let token = null;
    try {
      // Dynamically import to avoid circular dependencies
      const appwriteModule = await import('./appwrite');
      const { loadIdentities } = appwriteModule;
      
      // If we don't have a token, try to load it
      if (!appwriteModule.token) {
        await loadIdentities();
        // Get the token again after loading
        token = appwriteModule.token;
      } else {
        token = appwriteModule.token;
      }
    } catch (e) {
      // If we can't load the token module, that's fine - we'll proceed without auth
      console.log('Could not load GitHub token, proceeding without authentication');
    }
    
    // Fetch PR details
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'PRIM-PR-Review-Tool'
    };
    
    // Add authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const prResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
      headers
    });
    
    if (!prResponse.ok) {
      const errorText = await prResponse.text();
      throw new Error(`GitHub API error: ${prResponse.status} - ${prResponse.statusText} - ${errorText}`);
    }
    
    const prData = await prResponse.json();
    
    // Fetch PR diff
    const diffHeaders = {
      'Accept': 'application/vnd.github.v3.diff',
      'User-Agent': 'PRIM-PR-Review-Tool'
    };
    
    // Add authorization header if token is available
    if (token) {
      diffHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const diffResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
      headers: diffHeaders
    });
    
    if (!diffResponse.ok) {
      const errorText = await diffResponse.text();
      throw new Error(`GitHub API error: ${diffResponse.status} - ${diffResponse.statusText} - ${errorText}`);
    }
    
    const diff = await diffResponse.text();
    
    return {
      title: prData.title,
      description: prData.body || "No description",
      author: prData.user?.login,
      diff,
    };
  } catch (error) {
    console.error('Error fetching PR data:', error);
    throw error;
  }
};

// Function to generate AI prompt for PR review
export const generatePRReviewPrompt = (prData, projectContext = "") => {
  return `
You are a senior engineer with 20+ years experience reviewing PRs.  
The author is experienced — skip basics, summaries, or politeness.  

Instructions:
- Be **direct, concise, and surgical**. Every comment should matter.
- If you have suggestions, keep them to the point and constructive. And provide code in markdown with the suggestion of why your way is better .
- If you have a new working method that will do the same for PR and will significantly increase efficiency, give the suggestive code.
- Your review should be mainly checking for human errors, bugs, and security issues.
- Documentation Clarity is not where you nitpick about. 
- When suggesting workflow improvements or explaining complex processes.
- be short conscise, no one has time to read a big review. they might get bored out and skip the review at all.

## Project Context
${projectContext || "(no extra context provided)"}

---

## Pull Request
PR Title: ${prData.title}  
Author: ${prData.author}  
Description: ${prData.description}

### PR Diff
\`\`\`diff
${prData.diff}
\`\`\`

Respond as if leaving **inline GitHub comments** in Markdown. Be short, precise, and constructive.
`.trim();
};

/**
 * Fetches the latest commit SHA for a given branch
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 * @returns {Promise<string>} - Latest commit SHA
 */
export const fetchLatestCommitSHA = async (owner, repo, branch) => {
  // Try to load GitHub token
  let token = null;
  try {
    // Dynamically import to avoid circular dependencies
    const appwriteModule = await import('./appwrite');
    const { loadIdentities } = appwriteModule;
    
    // If we don't have a token, try to load it
    if (!appwriteModule.token) {
      await loadIdentities();
      // Get the token again after loading
      token = appwriteModule.token;
    } else {
      token = appwriteModule.token;
    }
  } catch (e) {
    // If we can't load the token module, that's fine - we'll proceed without auth
    console.log('Could not load GitHub token, proceeding without authentication');
  }
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'PRIM-Documentation-Tool'
  };
  
  // Add authorization header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
    headers
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.commit.sha;
};

/**
 * Fetches the diff content for a specific commit
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} commitSHA - Commit SHA
 * @returns {Promise<string>} - Diff content
 */
export const fetchCommitDiff = async (owner, repo, commitSHA) => {
  // Try to load GitHub token
  let token = null;
  try {
    // Dynamically import to avoid circular dependencies
    const appwriteModule = await import('./appwrite');
    const { loadIdentities } = appwriteModule;
    
    // If we don't have a token, try to load it
    if (!appwriteModule.token) {
      await loadIdentities();
      // Get the token again after loading
      token = appwriteModule.token;
    } else {
      token = appwriteModule.token;
    }
  } catch (e) {
    // If we can't load the token module, that's fine - we'll proceed without auth
    console.log('Could not load GitHub token, proceeding without authentication');
  }
  
  const headers = {
    'Accept': 'application/vnd.github.v3.diff',
    'User-Agent': 'PRIM-Documentation-Tool'
  };
  
  // Add authorization header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${commitSHA}`, {
    headers
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
  }
  
  return await response.text();
};

/**
 * Fetches commit details including message
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} commitSHA - Commit SHA
 * @returns {Promise<Object>} - Commit details
 */
export const fetchCommitDetails = async (owner, repo, commitSHA) => {
  // Try to load GitHub token
  let token = null;
  try {
    // Dynamically import to avoid circular dependencies
    const appwriteModule = await import('./appwrite');
    const { loadIdentities } = appwriteModule;
    
    // If we don't have a token, try to load it
    if (!appwriteModule.token) {
      await loadIdentities();
      // Get the token again after loading
      token = appwriteModule.token;
    } else {
      token = appwriteModule.token;
    }
  } catch (e) {
    // If we can't load the token module, that's fine - we'll proceed without auth
    console.log('Could not load GitHub token, proceeding without authentication');
  }
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'PRIM-Documentation-Tool'
  };
  
  // Add authorization header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${commitSHA}`, {
    headers
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
  }
  
  return await response.json();
};

/**
 * Generates documentation using AI service
 * @param {string} prompt - AI prompt
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<string>} - Generated documentation
 */
export const generateDocumentation = async (prompt, apiKey) => {
  if (!apiKey) {
    throw new Error("API key is required");
  }
  
  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    tools: [{ "google_search": {} }],
  };
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} - ${response.statusText}`);
  }
  
  const result = await response.json();
  return result?.candidates?.[0]?.content?.parts?.[0]?.text || null;
};

// AI Chat Service
class AIChatService {
  constructor(apiKey) {
    // Validate that API key is provided
    if (!apiKey) {
      throw new Error('API key is required to initialize AI service');
    }
    
    this.apiKey = apiKey;
    this.chatHistory = [
      {
        role: "model",
        parts: [{ text: "Hello! I'm here to help. Feel free to ask me anything. You can also switch modes to get help with code review, documentation, or even browse the web." }]
      }
    ];
    this.isResponding = false;
    this.isStopped = false;
    this.typingInterval = null;
    this.abortController = null;
  }

  // Reset chat history
  resetChat() {
    this.chatHistory = [
      {
        role: "model",
        parts: [{ text: "Hello! I'm here to help. Feel free to ask me anything. You can also switch modes to get help with code review, documentation, or even browse the web." }]
      }
    ];
  }

  // Add message to chat history
  addMessageToHistory(role, text) {
    this.chatHistory.push({
      role,
      parts: [{ text }]
    });
  }

  // Get current chat history
  getChatHistory() {
    return [...this.chatHistory];
  }

  // Clear chat history
  clearChatHistory() {
    this.chatHistory = [];
  }

  // Function to get AI response
  async getAIResponse(userMessage, mode = 'chat', onProgress = null) {
    this.isResponding = true;
    this.isStopped = false;
    
    // Create a new AbortController for this request
    this.abortController = new AbortController();
    
    // Add user message to history
    this.addMessageToHistory("user", userMessage);
    
    const model = 'gemini-2.5-flash-preview-05-20';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;
    
    let systemPrompt;
    let useTools = false;
    
    switch (mode) {
      case 'pr-review':
        systemPrompt = "You are an AI specializing in code review. Your responses should be helpful and polite, focused on best practices, potential bugs, and style improvements. Always respond with proper markdown formatting for code snippets and text. Do not provide sections to copy - provide direct markdown that can be rendered immediately. Format your response with clear headings, bullet points, and code blocks where appropriate.";
        useTools = true;
        break;
      case 'documentation':
        systemPrompt = "You are a professional technical writer and software documentation expert. You have just generated comprehensive documentation for a GitHub repository. Your goal is to help users understand, modify, and improve this documentation. Always reference the documentation content when answering questions. Provide clear, concise responses using proper markdown formatting. Do not provide sections to copy - provide direct markdown with appropriate headings, lists, code blocks, and other markdown elements.";
        useTools = true;
        break;
      case 'web-browsing':
        systemPrompt = "You are an AI assistant who can browse the web to answer user questions. Always use the search tool to find the most current and relevant information. Provide your response in proper markdown format that can be rendered immediately. Do not provide sections to copy - provide direct markdown with headings, lists, links, and other appropriate elements. Keep responses concise and well-formatted.";
        useTools = true;
        break;
      default:
        systemPrompt = "You are a friendly and helpful AI assistant. Your responses should be conversational and informative. Always format your responses using proper markdown that can be rendered immediately. Do not provide sections to copy - provide direct markdown with appropriate formatting for text, code, lists, and other elements.";
        break;
    }
    
    const payload = {
      contents: this.chatHistory,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    };
    
    if (useTools) {
      payload.tools = [{ "google_search": {} }];
    }
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: this.abortController.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        if (this.isStopped) {
          break;
        }
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(6);
              const data = JSON.parse(jsonStr);
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              
              if (text.length > 0) {
                fullResponse += text;
                // Call progress callback if provided
                if (onProgress) {
                  onProgress(fullResponse);
                }
              }
            } catch (e) {
              // Ignore incomplete JSON
            }
          }
        }
      }
      
      // Add AI response to history
      if (!this.isStopped && fullResponse) {
        this.addMessageToHistory("model", fullResponse);
      }
      
      return fullResponse;
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, which is expected behavior
        return fullResponse; // Return partial response if any
      }
      console.error('Error getting AI response:', error);
      throw error;
    } finally {
      this.isResponding = false;
      this.abortController = null;
    }
  }
  
  // Function to stop the current response
  stopResponse() {
    this.isStopped = true;
    if (this.abortController) {
      this.abortController.abort();
    }
  }
  
  // Function to process PR review
  async processPRReview(prUrl, instructions) {
    try {
      // Extract PR info from URL
      const prInfo = extractPRInfo(prUrl);
      if (!prInfo) {
        throw new Error("Invalid PR URL format. Please provide a valid GitHub PR URL.");
      }
      
      const { owner, repo, prNumber } = prInfo;
      
      // Fetch PR data
      const prData = await fetchPRData(owner, repo, prNumber);
      
      // Generate AI prompt
      const prompt = generatePRReviewPrompt(prData);
      
      return prompt;
    } catch (error) {
      console.error('Error processing PR review:', error);
      throw error;
    }
  }
}

// Export a factory function to create AI chat service instances
export const createAIChatService = (apiKey) => {
  // Validate that API key is provided
  if (!apiKey) {
    throw new Error('API key is required to create AI service');
  }
  
  return new AIChatService(apiKey);
};

// Function to send PR data to AI for review (keeping existing function for backward compatibility)
export const getAIReview = async (prData, apiKey) => {
  // Validate that API key is provided
  if (!apiKey) {
    throw new Error('API key is required for AI review');
  }
  
  try {
    const prompt = generatePRReviewPrompt(prData);
    
    const model = 'gemini-2.5-flash-preview-05-20';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      systemInstruction: { 
        parts: [{ 
          text: "You are a senior software engineer reviewing GitHub pull requests. Provide concise, actionable feedback." 
        }] 
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.substring(6);
            const data = JSON.parse(jsonStr);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            fullResponse += text;
          } catch (e) {
            // Ignore incomplete JSON
          }
        }
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('Error getting AI review:', error);
    throw error;
  }
};

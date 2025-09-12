/**
 * Utility functions for API calls
 */

/**
 * Fetches the latest commit SHA for a given branch
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 * @returns {Promise<string>} - Latest commit SHA
 */
export const fetchLatestCommitSHA = async (owner, repo, branch) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`);
  
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
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${commitSHA}`, {
    headers: {
      'Accept': 'application/vnd.github.v3.diff'
    }
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
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${commitSHA}`);
  
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
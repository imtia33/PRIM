import { token } from './appwrite';

let cachedUserData = null;
let cachedEtag = null;
let inFlightPromise = null;

// Rate limit cache
let cachedRateLimitData = null;
let cachedRateLimitEtag = null;
let rateLimitInFlightPromise = null;

// Global API usage tracker reference
let apiUsageTracker = null;

// Function to set the API usage tracker
export const setApiUsageTracker = (tracker) => {
  apiUsageTracker = tracker;
};

// Function to check if token is valid
export const isTokenValid = () => {
  return token && token.length > 0;
};

// Wrapper function for GitHub API calls that tracks usage
export const githubApiCall = async (endpoint, options = {}) => {
  if (!token) {
    return null;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DevPortal-App',
    ...options.headers,
  };

  try {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers,
    });

    // Track API usage if tracker is available
    if (apiUsageTracker && response.ok) {
      apiUsageTracker(1); // Increment by 1 for each successful API call
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error making GitHub API call:', error);
    throw error;
  }
};

export async function fetchAndLogGithubUser(options = {}) {
  const { forceRefresh = false } = options;

  if (!token) {
    return null;
  }

  // Serve from cache for the entire app session unless forced
  if (cachedUserData && !forceRefresh) {
    return cachedUserData;
  }

  // Deduplicate concurrent requests
  if (inFlightPromise) {
    try {
      return await inFlightPromise;
    } catch {
      // fall through to attempt a new request
    }
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DevPortal-App',
  };

  // Use conditional request if we have an ETag and not forcing refresh
  if (cachedEtag && !forceRefresh) {
    headers['If-None-Match'] = cachedEtag;
  }

  const request = (async () => {
    try {
      const response = await fetch('https://api.github.com/user', { headers });

      // Track API usage if tracker is available
      if (apiUsageTracker && response.ok) {
        apiUsageTracker(1);
      }

      // If nothing changed, update freshness and return cached
      if (response.status === 304 && cachedUserData) {
        return cachedUserData;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const userData = await response.json();
      cachedUserData = userData;
      const etag = response.headers && response.headers.get ? response.headers.get('ETag') : null;
      if (etag) {
        cachedEtag = etag;
      }
      return userData;
    } catch (error) {
      // On error, prefer returning stale cache to reduce impact
      if (cachedUserData) {
        return cachedUserData;
      }
      console.error('Error fetching GitHub user info:', error);
      throw error;
    } finally {
      inFlightPromise = null;
    }
  })();

  inFlightPromise = request;
  return request;
}

export async function fetchGitHubRateLimit(options = {}) {
  const { forceRefresh = false } = options;

  if (!token) {
    return null;
  }

  // Serve from cache for the entire app session unless forced
  if (cachedRateLimitData && !forceRefresh) {
    return cachedRateLimitData;
  }

  // Deduplicate concurrent requests
  if (rateLimitInFlightPromise) {
    try {
      return await rateLimitInFlightPromise;
    } catch {
      // fall through to attempt a new request
    }
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DevPortal-App',
  };

  // Use conditional request if we have an ETag and not forcing refresh
  if (cachedRateLimitEtag && !forceRefresh) {
    headers['If-None-Match'] = cachedRateLimitEtag;
  }

  const request = (async () => {
    try {
      const response = await fetch('https://api.github.com/rate_limit', { headers });

      // Track API usage if tracker is available
      if (apiUsageTracker && response.ok) {
        apiUsageTracker(1);
      }

      // If nothing changed, update freshness and return cached
      if (response.status === 304 && cachedRateLimitData) {
        return cachedRateLimitData;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const rateLimitData = await response.json();
      cachedRateLimitData = rateLimitData;
      const etag = response.headers && response.headers.get ? response.headers.get('ETag') : null;
      if (etag) {
        cachedRateLimitEtag = etag;
      }
      return rateLimitData;
    } catch (error) {
      // On error, prefer returning stale cache to reduce impact
      if (cachedRateLimitData) {
        return cachedRateLimitData;
      }
      console.error('Error fetching GitHub rate limit:', error);
      throw error;
    } finally {
      rateLimitInFlightPromise = null;
    }
  })();

  rateLimitInFlightPromise = request;
  return request;
}

// Function to fetch PR data from GitHub
export const fetchPRData = async (owner, repo, prNumber) => {
  try {
    // Fetch PR details (without token for public repos)
    const prResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PR-Review-Tool',
        // Add authorization header if token is available
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!prResponse.ok) {
      throw new Error(`GitHub API error: ${prResponse.status} - ${prResponse.statusText}`);
    }
    
    const prData = await prResponse.json();
    
    // Fetch PR diff
    const diffResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
      headers: {
        'Accept': 'application/vnd.github.v3.diff',
        'User-Agent': 'PR-Review-Tool',
        // Add authorization header if token is available
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!diffResponse.ok) {
      throw new Error(`GitHub API error: ${diffResponse.status} - ${diffResponse.statusText}`);
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

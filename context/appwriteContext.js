import React, { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser, loadIdentities, refreshToken, token } from "../backend/appwrite";
import { fetchAndLogGithubUser, fetchGitHubRateLimit, setApiUsageTracker } from "../backend/github";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppwriteContext = createContext();
export const useAppwriteContext = () => useContext(AppwriteContext);

const GEMINI_API_KEY = "gemini_api_key";

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGithubLinked, setIsGithubLinked] = useState(false);
  const [gitAccToken, setGitAccToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [gitUserInfo, setGitUserInfo] = useState(null);
  const [gitRateLimit, setGitRateLimit] = useState(null);
  
  // Global API key state
  const [apiKey, setApiKey] = useState(null);
  
  // Global API usage tracker
  const [apiUsageCount, setApiUsageCount] = useState(0);
  const [lastApiCall, setLastApiCall] = useState(null);
  
  // Showcase cache for efficient navigation
  const [showcaseCache, setShowcaseCache] = useState(new Map());

  // Load API key on app start
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const storedApiKey = await AsyncStorage.getItem(GEMINI_API_KEY);
        if (storedApiKey) {
          setApiKey(storedApiKey);
        }
      } catch (error) {
        console.error("Failed to load API key", error);
      }
    };
    
    loadApiKey();
  }, []);

  // Function to update API key globally
  const updateApiKey = async (newApiKey) => {
    try {
      if (newApiKey) {
        await AsyncStorage.setItem(GEMINI_API_KEY, newApiKey);
        setApiKey(newApiKey);
      } else {
        await AsyncStorage.removeItem(GEMINI_API_KEY);
        setApiKey(null);
      }
    } catch (error) {
      console.error("Failed to update API key", error);
    }
  };

  // Function to increment API usage count
  const incrementApiUsage = (count = 1) => {
    setApiUsageCount(prev => prev + count);
    setLastApiCall(new Date());
  };

  // Set up the API usage tracker for the GitHub backend
  useEffect(() => {
    setApiUsageTracker(incrementApiUsage);
  }, []);

  // Automatic cache cleanup every 10 minutes
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanupOldCache();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  // Function to reset API usage count
  const resetApiUsage = () => {
    setApiUsageCount(0);
    setLastApiCall(null);
  };

  // Function to get current API usage (combines GitHub data with local tracking)
  const getCurrentApiUsage = () => {
    if (!gitRateLimit?.resources?.core) return { used: 0, remaining: 0, limit: 5000 };
    
    const baseUsed = gitRateLimit.resources.core.used || 0;
    const localUsed = apiUsageCount;
    
    return {
      used: baseUsed + localUsed,
      remaining: Math.max(0, (gitRateLimit.resources.core.limit || 5000) - (baseUsed + localUsed)),
      limit: gitRateLimit.resources.core.limit || 5000
    };
  };

  // Showcase cache functions
  const getCachedShowcase = (id) => {
    if (!id) return null;
    return showcaseCache.get(id) || null;
  };

  const setCachedShowcase = (id, data) => {
    if (!id || !data) return;
    setShowcaseCache(prev => new Map(prev.set(id, {
      data,
      timestamp: Date.now()
    })));
  };

  const clearShowcaseCache = () => {
    setShowcaseCache(new Map());
  };

  const isCacheValid = (id, maxAge = 5 * 60 * 1000) => { // 5 minutes default
    const cached = showcaseCache.get(id);
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < maxAge;
  };

  const cleanupOldCache = (maxAge = 30 * 60 * 1000) => { // 30 minutes default
    const now = Date.now();
    const newCache = new Map();
    showcaseCache.forEach((value, key) => {
      if ((now - value.timestamp) < maxAge) {
        newCache.set(key, value);
      }
    });
    setShowcaseCache(newCache);
  };

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });

    loadIdentities()
      .then((res) => {
        
        if (res) {
          setIsGithubLinked(true);
          setGitAccToken(res.providerAccessToken);
          if (res.providerAccessTokenExpiry) {
            const expiryDate = new Date(res.providerAccessTokenExpiry);
            expiryDate.setHours(expiryDate.getHours() + 8);
            setTokenExpiry(expiryDate.toISOString());
          } else {
            setTokenExpiry(null);
          }
        } else {
          
          setIsGithubLinked(false);
          setGitAccToken(null);
          setTokenExpiry(null);
        }
      })
      .catch((error) => {
        console.log(error);
        // On error, assume no GitHub connection
        setIsGithubLinked(false);
        setGitAccToken(null);
        setTokenExpiry(null);
      });
    
    // Only fetch GitHub user info and rate limit if we have a token
    loadIdentities()
      .then((identity) => {
        if (identity && identity.providerAccessToken) {
          // Fetch both user info and rate limit in parallel
          return Promise.all([
            fetchAndLogGithubUser(),
            fetchGitHubRateLimit()
          ]);
        }
        return [null, null];
      })
      .then(([userInfo, rateLimit]) => {
        if (userInfo) {
          setGitUserInfo(userInfo);
        } else {
          setGitUserInfo(null);
        }
        if (rateLimit) {
          setGitRateLimit(rateLimit);
          // Reset local API usage when we get fresh data from GitHub
          resetApiUsage();
        } else {
          setGitRateLimit(null);
        }
      })
      .catch((error) => {
        console.log(error);
        setGitUserInfo(null);
        setGitRateLimit(null);
      });
  }, []);

  // Monitor login state changes and automatically load GitHub profile
  useEffect(() => {
    if (isLogged && user && !loading) {
      // Check if we don't have GitHub profile data but user is logged in
      if (!gitUserInfo || !isGithubLinked) {
        // Add a small delay to ensure the authentication has settled
        const checkGitHubProfile = setTimeout(() => {
          loadGithubProfile();
        }, 1000);
        
        return () => clearTimeout(checkGitHubProfile);
      }
    }
  }, [isLogged, user, loading, gitUserInfo, isGithubLinked]);

  const refreshGithubToken = async () => {
    try {
      const identity = await refreshToken();
      if (identity) {
        setIsGithubLinked(true);
        setGitAccToken(identity.providerAccessToken);
        
        if (identity.providerAccessTokenExpiry) {
          const expiryDate = new Date(identity.providerAccessTokenExpiry);
          expiryDate.setHours(expiryDate.getHours() + 8);
          setTokenExpiry(expiryDate.toISOString());
        } else {
          setTokenExpiry(null);
        }
        
        // Fetch updated GitHub user info and rate limit
        const [userInfo, rateLimit] = await Promise.all([
          fetchAndLogGithubUser({ forceRefresh: true }),
          fetchGitHubRateLimit({ forceRefresh: true })
        ]);
        setGitUserInfo(userInfo);
        setGitRateLimit(rateLimit);
        
        // Reset local API usage when refreshing
        resetApiUsage();
        
        return true;
      } else {
        setIsGithubLinked(false);
        setGitAccToken(null);
        setTokenExpiry(null);
        setGitUserInfo(null);
        setGitRateLimit(null);
        resetApiUsage();
        return false;
      }
    } catch (error) {
      console.log('Error refreshing GitHub token:', error);
      return false;
    }
  };

  // Function to load GitHub profile data (for use after login)
  const loadGithubProfile = async () => {
    try {
      const identity = await loadIdentities();
      if (identity) {
        setIsGithubLinked(true);
        setGitAccToken(identity.providerAccessToken);
        
        if (identity.providerAccessTokenExpiry) {
          const expiryDate = new Date(identity.providerAccessTokenExpiry);
          expiryDate.setHours(expiryDate.getHours() + 8);
          setTokenExpiry(expiryDate.toISOString());
        } else {
          setTokenExpiry(null);
        }
        
        // Fetch GitHub user info and rate limit in parallel
        const [userInfo, rateLimit] = await Promise.all([
          fetchAndLogGithubUser({ forceRefresh: true }),
          fetchGitHubRateLimit({ forceRefresh: true })
        ]);
        
        if (userInfo) {
          setGitUserInfo(userInfo);
        }
        if (rateLimit) {
          setGitRateLimit(rateLimit);
          resetApiUsage();
        }
        
        return true;
      } else {
        setIsGithubLinked(false);
        setGitAccToken(null);
        setTokenExpiry(null);
        setGitUserInfo(null);
        setGitRateLimit(null);
        return false;
      }
    } catch (error) {
      console.log('Error loading GitHub profile:', error);
      return false;
    }
  };

  return (
    <AppwriteContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        isGithubLinked,
        setIsGithubLinked,
        gitAccToken,
        setGitAccToken,
        tokenExpiry,
        gitUserInfo,
        setGitUserInfo,
        gitRateLimit,
        setGitRateLimit,
        apiUsageCount,
        incrementApiUsage,
        resetApiUsage,
        getCurrentApiUsage,
        refreshGithubToken,
        loadGithubProfile,
        // API Key functions
        apiKey,
        updateApiKey,
        // Showcase cache functions
        getCachedShowcase,
        setCachedShowcase,
        clearShowcaseCache,
        isCacheValid,
        cleanupOldCache
      }}
    >
      {children}
    </AppwriteContext.Provider>
  );
};

export default GlobalProvider;
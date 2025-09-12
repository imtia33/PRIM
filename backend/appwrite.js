import {Client, Databases, Query,Account,Storage,Functions,ID,OAuthProvider,Avatars,Permission,Role} from 'react-native-appwrite';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import AsyncStorage from "@react-native-async-storage/async-storage";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('684ac8600032f6eccf56')

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);
const functions = new Functions(client);
const avatars = new Avatars(client);

// Export database instance and constants
export { databases };
export const DATABASE_ID = "6853a0910036fa92b87b"; // Updated database ID

export async function getAccount() {
  try {
    const acc = await account.get();
    
    return acc;
  } catch (error) {
    return null;
  }
}
export let token = null;

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) return null;

    return currentAccount;
  } catch (error) {
    
    return null;
  }
}



export const login = async () => {
  try {
    
    const deepLink = Linking.createURL('/');
    const scheme = `${deepLink.protocol}//`;

    const loginUrl =  account.createOAuth2Token(
      OAuthProvider.Github,
      Platform.OS==='web'?`${deepLink}/oauth-redirect`:`${deepLink}`,
      Platform.OS==='web'?`${deepLink}/oauth-redirect`:`${deepLink}`,
     ['repo','user']
     
    );

     
      window.location.href = loginUrl;
    
  } catch (e) {
    
  }
}


export async function handleOAuthRedirect() {
  if (Platform.OS === 'web') {
    // Web: get params from window.location
    const params = new URLSearchParams(window.location.search);
    const secret = params.get('secret');
    const userId = params.get('userId');

    if (secret && userId) {
      try {
        await account.createSession(userId, secret);
        
        window.history.replaceState({}, document.title, window.location.pathname);
        
        return await getAccount();
      } catch (e) {
        console.error('Failed to create session:', e);
        return null;
      }
    }
    return null;
  } else {
    const url = await Linking.getInitialURL();
    if (url) {
      const parsed = Linking.parse(url);
      
      const secret = parsed.queryParams?.secret;
      const userId = parsed.queryParams?.userId;

      if (secret && userId) {
        try {
          await account.createSession(userId, secret);
          return await getAccount();
        } catch (e) {
          console.error('Failed to create session:', e);
          return null;
        }
      }
    }
    return null;
  }
}
export const logout=async()=>{
  try {
    await account.deleteSession('current');
    // Clear the Gemini API key from AsyncStorage when logging out
    try {
      await AsyncStorage.removeItem('gemini_api_key');
    } catch (error) {
      console.error('Failed to clear API key on logout:', error);
    }
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
}

// User Profile Update Methods
export const updateUserName = async (name) => {
  try {
    const result = await account.updateName(name);
    return result;
  } catch (error) {
    console.error('Error updating user name:', error);
    throw new Error(`Name update failed: ${error.message}`);
  }
};

export const updateUserEmail = async (email, password) => {
  try {
    const result = await account.updateEmail(email, password);
    return result;
  } catch (error) {
    console.error('Error updating user email:', error);
    throw new Error(`Email update failed: ${error.message}`);
  }
};

export const updateUserPreferences = async (prefs) => {
  try {
    const result = await account.updatePrefs(prefs);
    return result;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error(`Preferences update failed: ${error.message}`);
  }
};

export async function getAvatar(name) {
  const avatarUrl = await avatars.getInitials(name);
  return avatarUrl;
  
}

export const EmailPassLogin = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    
    if (session) {
      
      return session;
    }
  } catch (error) {
    console.error('Error during email/password login:', error);
    throw new Error(`Login failed: ${error.message}`);
  }
}
export const EmailPassCreateAccount = async (name, email, password) => {

  try{
    const res = await account.create(ID.unique(), email, password, name);
    return res
  }
  catch (error) {
    console.error('Error during email/password account creation:', error);
    throw new Error(`Account creation failed: ${error.message}`);
  }
}

// Password Recovery Functions
export const createPasswordRecovery = async (email) => {
  try {
    // For web, use the current domain as redirect URL
    // For mobile, use a deep link that can be handled by the app
    let redirectUrl;
    
    if (Platform.OS === 'web') {
      // Use current domain for web
      redirectUrl = `${window.location.origin}/password-reset`;
    } else {
      // Use deep link for mobile apps
      const deepLink = new URL(makeRedirectUri());
      redirectUrl = `${deepLink}password-reset`;
    }
    
    const response = await account.createRecovery(email, redirectUrl);
    
    return response;
  } catch (error) {
    console.error('Error creating password recovery:', error);
    throw new Error(`Password recovery failed: ${error.message}`);
  }
}

export const confirmPasswordRecovery = async (userId, secret, newPassword) => {
  try {
    const response = await account.updateRecovery(userId, secret, newPassword);
    
    return response;
  } catch (error) {
    console.error('Error confirming password recovery:', error);
    throw new Error(`Password recovery confirmation failed: ${error.message}`);
  }
}

export const handlePasswordResetRedirect = async () => {
  try {
    if (Platform.OS === 'web') {
      // Web: get params from window.location
      const params = new URLSearchParams(window.location.search);
      const secret = params.get('secret');
      const userId = params.get('userId');
      
      if (secret && userId) {
        // Clean up the URL by removing query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        return { userId, secret };
      }
    } else {
      // Mobile: check for deep link
      const url = await Linking.getInitialURL();
      if (url) {
        const parsed = Linking.parse(url);
        const secret = parsed.queryParams?.secret;
        const userId = parsed.queryParams?.userId;
        
        if (secret && userId) {
          return { userId, secret };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error handling password reset redirect:', error);
    return null;
  }
}

export const loadIdentities = async () => {
  try {
    const result = await account.listIdentities([]);
    
    const githubIdentity = result.identities.find(identity => identity.provider === 'github');
    if (githubIdentity) {
      token = githubIdentity.providerAccessToken;
      return githubIdentity;
    }
    
    
    return null;
  } catch (error) {
    
    // Return null on error
    return null;
  }
};

export const refreshToken = async () => {
  try {
    const identity = await loadIdentities();
    return identity;
  } catch (error) {
    
    return null;
  }
};
export const startGithubLinking = async (scopes) => {
  try {
    
    
    const deepLink = new URL(makeRedirectUri());
    const scheme = `${deepLink.protocol}//`; 
    
    const loginUrl =  account.createOAuth2Token(
      OAuthProvider.Github,
      `${deepLink}`,
      `${deepLink}`,
      scopes
    );

    
    
  } catch (e) {
    
  }
};


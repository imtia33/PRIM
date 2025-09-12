import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { handleOAuthRedirect } from '../backend/appwrite';
import { useAppwriteContext } from '../context/appwriteContext';
import { useTheme } from '../context/ColorMode';

export default function OAuthRedirect() {
  const { theme } = useTheme();
  const { 
    setUser, 
    setIsLogged, 
    loadGithubProfile
  } = useAppwriteContext();
  const [loginFailed, setLoginFailed] = useState(false);

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await handleOAuthRedirect();
        if (res) {
          setUser(res);
          setIsLogged(true);
          
          // Load GitHub profile data after successful login
          await loadGithubProfile();
          
          router.replace('/screens');
        } else {
          setLoginFailed(true);
        }
      } catch (error) {
        console.error('OAuth redirect error:', error);
        setLoginFailed(true);
      }
    };
    createSession();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      {!loginFailed ? (
        <>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.text, { color: theme.text }]}>Signing you in...</Text>
        </>
      ) : (
        <Text style={[styles.errorText, { color: '#FF4C4C' }]}>
          Login failed. Please try again.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
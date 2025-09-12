import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { useAppwriteContext } from '../context/appwriteContext'
import { useTheme } from '../context/ColorMode'

const index = () => {
  const { isLogged, loading, user } = useAppwriteContext()
  const { theme } = useTheme()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Wait for authentication context to initialize
    if (!loading) {
      const timer = setTimeout(() => {
        if (isLogged && user) {
          // User is authenticated, redirect to screens
          router.replace('/screens')
        } else {
          // User is not authenticated, redirect to intro
          router.replace('/intro')
        }
        setIsChecking(false)
      }, 1000) // Small delay for smooth transition

      return () => clearTimeout(timer)
    }
  }, [isLogged, loading, user])

  // Show loading screen while checking authentication
  if (loading || isChecking) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContent}>
          {/* App Logo/Brand */}
          <View style={[styles.logoContainer, { backgroundColor: `${theme.accent}20` }]}>
            <Text style={[styles.logoText, { color: theme.accent }]}>A</Text>
          </View>
          
          <Text style={[styles.appName, { color: theme.text }]}>PRIM</Text>
          <Text style={[styles.tagline, { color: theme.secondaryText }]}>Your Development Workspace</Text>
          
          {/* Loading indicator */}
          <View style={styles.loadingIndicator}>
            <ActivityIndicator 
              size="large" 
              color={theme.accent}
            />
            <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
              Checking authentication...
            </Text>
          </View>
        </View>
      </View>
    )
  }

  // This should not be reached due to redirects, but included for safety
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.errorText, { color: theme.text }]}>Redirecting...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'hsl(210, 11%, 7%)', // --background
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'hsla(165, 96%, 71%, 0.2)', // --primary with opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'hsla(165, 96%, 71%, 0.3)',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'hsl(165, 96%, 71%)', // --primary
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: 'hsl(160, 14%, 93%)', // --foreground
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'hsla(160, 14%, 93%, 0.7)', // --muted-foreground
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
  },
  loadingIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: 'hsla(160, 14%, 93%, 0.7)', // --muted-foreground
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'hsl(160, 14%, 93%)', // --foreground
    textAlign: 'center',
  },
})

export default index
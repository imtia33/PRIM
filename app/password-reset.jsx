"use client"
import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from "../context/ColorMode"
import { useRouter } from "expo-router"
import { confirmPasswordRecovery, handlePasswordResetRedirect } from "../backend/appwrite"

export default function PasswordReset() {
  const { theme } = useTheme()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resetData, setResetData] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    // Check for password reset parameters when component mounts
    const checkResetParams = async () => {
      const data = await handlePasswordResetRedirect()
      if (data) {
        setResetData(data)
      } else {
        // No valid reset parameters, redirect to login
        Alert.alert("Invalid Reset Link", "This password reset link is invalid or has expired.")
        router.replace("/log-in")
      }
    }

    checkResetParams()
  }, [])

  const handlePasswordReset = async () => {
    if (!resetData) {
      setErrorMessage("Reset data not found")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      await confirmPasswordRecovery(resetData.userId, resetData.secret, newPassword)
      
      Alert.alert(
        "Success", 
        "Your password has been reset successfully. You can now log in with your new password.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/log-in")
          }
        ]
      )
    } catch (error) {
      setErrorMessage(error.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  if (!resetData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Enter your new password below
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.firstTabBackground,
                borderColor: theme.borderColor,
                color: theme.text
              }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={theme.secondaryText}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.firstTabBackground,
                borderColor: theme.borderColor,
                color: theme.text
              }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={theme.secondaryText}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.resetButton,
              { backgroundColor: theme.accent2 },
              isLoading && styles.disabledButton
            ]}
            onPress={handlePasswordReset}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: theme.secondaryText }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  errorContainer: {
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    borderColor: "rgba(244, 63, 94, 0.35)",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  errorText: {
    color: "#ef4444",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  resetButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  backButton: {
    alignItems: "center",
    padding: 16,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
})

"use client"
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from "react-native"
import { useTheme } from "../context/ColorMode"
import { createPasswordRecovery } from "../backend/appwrite"

export default function ForgotPasswordModal({ visible, onClose }) {
  const { theme } = useTheme()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      await createPasswordRecovery(email.trim())
      setSuccessMessage("Password recovery email sent! Check your inbox for further instructions.")
      
      // Clear form and close modal after a delay
      setTimeout(() => {
        setEmail("")
        setSuccessMessage("")
        onClose()
      }, 3000)
      
    } catch (error) {
      setErrorMessage(error.message || "Failed to send recovery email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setErrorMessage("")
    setSuccessMessage("")
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Forgot Password?</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.firstTabBackground,
                  borderColor: theme.borderColor,
                  color: theme.text
                }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.secondaryText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.accent2 },
                isLoading && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? "Sending..." : "Send Recovery Email"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={[styles.cancelButtonText, { color: theme.secondaryText }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    borderColor: "rgba(244, 63, 94, 0.35)",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#ef4444",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderColor: "rgba(34, 197, 94, 0.35)",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  successText: {
    color: "#22c55e",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    fontSize: 14,
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
  submitButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    alignItems: "center",
    padding: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
})

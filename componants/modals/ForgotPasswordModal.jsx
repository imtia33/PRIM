import { useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from "react-native"
import { Mail, X } from 'lucide-react-native'
import { useTheme } from "../../context/ColorMode"
import { createPasswordRecovery } from "../../backend/appwrite"

export default function ForgotPasswordModal({ visible, onClose }) {
  const { theme } = useTheme();
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

  if (!visible) return null

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1} />
        
        <View style={[styles.modalContent, { 
          backgroundColor: theme.mode === 'dark' ? 'hsl(210, 11%, 9%)' : 'hsl(0, 0%, 100%)',
          borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)'
        }]}>
          <View style={styles.modalHeader}>
            <View style={[styles.iconContainer, { 
              backgroundColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.1)' : 'hsla(210, 11%, 15%, 0.1)',
              borderColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.2)' : 'hsla(210, 11%, 15%, 0.2)'
            }]}>
              <Mail size={20} color={theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(210, 11%, 15%)'} />
            </View>
            
            <View style={styles.headerText}>
              <Text style={[styles.modalTitle, { 
                color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)'
              }]}>
                Forgot Password?
              </Text>
              <Text style={[styles.modalDescription, { 
                color: theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'
              }]}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={16} color={theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            {errorMessage ? (
              <View style={[styles.messageContainer, styles.errorContainer, { 
                backgroundColor: theme.mode === 'dark' ? 'hsla(0, 84%, 60%, 0.1)' : 'hsla(0, 84%, 60%, 0.1)',
                borderColor: theme.mode === 'dark' ? 'hsla(0, 84%, 60%, 0.3)' : 'hsla(0, 84%, 60%, 0.3)'
              }]}>
                <Text style={[styles.messageText, styles.errorText, { 
                  color: theme.mode === 'dark' ? 'hsl(0, 84%, 60%)' : 'hsl(0, 84%, 60%)'
                }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={[styles.messageContainer, styles.successContainer, { 
                backgroundColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.1)' : 'hsla(165, 96%, 71%, 0.1)',
                borderColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.3)' : 'hsla(165, 96%, 71%, 0.3)'
              }]}>
                <Text style={[styles.messageText, styles.successText, { 
                  color: theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(165, 96%, 71%)'
                }]}>
                  {successMessage}
                </Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { 
                color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)'
              }]}>
                Email Address
              </Text>
              
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.mode === 'dark' ? 'hsl(210, 11%, 11%)' : 'hsl(0, 0%, 98%)',
                    color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
                    borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)'
                  }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, { 
                  backgroundColor: theme.mode === 'dark' ? 'transparent' : 'transparent',
                  borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)'
                }]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={[styles.cancelButtonText, { 
                  color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)'
                }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.submitButton, { 
                  backgroundColor: isLoading 
                    ? (theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)')
                    : (theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(210, 11%, 15%)'),
                  borderColor: 'transparent'
                }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator 
                      size="small" 
                      color={theme.mode === 'dark' ? 'hsl(210, 11%, 7%)' : 'hsl(210, 11%, 93%)'} 
                      style={styles.buttonSpinner} 
                    />
                    <Text style={[styles.submitButtonText, { 
                      color: theme.mode === 'dark' ? 'hsl(210, 11%, 7%)' : 'hsl(210, 11%, 93%)'
                    }]}>Sending...</Text>
                  </>
                ) : (
                  <Text style={[styles.submitButtonText, { 
                    color: isLoading 
                      ? (theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 71%)')
                      : (theme.mode === 'dark' ? 'hsl(210, 11%, 7%)' : 'hsl(0, 0%, 100%)')
                  }]}>Send Recovery Email</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'hsla(210, 11%, 7%, 0.8)',
    backdropFilter: 'blur(8px)',
  },
  modalContent: {
    position: 'relative',
    width: '100%',
    maxWidth: 448,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    margin: 0,
  },
  modalDescription: {
    fontSize: 14,
    margin: 0,
    marginTop: 4,
  },
  closeButton: {
    height: 32,
    width: 32,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    margin: 0,
  },
  errorContainer: {
    backgroundColor: 'hsla(0, 84%, 60%, 0.1)',
    borderColor: 'hsla(0, 84%, 60%, 0.3)',
  },
  errorText: {
    color: 'hsl(0, 84%, 60%)',
  },
  successContainer: {
    backgroundColor: 'hsla(165, 96%, 71%, 0.1)',
    borderColor: 'hsla(165, 96%, 71%, 0.3)',
  },
  successText: {
    color: 'hsl(165, 96%, 71%)',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    display: 'block',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 8,
    outline: 'none',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 0,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonSpinner: {
    marginRight: 8,
  },
  submitButtonText: {
    textAlign: 'center',
  },
})
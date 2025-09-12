import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Linking, ActivityIndicator } from 'react-native';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle, X } from 'lucide-react-native';
import { useTheme } from '../../context/ColorMode';

const ApiKeyModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  apiKey, 
  setApiKey,
  title = "API Key",
  description = "Enter your API key to continue",
  provider = "Gemini"
}) => {
  const { theme } = useTheme();
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState("idle"); // "idle" | "valid" | "invalid"

  useEffect(() => {
    if (visible) {
      setApiKey("");
      setValidationStatus("idle");
    }
  }, [visible]);

  const validateApiKey = (key) => {
    if (!key) return "idle";
    // For Gemini API keys, they typically have a specific format
    // This is a simple validation - you might want to adjust based on actual API key format
    return key.length >= 30 ? "valid" : "invalid";
  };

  const handleKeyChange = (value) => {
    setApiKey(value);
    setValidationStatus(validateApiKey(value));
  };

  const openApiKeyLink = () => {
    Linking.openURL('https://aistudio.google.com/apikey');
  };

  const handleSubmit = async () => {
    if (validationStatus !== "valid") return;

    setIsValidating(true);
    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsValidating(false);

    onSubmit();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
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
              <KeyRound size={20} color={theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(210, 11%, 15%)'} />
            </View>
            
            <View style={styles.headerText}>
              <Text style={[styles.modalTitle, { 
                color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)'
              }]}>
                {title}
              </Text>
              <Text style={[styles.modalDescription, { 
                color: theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'
              }]}>
                {description}
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
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { 
                color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)'
              }]}>
                {provider} API Key
              </Text>
              
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.apiKeyInput, 
                    validationStatus === "invalid" && styles.invalidInput,
                    {
                      backgroundColor: theme.mode === 'dark' ? 'hsl(210, 11%, 11%)' : 'hsl(0, 0%, 98%)',
                      color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
                      borderColor: validationStatus === "invalid" 
                        ? 'hsl(0, 84%, 60%)' 
                        : (theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)')
                    }
                  ]}
                  placeholder="Enter your API key"
                  placeholderTextColor={theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'}
                  value={apiKey}
                  onChangeText={handleKeyChange}
                  secureTextEntry={!showKey}
                />
                
                <View style={styles.inputIcons}>
                  {validationStatus === "valid" && (
                    <CheckCircle 
                      size={16} 
                      color={theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(165, 96%, 71%)'} 
                    />
                  )}
                  {validationStatus === "invalid" && (
                    <AlertCircle 
                      size={16} 
                      color={theme.mode === 'dark' ? 'hsl(0, 84%, 60%)' : 'hsl(0, 84%, 60%)'} 
                    />
                  )}
                  
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff 
                        size={16} 
                        color={theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'} 
                      />
                    ) : (
                      <Eye 
                        size={16} 
                        color={theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'} 
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              {validationStatus === "invalid" && (
                <Text style={[styles.errorMessage, { 
                  color: theme.mode === 'dark' ? 'hsl(0, 84%, 60%)' : 'hsl(0, 84%, 60%)'
                }]}>
                  API key must be at least 30 characters
                </Text>
              )}
              
              <View style={styles.apiKeyInfoRow}>
                <TouchableOpacity 
                  style={[styles.apiKeyLink, { 
                    backgroundColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.1)' : 'hsla(210, 11%, 15%, 0.1)',
                    borderColor: theme.mode === 'dark' ? 'hsla(165, 96%, 71%, 0.2)' : 'hsla(210, 11%, 15%, 0.2)'
                  }]}
                  onPress={openApiKeyLink}
                >
                  <Text style={[styles.apiKeyLinkText, { 
                    color: theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(210, 11%, 15%)'
                  }]}>
                    Get Key →
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.apiKeyInfo}>
                  <Text style={[styles.apiKeyInfoText, { 
                    color: theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'
                  }]}>
                    We keep your API key secure and never store it on our servers.
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, { 
                  backgroundColor: theme.mode === 'dark' ? 'transparent' : 'transparent',
                  borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)'
                }]}
                onPress={onClose}
              >
                <Text style={[styles.cancelButtonText, { 
                  color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)'
                }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.submitButton, { 
                  backgroundColor: validationStatus === "valid" && !isValidating 
                    ? (theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(210, 11%, 15%)')
                    : (theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)'),
                  borderColor: 'transparent'
                }]}
                onPress={handleSubmit}
                disabled={validationStatus !== "valid" || isValidating}
              >
                {isValidating ? (
                  <>
                    <ActivityIndicator 
                      size="small" 
                      color={theme.mode === 'dark' ? 'hsl(210, 11%, 7%)' : 'hsl(210, 11%, 93%)'} 
                      style={styles.buttonSpinner} 
                    />
                    <Text style={[styles.submitButtonText, { 
                      color: theme.mode === 'dark' ? 'hsl(210, 11%, 7%)' : 'hsl(210, 11%, 93%)'
                    }]}>Connecting...</Text>
                  </>
                ) : (
                  <Text style={[styles.submitButtonText, { 
                    color: validationStatus === "valid" && !isValidating 
                      ? (theme.mode === 'dark' ? 'hsl(210, 11%, 7%)' : 'hsl(0, 0%, 100%)')
                      : (theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 71%)')
                  }]}>Connect</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
  apiKeyInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderRadius: 8,
    outline: 'none',
  },
  inputIcons: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eyeButton: {
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
  errorMessage: {
    fontSize: 12,
    margin: 0,
    marginTop: 8,
  },
  apiKeyInfoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  apiKeyLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  apiKeyLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  apiKeyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  apiKeyInfoText: {
    fontSize: 12,
    lineHeight: 16,
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
  invalidInput: {
    borderColor: '#ef4444',
  },
});

export default ApiKeyModal;
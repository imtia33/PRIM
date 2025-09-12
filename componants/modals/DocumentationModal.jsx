import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { FileText, X } from 'lucide-react-native';
import { useTheme } from '../../context/ColorMode';

const DocumentationModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  repoLink, 
  setRepoLink, 
  branchName, 
  setBranchName 
}) => {
  const { theme } = useTheme();
  
  const handleSubmit = () => {
    if (!repoLink.trim()) {
      Alert.alert('Error', 'Please enter a repository link or owner/repo format');
      return;
    }

    // Parse the repository information
    let owner, repo, branch = branchName || 'main';
    
    if (repoLink.includes('github.com')) {
      // Handle full GitHub URL
      const urlMatch = repoLink.match(/github\.com\/([^\/]+)\/([^\/\s]+)(?:\/tree\/([^\/\s]+))?/);
      if (urlMatch) {
        owner = urlMatch[1];
        repo = urlMatch[2].replace(/\.git$/, ''); // Remove .git if present
        branch = urlMatch[3] || branchName || 'main';
      }
    } else if (repoLink.includes('@')) {
      // Handle owner/repo@branch format
      const parts = repoLink.split('@');
      branch = parts[1] || branchName || 'main';
      const repoParts = parts[0].split('/');
      owner = repoParts[0];
      repo = repoParts[1];
    } else {
      // Handle owner/repo format
      const repoParts = repoLink.split('/');
      owner = repoParts[0];
      repo = repoParts[1];
    }
    
    if (!owner || !repo) {
      Alert.alert('Error', 'Please provide valid repository information in the format: owner/repo or a GitHub URL');
      return;
    }
    
    // Submit the parsed information
    onSubmit(`${owner}/${repo}@${branch}`);
    
    // Close the modal but keep documentation mode active
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
              <FileText size={20} color={theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(210, 11%, 15%)'} />
            </View>
            
            <View style={styles.headerText}>
              <Text style={[styles.modalTitle, { 
                color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)'
              }]}>
                Generate Documentation
              </Text>
              <Text style={[styles.modalDescription, { 
                color: theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'
              }]}>
                Enter repository information to generate documentation
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
                Repository
              </Text>
              
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.mode === 'dark' ? 'hsl(210, 11%, 11%)' : 'hsl(0, 0%, 98%)',
                    color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
                    borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)'
                  }]}
                  placeholder="e.g., https://github.com/appwrite/appwrite or appwrite/appwrite"
                  placeholderTextColor={theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'}
                  value={repoLink}
                  onChangeText={setRepoLink}
                />
              </View>
              
              <Text style={[styles.inputHelp, { 
                color: theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'
              }]}>
                Enter a GitHub URL or owner/repo format
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { 
                color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)'
              }]}>
                Branch (optional)
              </Text>
              
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.mode === 'dark' ? 'hsl(210, 11%, 11%)' : 'hsl(0, 0%, 98%)',
                    color: theme.mode === 'dark' ? 'hsl(160, 14%, 93%)' : 'hsl(210, 11%, 15%)',
                    borderColor: theme.mode === 'dark' ? 'hsl(210, 11%, 15%)' : 'hsl(210, 11%, 90%)'
                  }]}
                  placeholder="e.g., main, master, feature/new-feature"
                  placeholderTextColor={theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'}
                  value={branchName}
                  onChangeText={setBranchName}
                />
              </View>
              
              <Text style={[styles.inputHelp, { 
                color: theme.mode === 'dark' ? 'hsl(210, 11%, 71%)' : 'hsl(210, 11%, 50%)'
              }]}>
                Defaults to 'main' if not specified
              </Text>
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
                  backgroundColor: theme.mode === 'dark' ? 'hsl(165, 96%, 71%)' : 'hsl(210, 11%, 15%)',
                  borderColor: 'transparent'
                }]}
                onPress={handleSubmit}
              >
                <Text style={[styles.submitButtonText, { 
                  color: theme.mode === 'dark' ? 'hsl(210, 11%, 7%)' : 'hsl(0, 0%, 100%)'
                }]}>Generate</Text>
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
  inputHelp: {
    fontSize: 12,
    marginTop: 4,
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
  submitButtonText: {
    textAlign: 'center',
  },
});

export default DocumentationModal;
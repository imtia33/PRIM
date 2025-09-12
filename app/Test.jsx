import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import ApiKeyModal from '../componants/modals/ApiKeyModal'
import DocumentationModal from '../componants/modals/DocumentationModal'
import ForgotPasswordModal from '../componants/modals/ForgotPasswordModal'
import { useTheme } from '../context/ColorMode'

const Test = () => {
  const { theme } = useTheme()
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [showDocumentationModal, setShowDocumentationModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [repoLink, setRepoLink] = useState('')
  const [branchName, setBranchName] = useState('')

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Modal Test Page</Text>
      
      {/* Button to open API Key Modal */}
      <View style={styles.buttonContainer}>
        <Text 
          style={[styles.button, { backgroundColor: theme.accent }]} 
          onPress={() => setShowApiKeyModal(true)}
        >
          Open API Key Modal
        </Text>
      </View>
      
      {/* Button to open Documentation Modal */}
      <View style={styles.buttonContainer}>
        <Text 
          style={[styles.button, { backgroundColor: theme.accent }]} 
          onPress={() => setShowDocumentationModal(true)}
        >
          Open Documentation Modal
        </Text>
      </View>
      
      {/* Button to open Forgot Password Modal */}
      <View style={styles.buttonContainer}>
        <Text 
          style={[styles.button, { backgroundColor: theme.accent }]} 
          onPress={() => setShowForgotPasswordModal(true)}
        >
          Open Forgot Password Modal
        </Text>
      </View>
      
      {/* Modals */}
      <ApiKeyModal
        visible={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSubmit={() => setShowApiKeyModal(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
      
      <DocumentationModal
        visible={showDocumentationModal}
        onClose={() => setShowDocumentationModal(false)}
        onSubmit={() => setShowDocumentationModal(false)}
        repoLink={repoLink}
        setRepoLink={setRepoLink}
        branchName={branchName}
        setBranchName={setBranchName}
      />
      
      <ForgotPasswordModal
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default Test
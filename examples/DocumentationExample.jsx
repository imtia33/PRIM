import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MarkdownText from '../componants/markdown/MarkdownText.web';
import { useTheme } from '../context/ColorMode';
import { fetchLatestCommitSHA, fetchCommitDiff, fetchCommitDetails } from '../backend/ai';

const DocumentationExample = () => {
  const { theme } = useTheme();
  
  const exampleDocumentation = `
# PR Documentation Example

## 🚀 What does this PR do?

This PR introduces a new authentication system using OAuth 2.0 to improve security and user experience. It replaces the old token-based authentication with a more secure and standardized approach.

## 🔍 Key Changes & Code Examples

- Implemented OAuth 2.0 authentication flow
- Added new \`AuthService\` class to handle authentication logic
- Updated user model to include OAuth provider information
- Modified login controller to support multiple authentication providers

\`\`\`javascript
class AuthService {
  async authenticate(provider, token) {
    // Validate token with provider
    const userData = await this.validateToken(provider, token);
    
    // Find or create user
    const user = await this.findOrCreateUser(userData);
    
    // Generate session
    return this.generateSession(user);
  }
  
  async validateToken(provider, token) {
    // Implementation varies by provider
    switch(provider) {
      case 'github':
        return await this.validateGitHubToken(token);
      case 'google':
        return await this.validateGoogleToken(token);
      default:
        throw new Error('Unsupported provider');
    }
  }
}
\`\`\`

---

### 📊 AI Review & Rating

* **Code Quality Rating:** 8/10
* **Test Coverage Rating:** 7/10
* **Review Summary:** The implementation is solid and follows security best practices. Consider adding more comprehensive error handling for edge cases and implementing rate limiting for authentication requests.

### 🧪 "Failed" Test Cases

* **Test Case 1: Expired Token**
    * **Input:** OAuth token that has expired
    * **Expected Output:** Appropriate error message and redirect to login
    * **Actual (Simulated) Output:** Token validation fails but error handling is generic

* **Test Case 2: Invalid Provider**
    * **Input:** Unsupported OAuth provider
    * **Expected Output:** Error indicating unsupported provider
    * **Actual (Simulated) Output:** Application throws unhandled exception

---

## 🌊 Workflow Diagram

\`\`\`mermaid
graph TD
    A[User Clicks Login] --> B[Redirect to OAuth Provider]
    B --> C{User Authenticates?}
    C -->|Yes| D[Receive Auth Code]
    D --> E[Exchange for Token]
    E --> F[Validate Token]
    F --> G[Create/Update User]
    G --> H[Generate Session]
    H --> I[Redirect to App]
    C -->|No| J[Show Error]
\`\`\`

## 📁 Files Changed

- src/services/AuthService.js (+120, -0)
- src/models/User.js (+15, -2)
- src/controllers/AuthController.js (+50, -0)
- src/routes/auth.js (+25, -10)
`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Documentation Example</Text>
      <View style={[styles.documentationContainer, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
        <MarkdownText markdown={exampleDocumentation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  documentationContainer: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
});

export default DocumentationExample;
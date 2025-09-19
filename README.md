# PRIM: Pull.Refactor Inspect.Merge

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.22-000020?logo=expo)](https://expo.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Powered-8E7CC3?logo=google)](https://ai.google.dev/)
[![GitHub API](https://img.shields.io/badge/GitHub%20API-v3-181717?logo=github)](https://docs.github.com/en/rest)

**PRIM** (Pull.Refactor Inspect.Merge) is a cutting-edge development tool that revolutionizes how developers approach code reviews and documentation. By leveraging the power of Large Language Models (LLMs) and seamless GitHub integration, PRIM transforms the traditional PR workflow into an intelligent, automated, and educational experience.

## 🌟 Why PRIM?

Traditional code reviews are time-consuming, subjective, and often miss critical issues. PRIM addresses these challenges by providing:

- **AI-Powered Code Reviews**: Get intelligent, actionable feedback on your pull requests
- **Automated Documentation Generation**: Create professional documentation with workflow diagrams automatically
- **Educational GitHub Workflow Learning**: Understand best practices as you work
- **Cross-Platform Compatibility**: Works seamlessly on web and mobile devices

## 🚀 Key Features

### 🤖 AI-Powered Code Reviews
PRIM analyzes your pull requests using advanced LLMs to provide comprehensive code reviews that go beyond simple syntax checking:

- **Deep Code Analysis**: Identifies potential bugs, security vulnerabilities, and performance issues
- **Best Practices Recommendations**: Ensures your code follows industry standards
- **Actionable Suggestions**: Provides specific, implementable improvements
- **Style Guide Compliance**: Checks adherence to coding standards

### 📚 Automated Documentation Generation
Transform your PRs into professional documentation with a single click:

- **Comprehensive PR Documentation**: Generates detailed documentation for any pull request
- **Workflow Visualization**: Creates Mermaid diagrams to visualize complex workflows
- **Test Case Simulation**: Simulates potential failing test cases to improve code quality
- **Code Quality Rating**: Provides numerical ratings for code and test coverage

### 🔗 Seamless GitHub Integration
PRIM integrates directly with GitHub for a frictionless experience:

- **Direct PR URL Processing**: Simply paste any GitHub PR URL to get started
- **Secure Authentication**: GitHub OAuth integration for secure access to private repositories
- **Real-time Data Fetching**: Retrieves the latest PR data and diffs directly from GitHub
- **Commit Analysis**: Analyzes commit messages and changes for deeper insights

### 🎨 Beautiful UI/UX
Experience a modern, responsive interface designed for developers:

- **Dark/Light Mode**: Switch between themes based on your preference
- **Responsive Design**: Works flawlessly on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clean, organized interface that gets out of your way
- **Real-time Preview**: See documentation and reviews as they're generated

### 🛠 Advanced Developer Tools
PRIM includes powerful features that enhance your development workflow:

- **Markdown Rendering**: Beautifully formatted documentation with syntax highlighting
- **One-Click Copy**: Copy generated documentation to clipboard instantly
- **Streaming Responses**: See AI responses in real-time as they're generated
- **Mode Switching**: Toggle between chat, PR review, and documentation modes

## 🏗️ Architecture & Technology Stack

PRIM is built with modern technologies to ensure performance, scalability, and maintainability:

### Frontend
- **React Native (Expo)**: Cross-platform mobile and web application
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Navigation**: Intuitive tab-based navigation system
- **Lucide Icons**: Beautiful, consistent iconography

### Backend & AI
- **Gemini AI API**: Powered by Google's advanced language models
- **GitHub API v3**: Direct integration with GitHub's REST API
- **Appwrite**: Backend-as-a-Service for authentication and data management
- **Mermaid.js**: Automatic diagram generation for workflow visualization

### Development Tools
- **Expo Router**: File-based routing system
- **AsyncStorage**: Secure local data storage
- **React Native Clipboard**: One-click copy functionality
- **React Native SVG**: Vector graphics support

## 📖 How It Works

### 1. PR Review Mode
1. Navigate to the PR section in PRIM
2. Paste a GitHub PR URL (e.g., `https://github.com/user/repo/pull/123`)
3. PRIM automatically fetches the PR data and diff from GitHub
4. Our AI analyzes the code and provides comprehensive feedback
5. Review suggestions, potential issues, and improvement recommendations

### 2. Documentation Mode
1. Switch to Documentation mode in the PR section
2. Enter repository information (owner/repo or full GitHub URL)
3. PRIM fetches the latest commit data and generates comprehensive documentation
4. Receive professional documentation with:
   - High-level PR summary
   - Detailed change analysis with code examples
   - AI-powered review and ratings
   - Simulated failing test cases
   - Workflow diagrams (Mermaid)
   - File change summaries

### 3. Chat Mode
1. Use PRIM as a general AI assistant for development questions
2. Ask about coding best practices, language features, or debugging techniques
3. Get intelligent responses powered by Gemini AI

## 🎯 Use Cases

### For Individual Developers
- **Code Quality Improvement**: Get expert-level feedback on your code
- **Learning Tool**: Understand best practices and common pitfalls
- **Time Savings**: Automate documentation and review processes
- **Skill Development**: Learn GitHub workflows and professional practices

### For Teams
- **Consistent Reviews**: Standardize code review processes across the team
- **Onboarding Assistance**: Help new team members understand codebases faster
- **Knowledge Sharing**: Generate documentation that can be shared with the team
- **Quality Assurance**: Catch issues before they reach production

### For Open Source Projects
- **Community Engagement**: Provide better feedback to contributors
- **Documentation Generation**: Automatically create documentation for contributions
- **Maintainer Support**: Reduce the burden of manual code reviews
- **Quality Control**: Maintain high standards across all contributions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Gemini AI API key (free tier available)
- A GitHub account for repository access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/prim.git
cd prim
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
# For mobile development
npm start
# or for web
npm run web
```

4. Configure your Gemini API key:
   - After starting the app, you'll be prompted to enter your Gemini API key
   - You can get a free API key from [Google AI Studio](https://aistudio.google.com/)

### Available Scripts

- `npm start`: Starts the development server
- `npm run android`: Starts the Android app
- `npm run ios`: Starts the iOS app
- `npm run web`: Starts the web version
- `npm run build`: Builds the web version for production

## 📱 Platform Support

PRIM is designed to work across multiple platforms:

### Web
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for all screen sizes
- Full feature parity with mobile versions

### Mobile
- iOS (iPhone and iPad)
- Android (phones and tablets)
- Native performance and user experience

## 🔐 Security & Privacy

PRIM takes security and privacy seriously:

- **API Key Security**: Your Gemini API key is stored locally and never transmitted to our servers
- **GitHub Authentication**: Secure OAuth integration with GitHub
- **Data Privacy**: PR data is processed locally and not stored on external servers
- **No Tracking**: We don't collect or store any personal or code data

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to [Google Gemini](https://ai.google.dev/) for providing the powerful AI capabilities
- Thanks to [GitHub](https://github.com) for their excellent API
- Thanks to the [Expo](https://expo.dev/) team for making cross-platform development accessible
- Thanks to the open-source community for continuous inspiration

## 📞 Support

If you encounter any issues or have questions:
1. Check our [Issues](https://github.com/your-username/prim/issues) page
2. Create a new issue if your problem isn't already reported
---

<p align="center">
  Built with ❤️ for developers by developers
</p>
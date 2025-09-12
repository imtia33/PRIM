# PR Documentation System

A tool to automatically generate professional documentation and AI reviews for GitHub pull requests.

## Features

- Automatically generates comprehensive PR documentation
- Provides AI-powered code review and suggestions
- Creates Mermaid diagrams for complex workflows
- Simulates test cases that might fail
- Copy documentation to clipboard with one click
- Dark/light mode toggle
- Responsive design for all devices
- Secure API key handling (user-provided API key storage)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Usage

### Web Version

1. Open the application in your browser
2. Navigate to the PR section
3. Use the documentation feature within the PR screen:
   - Click on the "Documentation" mode button
   - Enter repository details in the modal
   - Generate documentation with AI assistance

### Mobile Version

1. Navigate to the PR section
2. Use the documentation feature within the PR screen:
   - Click on the "Documentation" mode button
   - Enter repository details in the modal
   - Generate documentation with AI assistance

## Technologies Used

- React Native (Expo)
- Tailwind CSS
- Gemini AI API
- GitHub API
- Mermaid.js for diagrams
- Highlight.js for code syntax highlighting

## Project Structure

```
├── app/                    # Main application screens
│   ├── screens/           # Application screens
│   │   ├── PR/            # PR-related screens
│   │   └── settings/      # Settings screens
├── componants/            # UI components
│   ├── PR/                # PR-specific components
│   ├── markdown/          # Markdown rendering components
│   └── landing/           # Landing page components
├── context/               # React context providers
├── backend/               # Backend services (AI and API functions)
└── utils/                 # Utility functions
```

## API Integration

The system integrates with:
- GitHub API for fetching repository information and diffs
- Gemini AI API for generating documentation and code reviews

Users must provide their own Gemini API key, which is securely stored locally using AsyncStorage on mobile and environment variables on web.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
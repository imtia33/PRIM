import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ColorMode';

const ChatInterface = ({ onSendMessage, onModeChange, currentMode }) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeMode, setActiveMode] = useState(currentMode || null);
  const editorRef = useRef(null);
  const sendButtonRef = useRef(null);
  const sendIconRef = useRef(null);
  const inputContainerRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Update activeMode when currentMode prop changes
  useEffect(() => {
    // Map 'pr-review' to 'pr' for the ChatInput component
    const mappedMode = currentMode === 'pr-review' ? 'pr' : currentMode;
    setActiveMode(mappedMode || null);
  }, [currentMode]);

  useEffect(() => {
    // Load external dependencies
    const tailwindScript = document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(tailwindScript);
    
    // Add Phosphor Icons stylesheet
    const phosphorIconsLink = document.createElement('link');
    phosphorIconsLink.rel = 'stylesheet';
    phosphorIconsLink.href = 'https://unpkg.com/@phosphor-icons/web@2.1.1/src/duotone/style.css';
    document.head.appendChild(phosphorIconsLink);

    return () => {
      document.head.removeChild(tailwindScript);
      document.head.removeChild(phosphorIconsLink);
    };
  }, []);

  const handleInput = (e) => {
    const text = e.target.textContent;
    setMessage(text);
    
    // Clear the editor if it only contains whitespace and BR tags
    if (!text.trim() && e.target.innerHTML.includes('<br>')) {
      e.target.innerHTML = '';
    }
    
    handleExpansion();
  };

  const handleExpansion = () => {
    if (!editorRef.current || !inputContainerRef.current || !chatContainerRef.current) return;
    
    const editorHeight = editorRef.current.scrollHeight;
    const minHeight = 24;
    const maxHeight = 80;
    
    // Reset height first
    inputContainerRef.current.style.height = 'auto';
    
    if (editorHeight > minHeight) {
      const newHeight = Math.min(editorHeight + 20, maxHeight + 20);
      inputContainerRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleKeyDown = (e) => {
    const isSmallScreen = window.innerWidth < 768;

    if (e.key === 'Enter') {
      if (isSmallScreen) {
        // On small screens, allow default behavior (new line)
        return;
      } else if (!e.shiftKey) {
        // On larger screens, send message on Enter (without Shift)
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    // For PR mode, check if message contains a GitHub PR link
    if (activeMode === 'pr') {
      // Improved regex to check for GitHub PR URLs
      const prUrlRegex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
      const match = message.match(prUrlRegex);
      
      if (match && match[0]) {
        // Extract PR info and send as special format
        if (onSendMessage) {
          onSendMessage({ type: 'pr', url: match[0], content: message });
        }
      } else {
        // Notify parent component with special PR data format
        if (onSendMessage) {
          onSendMessage({ type: 'pr', content: message });
        }
      }
    } else {
      // Call the onSendMessage callback with the message
      if (onSendMessage) {
        onSendMessage(message);
      }
    }
    
    setIsSending(true);
    
    // Clear the message
    if (editorRef.current) {
      editorRef.current.textContent = '';
    }
    setMessage('');
    
    // Trigger the smooth height collapse
    handleExpansion();

    // Start the animation to fly the icon out
    if (sendIconRef.current) {
      sendIconRef.current.classList.add('slide-out');
    }
    
    // After the first animation, fly the icon in from the left
    setTimeout(() => {
      if (sendIconRef.current) {
        sendIconRef.current.classList.remove('slide-out');
        sendIconRef.current.classList.add('slide-in');
      }

      // After the second animation, reset the state
      setTimeout(() => {                            
        if (sendIconRef.current) {
          sendIconRef.current.classList.remove('slide-in');
        }
        setIsSending(false);
      }, 300);
    }, 300);
  };

  const handleModeClick = (mode) => {
    if (activeMode === mode) {
      setActiveMode(null);
      // Notify parent component of mode change
      if (onModeChange) {
        onModeChange(null);
      }
    } else {
      setActiveMode(mode);
      // Notify parent component of mode change
      if (onModeChange) {
        // Map 'pr' to 'pr-review' to match the Test component
        const modeToPass = mode === 'pr' ? 'pr-review' : mode;
        onModeChange(modeToPass);
      }
    }
  };

  const getModeClass = (mode) => {
    const baseClasses = "action-button px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors duration-200 bg-transparent border-none flex items-center gap-1";
    const isActive = activeMode === mode;
    
    // Special handling for documentation mode (disabled)
    if (mode === 'doc') {
      return `${baseClasses}` + (theme.mode === 'dark' ? 
        ' text-gray-600 cursor-not-allowed' : 
        ' text-gray-400 cursor-not-allowed');
    }
    
    if (isActive) {
      return `${baseClasses}` + (theme.mode === 'dark' ? 
        ' bg-white/10 text-white' : 
        ' bg-black/10 text-black');
    } else {
      return `${baseClasses}` + (theme.mode === 'dark' ? 
        ' text-gray-400 hover:text-white' : 
        ' text-gray-500 hover:text-black');
    }
  };

  return (
    
      <div 
        id="chat-container" 
        ref={chatContainerRef}
        className="w-full rounded-[1.5rem] p-4 pt-2 flex flex-col gap-0.5 border max-h-[200px] transition-[max-height] duration-300 ease-in-out mb-2"
        style={{ 
          backgroundColor: theme.mode === 'dark' ? '#1b1c1d' : theme.cardBackground,
          borderColor: theme.borderColor,
          position: 'relative',
          transition: 'height 0.2s ease-in-out'
        }}
      >
        <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
          .ql-editor[data-placeholder]:empty::before {
            content: attr(data-placeholder);
            color: ${theme.mode === 'dark' ? '#999' : theme.secondaryText};
          }
          
          @keyframes slide-right {
            from {
                transform: translateX(0) rotate(0deg);
                opacity: 1;
            }
            to {
                transform: translateX(20px) rotate(15deg);
                opacity: 0;
            }
          }
          
          @keyframes slide-left-in {
            from {
                transform: translateX(-20px) rotate(-15deg);
                opacity: 0;
            }
            to {
                transform: translateX(0) rotate(0deg);
                opacity: 1;
            }
          }

          .slide-out {
            animation: slide-right 0.3s forwards;
          }

          .slide-in {
            animation: slide-left-in 0.3s forwards;
          }

          .ql-editor::-webkit-scrollbar {
            width: 8px;
          }

          .ql-editor::-webkit-scrollbar-track {
            background: transparent;
          }

          .ql-editor::-webkit-scrollbar-thumb {
            background-color: ${theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
            border-radius: 20px;
            border: 3px solid transparent;
          }

          .ql-editor::-webkit-scrollbar-thumb:hover {
            background-color: ${theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
          }
        `}
      </style>
        

        <div 
          id="input-container" 
          ref={inputContainerRef}
          className="rounded-2xl flex items-end px-2 py-1.5 relative transition-[height] duration-200 ease-in-out"
          style={{ backgroundColor: theme.mode === 'dark' ? '#1b1c1d' : theme.cardBackground }}
        >
          <div className="flex-grow py-0 relative">
            <div
              ref={editorRef}
              id="editor"
              className="ql-editor outline-none border-none w-full min-h-[24px] max-h-20 whitespace-pre-wrap overflow-y-auto"
              contentEditable="true"
              data-placeholder="Just PRIM it..."
              style={{ 
                wordBreak: 'break-all',
                color: theme.text,
                backgroundColor: theme.mode === 'dark' ? '#1b1c1d' : theme.cardBackground
              }}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="mode-buttons flex gap-2">
            <button
              className={getModeClass('pr')}
              onClick={() => handleModeClick('pr')}
            >
              <i className="ph-duotone ph-git-pull-request text-lg md:text-base leading-none"></i>
              <span className="hidden md:inline">PR review</span>
            </button>
            <button
              className={getModeClass('doc')}
              onClick={(e) => e.preventDefault()}
              title="Coming soon"
            >
              <i className="ph-duotone ph-file-code text-lg md:text-base leading-none"></i>
              <span className="hidden md:inline">documentation</span>
            </button>
          </div>
          <button
            id="send-button"
            ref={sendButtonRef}
            className="flex justify-center items-center w-10 h-10 rounded-full transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed overflow-hidden"
            style={{ 
              backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              color: theme.text
            }}
            disabled={!message.trim()}
            onClick={handleSend}
          >
            <i 
              id="send-icon" 
              ref={sendIconRef}
              className="ph-duotone ph-paper-plane-right text-lg"
              style={{ color: theme.text }}
            ></i>
          </button>
        </div>
      </div>

      
  );
};

export default ChatInterface;
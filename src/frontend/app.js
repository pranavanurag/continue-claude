/**
 * Main application module
 */

import chatStorage from './storage.js';
import apiService from './api.js';
import uiController from './ui.js';

class ChatApp {
  constructor() {
    // App state
    this.currentChat = null;
    this.currentChatId = null;
    
    // Initialize the app
    this.init();
  }
  
  /**
   * Initialize the application
   */
  async init() {
    // Initialize UI components
    uiController.initUI();
    
    // Load saved API key
    const savedApiKey = chatStorage.loadApiKey();
    if (savedApiKey) {
      document.getElementById('apiKey').value = savedApiKey;
    }
    
    // Update saved chats dropdown
    this.updateSavedChatsDropdown();
    
    // Load models
    await this.loadModels();
    
    // Attach event listeners
    this.attachEventListeners();
    
    // Add keyboard shortcuts
    this.setupKeyboardShortcuts();
  }
  
  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // JSON parsing
    document.getElementById('chatJson').addEventListener('input', this.handleJsonInput.bind(this));
    document.getElementById('parseChat').addEventListener('click', this.handleParseChat.bind(this));
    
    // Chat management
    document.getElementById('loadSavedChat').addEventListener('click', this.handleLoadSavedChat.bind(this));
    document.getElementById('deleteSavedChat').addEventListener('click', this.handleDeleteSavedChat.bind(this));
    document.getElementById('saveCurrentChat').addEventListener('click', this.handleSaveCurrentChat.bind(this));
    document.getElementById('sendMessage').addEventListener('click', this.handleSendMessage.bind(this));
    
    // Debug menu toggle
    const debugButton = document.createElement('button');
    debugButton.id = 'debugButton';
    debugButton.className = 'btn btn-small btn-outline';
    debugButton.innerHTML = '<i class="fas fa-bug"></i> Debug';
    debugButton.style.marginLeft = '10px';
    debugButton.addEventListener('click', () => {
      const debugContainer = document.querySelector('.debug-container');
      debugContainer.style.display = debugContainer.style.display === 'none' ? 'block' : 'none';
    });
    
    // Add debug button to header
    document.querySelector('.app-header > div').appendChild(debugButton);
  }
  
  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    // Send message with Ctrl+Enter
    document.getElementById('newMessage').addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.handleSendMessage();
      }
    });
    
    // Global shortcuts
    document.addEventListener('keydown', (e) => {
      // Toggle sidebar with Ctrl+B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        document.querySelector('.app-sidebar').classList.toggle('active');
      }
      
      // Toggle JSON panel with Ctrl+J
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        document.querySelector('#jsonPanel .panel-header').click();
      }
    });
  }
  
  /**
   * Update saved chats dropdown
   */
  updateSavedChatsDropdown() {
    const chats = chatStorage.listSavedChats();
    uiController.updateSavedChatsDropdown(chats, this.currentChatId);
  }
  
  /**
   * Load available models
   */
  async loadModels() {
    const models = await apiService.fetchModels();
    uiController.populateModelDropdown(models);
  }
  
  /**
   * Handle input in the JSON textarea
   * @param {Event} event - Input event
   */
  handleJsonInput(event) {
    try {
      const json = JSON.parse(event.target.value);
      uiController.displayFormattedJson(json);
    } catch (e) {
      // Not valid JSON yet, hide the display
      document.getElementById('jsonDisplay').style.display = 'none';
    }
  }
  
  /**
   * Handle parsing chat from JSON
   */
  handleParseChat() {
    try {
      const chatJson = document.getElementById('chatJson').value;
      this.currentChat = JSON.parse(chatJson);
      
      // Reset the current chat ID since this is a newly parsed chat
      this.currentChatId = null;
      
      // Display the conversation
      uiController.displayConversation(this.currentChat);
      
      // Update JSON display
      uiController.displayFormattedJson(this.currentChat);
      
      // Suggest saving the chat
      document.getElementById('newChatName').value = uiController.generateChatName();
      
      // Close the JSON panel
      document.querySelector('#jsonPanel.panel').classList.remove('active');
      document.querySelector('#jsonPanel .panel-content').classList.remove('open');
      
      // Focus the new message input
      document.getElementById('newMessage').focus();
    } catch (error) {
      alert('Error parsing chat JSON: ' + error.message);
    }
  }
  
  /**
   * Handle loading a saved chat
   */
  handleLoadSavedChat() {
    const chatId = document.getElementById('savedChatsSelect').value;
    if (!chatId) {
      alert('Please select a chat to load');
      return;
    }
    
    const loadedChat = chatStorage.loadChat(chatId);
    if (loadedChat) {
      this.currentChat = loadedChat;
      this.currentChatId = chatId;
      
      // Display the loaded chat
      uiController.displayConversation(this.currentChat);
      
      // Update the JSON display
      uiController.displayFormattedJson(this.currentChat);
      
      // Close sidebar on mobile
      if (window.innerWidth <= 992) {
        document.querySelector('.app-sidebar').classList.remove('active');
      }
      
      // Focus the new message input
      document.getElementById('newMessage').focus();
    }
  }
  
  /**
   * Handle deleting a saved chat
   */
  handleDeleteSavedChat() {
    const chatId = document.getElementById('savedChatsSelect').value;
    if (!chatId) {
      alert('Please select a chat to delete');
      return;
    }
    
    if (confirm(`Are you sure you want to delete the chat "${chatId}"?`)) {
      chatStorage.deleteChat(chatId);
      this.updateSavedChatsDropdown();
      
      // If the deleted chat was the current one, clear the UI
      if (chatId === this.currentChatId) {
        this.currentChat = null;
        this.currentChatId = null;
        document.getElementById('conversation').innerHTML = '';
        document.getElementById('jsonDisplay').style.display = 'none';
      }
      
      alert('Chat deleted');
    }
  }
  
  /**
   * Handle saving current chat
   */
  handleSaveCurrentChat() {
    if (!this.currentChat) {
      alert('No chat to save. Please parse a chat first.');
      return;
    }
    
    const chatName = document.getElementById('newChatName').value.trim();
    if (!chatName) {
      alert('Please enter a name for this chat');
      return;
    }
    
    // Save the chat with the given name
    chatStorage.saveChat(chatName, this.currentChat);
    this.currentChatId = chatName;
    
    // Update dropdown
    this.updateSavedChatsDropdown();
    
    // Close sidebar on mobile
    if (window.innerWidth <= 992) {
      document.querySelector('.app-sidebar').classList.remove('active');
    }
    
    // Show a notification
    this.showNotification(`Chat saved as "${chatName}"`);
  }
  
  /**
   * Show a temporary notification
   * @param {string} message - Message to display
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.background = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
  
  /**
   * Handle sending a new message
   */
  async handleSendMessage() {
    const apiKey = document.getElementById('apiKey').value;
    const newMessage = document.getElementById('newMessage').value;
    
    if (!apiKey) {
      alert('Please enter your API key');
      return;
    }
    
    // Save API key
    chatStorage.saveApiKey(apiKey);
    
    if (!this.currentChat) {
      alert('Please parse a chat first');
      return;
    }
    
    if (!newMessage.trim()) {
      alert('Please enter a message');
      return;
    }
    
    try {
      // Add new message to UI first
      uiController.addMessageToUI('human', newMessage);
      
      // Clear the input
      uiController.clearMessageInput();
      
      // Show a loading indicator in the conversation
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'message assistant loading';
      loadingDiv.innerHTML = `
        <div class="loading-dots">
          <span></span><span></span><span></span>
        </div>
      `;
      document.getElementById('conversation').appendChild(loadingDiv);
      
      // Add loading indicator style if it doesn't exist
      if (!document.querySelector('style.loading-style')) {
        const loadingStyle = document.createElement('style');
        loadingStyle.className = 'loading-style';
        loadingStyle.textContent = `
          .loading-dots {
            display: flex;
            gap: 6px;
            align-items: center;
            justify-content: center;
          }
          .loading-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--gray-500);
            display: inline-block;
            animation: dot-pulse 1.4s infinite ease-in-out;
            animation-fill-mode: both;
          }
          .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
          .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
          
          @keyframes dot-pulse {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `;
        document.head.appendChild(loadingStyle);
      }
      
      // Get the selected model
      const selectedModel = uiController.getSelectedModel();
      
      // Send the message
      const responseData = await apiService.sendMessage(
        apiKey, 
        this.currentChat, 
        newMessage, 
        selectedModel, 
        uiController.logToDebugConsole.bind(uiController)
      );
      
      // Remove loading indicator
      document.getElementById('conversation').removeChild(loadingDiv);
      
      // Add Claude's response to the conversation
      const assistantMessage = responseData.content[0].text;
      uiController.addMessageToUI('assistant', assistantMessage);
      
      // Update current chat with the new messages
      if (!this.currentChat.chat_messages) {
        this.currentChat.chat_messages = [];
      }
      
      this.currentChat.chat_messages.push({
        sender: 'human',
        content: [{ type: 'text', text: newMessage }]
      });
      
      this.currentChat.chat_messages.push({
        sender: 'assistant',
        content: [{ type: 'text', text: assistantMessage }]
      });
      
      // Auto-save chat if we have a current chat ID
      if (this.currentChatId) {
        chatStorage.saveChat(this.currentChatId, this.currentChat);
      }
      
      // Update the JSON display
      uiController.displayFormattedJson(this.currentChat);
      
    } catch (error) {
      // Remove loading indicator if there was an error
      const loadingDiv = document.querySelector('.message.loading');
      if (loadingDiv) {
        document.getElementById('conversation').removeChild(loadingDiv);
      }
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'message error';
      errorDiv.style.backgroundColor = '#ffebee';
      errorDiv.style.color = '#c62828';
      errorDiv.style.alignSelf = 'center';
      errorDiv.style.maxWidth = '100%';
      errorDiv.style.textAlign = 'center';
      errorDiv.textContent = `Error: ${error.message}`;
      document.getElementById('conversation').appendChild(errorDiv);
      
      // Show debug console
      document.querySelector('.debug-container').style.display = 'block';
      
      console.error('Error sending message:', error);
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.chatApp = new ChatApp();
});
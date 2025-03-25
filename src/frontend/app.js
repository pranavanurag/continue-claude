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
    uiController.initCollapsibles();
    
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
    
    alert(`Chat saved as "${chatName}"`);
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
      alert('Error sending message: ' + error.message);
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.chatApp = new ChatApp();
});
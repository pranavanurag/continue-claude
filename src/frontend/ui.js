/**
 * UI module for handling DOM interactions
 */

class UIController {
  constructor() {
    // Theme state - will be properly initialized later
    this.darkThemeEnabled = false;
    this.sidebarCollapsed = false;
    
    // We'll initialize elements after DOM content loaded
    this.elements = {};
  }
  
  /**
   * Initialize DOM elements
   * This should be called after DOMContentLoaded
   */
  initElements() {
    console.log('Initializing DOM elements...');
    
    // Cache DOM elements
    this.elements = {
      apiKey: document.getElementById('apiKey'),
      toggleApiKey: document.getElementById('toggleApiKey'),
      modelSelect: document.getElementById('modelSelect'),
      customModel: document.getElementById('customModel'),
      savedChatsSelect: document.getElementById('savedChatsSelect'),
      newChatName: document.getElementById('newChatName'),
      chatJson: document.getElementById('chatJson'),
      jsonDisplay: document.getElementById('jsonDisplay'),
      jsonCode: document.querySelector('#jsonDisplay code'),
      conversationContainer: document.getElementById('conversation'),
      newMessage: document.getElementById('newMessage'),
      debugConsole: document.getElementById('debugConsole'),
      jsonPanel: document.getElementById('jsonPanel'),
      sidebarToggle: document.getElementById('sidebar-toggle'),
      floatingSidebarToggle: document.getElementById('floating-sidebar-toggle'),
      themeToggle: document.getElementById('theme-toggle'),
      sidebar: document.querySelector('.app-sidebar'),
      saveCurrentChat: document.getElementById('saveCurrentChat'),
      loadSavedChat: document.getElementById('loadSavedChat'),
      deleteSavedChat: document.getElementById('deleteSavedChat'),
      sendMessage: document.getElementById('sendMessage'),
      clearConversation: document.getElementById('clearConversation'),
      exportJson: document.getElementById('exportJson'),
      debugContainer: document.querySelector('.debug-container'),
      toggleDebug: document.getElementById('toggleDebug'),
      appContainer: document.querySelector('.app-container')
    };
    
    console.log('DOM elements initialized:', {
      themeToggle: !!this.elements.themeToggle,
      sidebarToggle: !!this.elements.sidebarToggle,
      floatingSidebarToggle: !!this.elements.floatingSidebarToggle,
      appContainer: !!this.elements.appContainer
    });
    
    // Theme state
    this.darkThemeEnabled = localStorage.getItem('darkTheme') === 'true';
  }
  
  /**
   * Initialize UI components and event listeners
   */
  initUI() {
    console.log('Initializing UI...');
    
    // First initialize DOM elements
    this.initElements();
    
    this.initPanels();
    this.initSidebar();
    this.initPasswordToggle();
    this.initDebugConsole();
    this.initExtraButtons();
    this.initThemeToggle();
    
    // Apply saved theme on startup
    if (this.darkThemeEnabled) {
      console.log('Dark theme enabled from localStorage');
      this.enableDarkTheme();
    } else {
      console.log('Dark theme not enabled from localStorage');
    }
    
    // Open the JSON panel by default
    const panelHeader = document.querySelector('.panel-header');
    if (panelHeader) {
      panelHeader.click();
    } else {
      console.warn('Panel header not found, cannot open by default');
    }
    
    // Add a direct test method to window for debugging
    window.testUI = () => {
      console.log('Testing UI functionality...');
      this.darkThemeEnabled = !this.darkThemeEnabled;
      if (this.darkThemeEnabled) {
        this.enableDarkTheme();
      } else {
        this.disableDarkTheme();
      }
      localStorage.setItem('darkTheme', this.darkThemeEnabled.toString());
      return 'Theme toggled to ' + (this.darkThemeEnabled ? 'dark' : 'light');
    };
    
    console.log('UI initialization complete');
  }
  
  /**
   * Initialize theme toggle
   */
  initThemeToggle() {
    console.log('Setting up theme toggle...', this.elements.themeToggle);
    
    if (!this.elements.themeToggle) {
      console.error('Theme toggle button not found in DOM!');
      return;
    }
    
    this.elements.themeToggle.addEventListener('click', () => {
      console.log('Theme toggle clicked');
      this.darkThemeEnabled = !this.darkThemeEnabled;
      
      if (this.darkThemeEnabled) {
        this.enableDarkTheme();
      } else {
        this.disableDarkTheme();
      }
      
      // Save preference to localStorage
      localStorage.setItem('darkTheme', this.darkThemeEnabled.toString());
      console.log('Theme preference saved to localStorage:', this.darkThemeEnabled);
    });
  }
  
  /**
   * Enable dark theme
   */
  enableDarkTheme() {
    document.body.classList.add('dark-theme');
    
    if (this.elements.themeToggle) {
      const icon = this.elements.themeToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
      this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
  }
  
  /**
   * Disable dark theme
   */
  disableDarkTheme() {
    document.body.classList.remove('dark-theme');
    
    if (this.elements.themeToggle) {
      const icon = this.elements.themeToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
      this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
  }
  
  /**
   * Initialize collapsible panels
   */
  initPanels() {
    const panels = document.querySelectorAll('.panel');
    for (const panel of panels) {
      panel.querySelector('.panel-header').addEventListener('click', () => {
        panel.classList.toggle('active');
        const content = panel.querySelector('.panel-content');
        if (content.classList.contains('open')) {
          content.classList.remove('open');
        } else {
          content.classList.add('open');
        }
      });
    }
  }
  
  /**
   * Initialize sidebar toggle
   */
  initSidebar() {
    console.log('Setting up sidebar toggle...');
    
    // Check if elements exist
    if (!this.elements.sidebarToggle) {
      console.error('Sidebar toggle button not found in DOM!');
    }
    
    if (!this.elements.appContainer) {
      console.error('App container not found in DOM!');
    }
    
    // Track sidebar state
    this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    console.log('Initial sidebar state:', this.sidebarCollapsed);
    
    // Apply initial state
    if (this.sidebarCollapsed) {
      console.log('Applying collapsed sidebar state');
      this.elements.appContainer.classList.add('sidebar-collapsed');
    }
    
    // Toggle function to reuse for both buttons
    const toggleSidebar = () => {
      console.log('Sidebar toggle clicked');
      
      // Toggle sidebar state
      this.sidebarCollapsed = !this.sidebarCollapsed;
      console.log('New sidebar state:', this.sidebarCollapsed);
      
      // Save state to localStorage
      localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());
      
      // Update UI
      if (this.sidebarCollapsed) {
        this.elements.appContainer.classList.add('sidebar-collapsed');
        this.elements.sidebarToggle.innerHTML = '<i class="fas fa-bars"></i> Show Sidebar';
      } else {
        this.elements.appContainer.classList.remove('sidebar-collapsed');
        this.elements.sidebarToggle.innerHTML = '<i class="fas fa-cog"></i> Settings';
      }
    };
    
    // Set initial button text based on state
    if (this.sidebarCollapsed) {
      this.elements.sidebarToggle.innerHTML = '<i class="fas fa-bars"></i> Show Sidebar';
    }
    
    // Main sidebar toggle button
    this.elements.sidebarToggle.addEventListener('click', toggleSidebar);
    
    // Floating sidebar toggle button (for mobile)
    if (this.elements.floatingSidebarToggle) {
      console.log('Setting up floating sidebar toggle');
      this.elements.floatingSidebarToggle.addEventListener('click', toggleSidebar);
    } else {
      console.warn('Floating sidebar toggle button not found in DOM');
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 992 &&
          !this.sidebarCollapsed &&
          !this.elements.sidebar.contains(e.target) &&
          e.target !== this.elements.sidebarToggle &&
          e.target !== this.elements.floatingSidebarToggle) {
        console.log('Closing sidebar on outside click (mobile)');
        this.sidebarCollapsed = true;
        localStorage.setItem('sidebarCollapsed', 'true');
        this.elements.appContainer.classList.add('sidebar-collapsed');
        this.elements.sidebarToggle.innerHTML = '<i class="fas fa-bars"></i> Show Sidebar';
      }
    });
  }
  
  /**
   * Initialize password toggle
   */
  initPasswordToggle() {
    this.elements.toggleApiKey.addEventListener('click', () => {
      const apiKey = this.elements.apiKey;
      const icon = this.elements.toggleApiKey.querySelector('i');
      
      if (apiKey.type === 'password') {
        apiKey.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        apiKey.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }
  
  /**
   * Initialize debug console
   */
  initDebugConsole() {
    if (this.elements.toggleDebug) {
      this.elements.toggleDebug.addEventListener('click', () => {
        this.elements.debugContainer.style.display = this.elements.debugContainer.style.display === 'none' ? 'block' : 'none';
      });
    }
  }
  
  /**
   * Initialize extra buttons added in the UI redesign
   */
  initExtraButtons() {
    if (this.elements.clearConversation) {
      this.elements.clearConversation.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the current conversation?')) {
          this.elements.conversationContainer.innerHTML = '';
        }
      });
    }
    
    if (this.elements.exportJson) {
      this.elements.exportJson.addEventListener('click', () => {
        const jsonData = this.elements.jsonCode.textContent;
        if (!jsonData) {
          alert('No JSON data to export');
          return;
        }
        
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'claude-chat-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  }
  
  /**
   * Update the saved chats dropdown with current list
   * @param {Array} chats - List of saved chats
   * @param {string} currentChatId - Currently active chat ID
   */
  updateSavedChatsDropdown(chats, currentChatId) {
    const select = this.elements.savedChatsSelect;
    
    // Keep the placeholder option
    select.innerHTML = '<option value="">-- Select a saved chat --</option>';
    
    // Add options for each saved chat
    chats.forEach(chat => {
      const option = document.createElement('option');
      option.value = chat.id;
      option.textContent = chat.name;
      // If this is the currently loaded chat, select it
      if (chat.id === currentChatId) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }
  
  /**
   * Populate the model dropdown
   * @param {Array} models - List of available models
   */
  populateModelDropdown(models) {
    const select = this.elements.modelSelect;
    select.innerHTML = '';
    
    for (const model of models) {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.display_name || model.id;
      select.appendChild(option);
    }
  }
  
  /**
   * Format and display JSON in the code display
   * @param {Object} json - JSON object to display
   */
  displayFormattedJson(json) {
    try {
      const formatted = JSON.stringify(json, null, 2);
      this.elements.jsonCode.textContent = formatted;
      hljs.highlightElement(this.elements.jsonCode);
      this.elements.jsonDisplay.style.display = 'block';
      this.elements.chatJson.value = formatted;
    } catch (error) {
      console.error('Error formatting JSON:', error);
    }
  }
  
  /**
   * Display a conversation in the UI
   * @param {Object} chat - Chat object to display
   */
  displayConversation(chat) {
    const conversationDiv = this.elements.conversationContainer;
    conversationDiv.innerHTML = '';
    
    if (!chat.chat_messages) {
      return;
    }
    
    for (let i = 0; i < chat.chat_messages.length; i++) {
      const message = chat.chat_messages[i];
      let text = '';
      for (const content of message.content) {
        if (content.type === 'text') {
          text += content.text;
        }
      }
      
      if (text.trim()) {
        this.addMessageToUI(message.sender, text, i);
      }
    }
    
    // Scroll to bottom of conversation
    this.scrollToBottom();
  }
  
  /**
   * Add a single message to the UI
   * @param {string} sender - 'human' or 'assistant'
   * @param {string} text - Message text
   * @param {number} messageIndex - Index of the message in chat_messages array
   */
  addMessageToUI(sender, text, messageIndex) {
    const conversationDiv = this.elements.conversationContainer;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'human' ? 'user' : 'assistant'}`;
    messageDiv.dataset.messageIndex = messageIndex;
    
    // Create message content container
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Render markdown for assistant messages or plain text for user messages
    if (sender === 'assistant') {
      messageContent.innerHTML = this.renderMarkdown(text);
    } else {
      messageContent.textContent = text;
    }
    
    // Create message controls
    const messageControls = document.createElement('div');
    messageControls.className = 'message-controls';
    
    // Add edit button
    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.title = 'Edit message';
    editButton.addEventListener('click', () => this.handleEditMessage(messageIndex));
    
    // Add controls to message
    messageControls.appendChild(editButton);
    
    // Add content and controls to message div
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageControls);
    
    conversationDiv.appendChild(messageDiv);
    
    // Scroll to bottom of conversation
    this.scrollToBottom();
  }
  
  /**
   * Handle editing a message
   * @param {number} messageIndex - Index of message to edit
   */
  handleEditMessage(messageIndex) {
    // Get the message element and data
    const messageElement = document.querySelector(`.message[data-message-index="${messageIndex}"]`);
    if (!messageElement) return;
    
    const messageContent = messageElement.querySelector('.message-content');
    const messageControls = messageElement.querySelector('.message-controls');
    
    // Get current text - for assistant messages, we need to get the raw text
    const chat = window.chatApp.currentChat;
    const messageData = chat.chat_messages[messageIndex];
    const originalText = messageData.content[0].text;
    
    // Create textarea for editing
    const textarea = document.createElement('textarea');
    textarea.className = 'edit-textarea';
    textarea.value = originalText;
    textarea.rows = Math.min(10, originalText.split('\n').length + 1);
    
    // Create edit controls
    const editControls = document.createElement('div');
    editControls.className = 'edit-controls';
    
    const saveButton = document.createElement('button');
    saveButton.className = 'save-button';
    saveButton.innerHTML = '<i class="fas fa-save"></i> Save';
    saveButton.title = 'Save changes';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-button';
    cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancel';
    cancelButton.title = 'Cancel editing';
    
    // Add event listeners
    saveButton.addEventListener('click', () => this.saveMessageEdit(messageIndex, textarea.value));
    cancelButton.addEventListener('click', () => this.cancelMessageEdit(messageIndex, messageContent, editControls, messageControls));
    
    // Replace content with textarea and add edit controls
    const originalContent = messageContent.innerHTML;
    messageElement.dataset.originalContent = originalContent;
    
    messageContent.innerHTML = '';
    messageContent.appendChild(textarea);
    
    editControls.appendChild(saveButton);
    editControls.appendChild(cancelButton);
    
    // Hide regular controls and show edit controls
    messageControls.style.display = 'none';
    messageElement.appendChild(editControls);
    
    // Focus the textarea
    textarea.focus();
  }
  
  /**
   * Save changes to an edited message
   * @param {number} messageIndex - Index of message being edited
   * @param {string} newText - New text for the message
   */
  saveMessageEdit(messageIndex, newText) {
    // Get the message element
    const messageElement = document.querySelector(`.message[data-message-index="${messageIndex}"]`);
    if (!messageElement) return;
    
    // Get the chat data and message
    const chat = window.chatApp.currentChat;
    const messageData = chat.chat_messages[messageIndex];
    const messageContent = messageElement.querySelector('.message-content');
    const editControls = messageElement.querySelector('.edit-controls');
    const messageControls = messageElement.querySelector('.message-controls');
    
    // Update the chat data
    messageData.content[0].text = newText;
    messageData.edited = true;
    messageData.editedAt = new Date().toISOString();
    
    // Update the UI
    if (messageData.sender === 'assistant') {
      messageContent.innerHTML = this.renderMarkdown(newText);
    } else {
      messageContent.textContent = newText;
    }
    
    // Add edited indicator if not already present
    if (!messageElement.querySelector('.edited-indicator')) {
      const editedIndicator = document.createElement('span');
      editedIndicator.className = 'edited-indicator';
      editedIndicator.textContent = ' (edited)';
      editedIndicator.style.fontSize = '0.8em';
      editedIndicator.style.opacity = '0.7';
      messageContent.appendChild(editedIndicator);
    }
    
    // Remove edit controls and show regular controls
    if (editControls) {
      messageElement.removeChild(editControls);
    }
    messageControls.style.display = '';
    
    // Update JSON display
    this.displayFormattedJson(chat);
    
    // Auto-save chat if we have a current chat ID
    if (window.chatApp.currentChatId) {
      chatStorage.saveChat(window.chatApp.currentChatId, chat);
    }
  }
  
  /**
   * Cancel editing a message
   * @param {number} messageIndex - Index of message being edited
   * @param {Element} messageContent - Message content element
   * @param {Element} editControls - Edit controls element
   * @param {Element} messageControls - Original message controls
   */
  cancelMessageEdit(messageIndex, messageContent, editControls, messageControls) {
    // Get the message element
    const messageElement = document.querySelector(`.message[data-message-index="${messageIndex}"]`);
    if (!messageElement) return;
    
    // Restore original content
    const originalContent = messageElement.dataset.originalContent;
    messageContent.innerHTML = originalContent;
    
    // Remove edit controls and show regular controls
    if (editControls) {
      messageElement.removeChild(editControls);
    }
    messageControls.style.display = '';
  }
  
  /**
   * Scroll to the bottom of the conversation
   */
  scrollToBottom() {
    const container = this.elements.conversationContainer;
    container.scrollTop = container.scrollHeight;
  }
  
  /**
   * Simple markdown renderer
   * @param {string} text - Markdown text to render
   * @returns {string} - HTML representation
   */
  renderMarkdown(text) {
    return text
      // Code blocks with language
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Code blocks without language
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Headers (h1, h2, h3)
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Unordered lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/<\/li>\n<li>/g, '</li><li>')
      .replace(/<li>(.*)<\/li>/g, '<ul><li>$1</li></ul>')
      // Ordered lists
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Paragraphs and line breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }
  
  /**
   * Log to debug console
   * @param {Object} requestInfo - Information to log
   */
  logToDebugConsole(requestInfo) {
    // Show the debug console if it's hidden
    this.elements.debugContainer.style.display = 'block';
    
    const debugConsole = this.elements.debugConsole;
    const timestamp = new Date().toISOString();
    
    const entry = document.createElement('div');
    entry.className = 'debug-entry';
    
    entry.innerHTML = `<span class="debug-timestamp">[${timestamp}]</span> ` +
                      `<span class="debug-method">${requestInfo.method}</span> ` +
                      `<span class="debug-url">${requestInfo.url}</span> ` +
                      `<span class="debug-status">Status: ${requestInfo.status}</span>\n` +
                      `<pre>${JSON.stringify(requestInfo.data, null, 2)}</pre>`;
    
    debugConsole.appendChild(entry);
    debugConsole.scrollTop = debugConsole.scrollHeight;
  }
  
  /**
   * Get the value of the selected or custom model
   * @returns {string} - Model ID
   */
  getSelectedModel() {
    const customModelValue = this.elements.customModel.value.trim();
    return customModelValue || this.elements.modelSelect.value;
  }
  
  /**
   * Clear the message input field
   */
  clearMessageInput() {
    this.elements.newMessage.value = '';
    this.elements.newMessage.focus();
  }
  
  /**
   * Generate a suggested chat name based on current time
   * @returns {string} - Suggested chat name
   */
  generateChatName() {
    return 'Chat ' + new Date().toLocaleString();
  }
}

// Export singleton instance
const uiController = new UIController();
export default uiController;
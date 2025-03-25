/**
 * UI module for handling DOM interactions
 */

class UIController {
  constructor() {
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
      sidebar: document.querySelector('.app-sidebar'),
      saveCurrentChat: document.getElementById('saveCurrentChat'),
      loadSavedChat: document.getElementById('loadSavedChat'),
      deleteSavedChat: document.getElementById('deleteSavedChat'),
      sendMessage: document.getElementById('sendMessage'),
      clearConversation: document.getElementById('clearConversation'),
      exportJson: document.getElementById('exportJson'),
      debugContainer: document.querySelector('.debug-container'),
      toggleDebug: document.getElementById('toggleDebug')
    };
  }
  
  /**
   * Initialize UI components and event listeners
   */
  initUI() {
    this.initPanels();
    this.initSidebar();
    this.initPasswordToggle();
    this.initDebugConsole();
    this.initExtraButtons();
    
    // Open the JSON panel by default
    document.querySelector('.panel-header').click();
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
    this.elements.sidebarToggle.addEventListener('click', () => {
      this.elements.sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 992 &&
          this.elements.sidebar.classList.contains('active') &&
          !this.elements.sidebar.contains(e.target) &&
          e.target !== this.elements.sidebarToggle) {
        this.elements.sidebar.classList.remove('active');
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
    
    for (const message of chat.chat_messages) {
      let text = '';
      for (const content of message.content) {
        if (content.type === 'text') {
          text += content.text;
        }
      }
      
      if (text.trim()) {
        this.addMessageToUI(message.sender, text);
      }
    }
    
    // Scroll to bottom of conversation
    this.scrollToBottom();
  }
  
  /**
   * Add a single message to the UI
   * @param {string} sender - 'human' or 'assistant'
   * @param {string} text - Message text
   */
  addMessageToUI(sender, text) {
    const conversationDiv = this.elements.conversationContainer;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'human' ? 'user' : 'assistant'}`;
    
    // Render markdown for assistant messages
    if (sender === 'assistant') {
      messageDiv.innerHTML = this.renderMarkdown(text);
    } else {
      // For user messages, handle newlines but not markdown
      messageDiv.textContent = text;
    }
    
    conversationDiv.appendChild(messageDiv);
    
    // Scroll to bottom of conversation
    this.scrollToBottom();
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
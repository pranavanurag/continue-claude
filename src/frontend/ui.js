/**
 * UI module for handling DOM interactions
 */

class UIController {
  constructor() {
    // Cache DOM elements
    this.elements = {
      apiKey: document.getElementById('apiKey'),
      modelSelect: document.getElementById('modelSelect'),
      customModel: document.getElementById('customModel'),
      savedChatsSelect: document.getElementById('savedChatsSelect'),
      newChatName: document.getElementById('newChatName'),
      chatJson: document.getElementById('chatJson'),
      jsonDisplay: document.getElementById('jsonDisplay'),
      jsonCode: document.querySelector('#jsonDisplay code'),
      conversationContainer: document.getElementById('conversation'),
      newMessage: document.getElementById('newMessage'),
      debugConsole: document.getElementById('debugConsole')
    };
  }
  
  /**
   * Initialize collapsible sections
   */
  initCollapsibles() {
    const collapsibles = document.getElementsByClassName('collapsible');
    for (let i = 0; i < collapsibles.length; i++) {
      collapsibles[i].addEventListener('click', function() {
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        if (content.classList.contains('open')) {
          content.classList.remove('open');
        } else {
          content.classList.add('open');
        }
      });
    }
    
    // Open the JSON section by default
    document.querySelector('.collapsible').click();
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
      messageDiv.textContent = text;
    }
    
    conversationDiv.appendChild(messageDiv);
    
    // Scroll to bottom
    window.scrollTo(0, document.body.scrollHeight);
  }
  
  /**
   * Simple markdown renderer
   * @param {string} text - Markdown text to render
   * @returns {string} - HTML representation
   */
  renderMarkdown(text) {
    return text
      .replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>') // code blocks
      .replace(/`([^`]+)`/g, '<code>$1</code>') // inline code
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // bold
      .replace(/\*([^*]+)\*/g, '<em>$1</em>') // italic
      .replace(/\n\n/g, '<br><br>') // paragraphs
      .replace(/\n/g, '<br>'); // line breaks
  }
  
  /**
   * Log to debug console
   * @param {Object} requestInfo - Information to log
   */
  logToDebugConsole(requestInfo) {
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
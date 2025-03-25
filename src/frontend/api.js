/**
 * API module for handling server communications
 */

// Constants
const API_ENDPOINTS = {
  MODELS: '/api/models',
  CHAT: '/api/chat'
};

// Default models if API fails
const DEFAULT_MODELS = [
  { id: 'claude-3-5-sonnet-latest', display_name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-opus-20240229', display_name: 'Claude 3 Opus' }
];

class ApiService {
  /**
   * Fetch available models from the server
   * @returns {Promise<Array>} - List of models
   */
  async fetchModels() {
    try {
      const response = await fetch(API_ENDPOINTS.MODELS);
      if (!response.ok) {
        throw new Error('Failed to load models');
      }
      
      const modelsData = await response.json();
      
      // Use models from the API if available, otherwise use defaults
      let allModels = modelsData && modelsData.data && modelsData.data.length > 0 
        ? [...modelsData.data] 
        : [...DEFAULT_MODELS];
      
      // Sort models by creation date (newest first)
      return allModels.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error loading models:', error);
      return [...DEFAULT_MODELS];
    }
  }
  
  /**
   * Send a message to Claude API via our server
   * @param {string} apiKey - User's API key
   * @param {Object} chat - Current chat data
   * @param {string} message - User's new message
   * @param {string} model - Selected model ID
   * @param {Function} debugLogger - Function to log debug info
   * @returns {Promise<Object>} - API response
   */
  async sendMessage(apiKey, chat, message, model, debugLogger) {
    const requestData = {
      apiKey,
      chat,
      message,
      model
    };
    
    // Log the request (hide API key)
    if (debugLogger) {
      debugLogger({
        method: 'POST',
        url: API_ENDPOINTS.CHAT,
        status: 'Sending',
        data: { ...requestData, apiKey: '****' }
      });
    }
    
    const response = await fetch(API_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      if (debugLogger) {
        debugLogger({
          method: 'POST',
          url: API_ENDPOINTS.CHAT,
          status: response.status,
          data: errorData
        });
      }
      throw new Error(errorData.error || 'API request failed');
    }
    
    const responseData = await response.json();
    
    // Log the response
    if (debugLogger) {
      debugLogger({
        method: 'POST',
        url: API_ENDPOINTS.CHAT,
        status: response.status,
        data: responseData
      });
    }
    
    return responseData;
  }
  
  /**
   * Convert claude.ai chat format to Anthropic API format
   * @param {Object} claudeChat - Chat in claude.ai format
   * @returns {Array} - Messages in API format
   */
  convertClaudeChat(claudeChat) {
    const apiMessages = [];
    
    if (!claudeChat.chat_messages) {
      return apiMessages;
    }
    
    for (const message of claudeChat.chat_messages) {
      // Convert sender to role expected by API
      const role = message.sender === "human" ? "user" : "assistant";
      
      // Extract text content from message
      let content = "";
      if (message.content && message.content.length > 0) {
        // Find text blocks in the content array
        for (const block of message.content) {
          if (block.type === "text") {
            content += block.text;
          }
        }
      }
      
      if (content.trim()) {
        apiMessages.push({ role, content });
      }
    }
    
    return apiMessages;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;

/**
 * Chat storage module for managing chat persistence
 */

class ChatStorage {
  // Save chat to localStorage
  saveChat(chatId, chatData) {
    // Get existing chats or initialize empty object
    const savedChats = JSON.parse(localStorage.getItem('claudeChats') || '{}');
    
    // Save this chat with metadata
    savedChats[chatId] = {
      data: chatData,
      lastModified: new Date().toISOString(),
      name: chatId
    };
    
    // Save back to localStorage
    localStorage.setItem('claudeChats', JSON.stringify(savedChats));
  }
  
  // Load chat from localStorage
  loadChat(chatId) {
    const savedChats = JSON.parse(localStorage.getItem('claudeChats') || '{}');
    if (savedChats[chatId]) {
      return savedChats[chatId].data;
    }
    return null;
  }
  
  // Get list of saved chats
  listSavedChats() {
    const savedChats = JSON.parse(localStorage.getItem('claudeChats') || '{}');
    return Object.keys(savedChats).map(id => ({
      id,
      name: savedChats[id].name,
      lastModified: savedChats[id].lastModified
    })).sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
  }
  
  // Delete a chat
  deleteChat(chatId) {
    const savedChats = JSON.parse(localStorage.getItem('claudeChats') || '{}');
    if (savedChats[chatId]) {
      delete savedChats[chatId];
      localStorage.setItem('claudeChats', JSON.stringify(savedChats));
      return true;
    }
    return false;
  }
  
  // Save API key to session storage
  saveApiKey(apiKey) {
    sessionStorage.setItem('anthropicApiKey', apiKey);
  }
  
  // Load API key from session storage
  loadApiKey() {
    return sessionStorage.getItem('anthropicApiKey');
  }
}

// Export singleton instance
const chatStorage = new ChatStorage();
export default chatStorage;

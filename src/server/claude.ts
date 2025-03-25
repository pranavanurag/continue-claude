import { Anthropic } from '@anthropic-ai/sdk';

interface ChatMessage {
  sender: string;
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface ClaudeChat {
  chat_messages: ChatMessage[];
}

interface ApiMessage {
  role: "user" | "assistant";
  content: string;
}

// Convert claude.ai chat format to Anthropic API format
function convertClaudeChat(claudeChat: ClaudeChat): ApiMessage[] {
  const apiMessages: ApiMessage[] = [];
  
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

// Continue conversation using Anthropic API
async function continueConversation(apiKey: string, claudeChat: ClaudeChat, newMessage?: string, model?: string) {
  const messages = convertClaudeChat(claudeChat);
  
  // Add the new message from user
  if (newMessage) {
    messages.push({ role: "user", content: newMessage });
  }
  
  // Initialize the client
  const client = new Anthropic({
    apiKey: apiKey
  });
  
  // Make API request
  try {
    const response = await client.messages.create({
      model: model || "claude-3-5-sonnet-latest", // Use provided model or default
      max_tokens: 1024,
      messages: messages
    });

    console.log(response)
    
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export {
  convertClaudeChat,
  continueConversation,
  ClaudeChat,
  ApiMessage
};
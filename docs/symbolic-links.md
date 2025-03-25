# Symbolic Links - Function and Component Documentation

## Core Functions

### Claude Conversation API (`claude.ts`)

#### `convertClaudeChat(claudeChat: ClaudeChat): ApiMessage[]`
- **Purpose**: Converts claude.ai chat format to Anthropic API format
- **Input**: ClaudeChat object from claude.ai JSON export
- **Output**: Array of ApiMessage objects suitable for Anthropic API
- **Process**: 
  - Loops through chat_messages array
  - Maps "human" sender to "user" role for API
  - Extracts text content from message blocks
  - Creates ApiMessage objects with role and content

#### `continueConversation(apiKey: string, claudeChat: ClaudeChat, newMessage?: string)`
- **Purpose**: Continues a conversation using Anthropic API
- **Inputs**: 
  - API key for authentication
  - Chat history in ClaudeChat format
  - Optional new message to add
- **Process**:
  - Converts chat to API format with convertClaudeChat
  - Adds new message if provided
  - Initializes Anthropic client with API key
  - Makes API request to continue conversation
  - Returns API response

## Server Components (`server.ts`)

#### `loadApiKey()` 
- **Purpose**: Loads API key from file system
- **Process**: 
  - Tries to read key from 'key' file
  - Logs error if file not found but continues execution

#### `startServer()`
- **Purpose**: Initializes and starts Bun HTTP server
- **Process**:
  - Loads API key (optional)
  - Creates server on port 3000
  - Sets up route handlers:
    - `/` - Serves index.html UI
    - `/health` - Health check endpoint
    - `/api/chat` - API endpoint for continuing conversations

## Web UI Components (`index.html`)

#### Client-side JS Functions

#### `displayConversation(chat)`
- **Purpose**: Displays existing conversation in UI
- **Process**: 
  - Clears conversation div
  - Loops through chat messages
  - Extracts text content
  - Adds messages to UI

#### `addMessageToUI(sender, text)`
- **Purpose**: Adds a single message to conversation UI
- **Process**: 
  - Creates message div
  - Sets appropriate styling for sender type
  - Adds text content
  - Scrolls to show new message

#### UI Event Handlers

- **Parse Chat Button**: 
  - Parses Claude chat JSON from textarea
  - Displays conversation in UI

- **Send Message Button**:
  - Gets API key, chat data, and new message
  - Sends data to server endpoint
  - Adds new messages to UI and chat history

## Data Flow

1. User pastes Claude chat JSON from network tab
2. Client parses JSON and displays conversation
3. User enters new message and API key
4. Client sends data to server endpoint
5. Server processes request:
   - Validates inputs
   - Uses convertClaudeChat to format data
   - Calls continueConversation with Anthropic API
   - Returns response
6. Client adds new messages to conversation UI

## Integration Points

- **Claude Chat Format → API Format**: The `convertClaudeChat` function is the key bridge between the claude.ai export format and the Anthropic API message format.

- **Server → Anthropic API**: The server acts as a proxy between the client and the Anthropic API, handling authentication and request formatting.

- **Client → Server**: The web UI communicates with the server through the `/api/chat` endpoint, providing the chat history, new message, and API key.
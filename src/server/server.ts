import { continueConversation, ClaudeChat } from './claude';
import { readFile } from 'fs/promises';
import { file } from 'bun';

// Load API key once at startup
let apiKey: string;

async function loadApiKey() {
  try {
    apiKey = (await readFile('./config/key.txt', 'utf8')).trim();
  } catch (error) {
    console.error("Error loading API key:", error);
    // Don't exit since API key can now be provided in the UI
    console.log("API key file not found. You'll need to enter it in the UI.");
  }
}

// Start the server
async function startServer() {
  // Load API key first
  await loadApiKey();

  // Create and start the server
  const server = Bun.serve({
    port: 3000,
    
    async fetch(req) {
      const url = new URL(req.url);
      
      // Serve index.html for root path
      if (url.pathname === '/' || url.pathname === '/index.html') {
        const indexHtml = await file('src/frontend/index.html').text();
        return new Response(indexHtml, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response("OK");
      }
      
      // API endpoint to continue a conversation
      if (url.pathname === '/api/chat' && req.method === 'POST') {
        try {
          const body = await req.json();
          
          // Validate request body
          if (!body.chat || !body.message || !body.apiKey) {
            return Response.json(
              { error: "Missing required fields: 'chat', 'message', or 'apiKey'" },
              { status: 400 }
            );
          }
          
          const claudeChat = body.chat as ClaudeChat;
          const newMessage = body.message as string;
          const userApiKey = body.apiKey as string;
          
          // Continue the conversation using user-provided API key
          const response = await continueConversation(userApiKey, claudeChat, newMessage);
          
          return Response.json(response);
        } catch (error) {
          console.error("Error processing request:", error);
          return Response.json(
            { error: "Failed to process request" },
            { status: 500 }
          );
        }
      }
      
      // Fallback for unmatched routes
      return new Response("Not Found", { status: 404 });
    }
  });

  console.log(`Server running at ${server.url}`);
}

// Start the server
startServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

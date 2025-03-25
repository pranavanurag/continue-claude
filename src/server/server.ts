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
      
      // Serve frontend JavaScript files
      if (url.pathname.endsWith('.js') && (
          url.pathname === '/storage.js' || 
          url.pathname === '/api.js' || 
          url.pathname === '/ui.js' || 
          url.pathname === '/app.js')) {
        try {
          const jsPath = `src/frontend${url.pathname}`;
          const jsContent = await file(jsPath).text();
          return new Response(jsContent, {
            headers: { 'Content-Type': 'application/javascript' }
          });
        } catch (error) {
          console.error(`Error serving ${url.pathname}:`, error);
          return new Response('Not Found', { status: 404 });
        }
      }
      
      // Serve models.json
      if (url.pathname === '/api/models') {
        try {
          const modelsJson = await file('models.json').text();
          return new Response(modelsJson, {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error("Error serving models.json:", error);
          // Return a default models list if file is missing or unreadable
          const defaultModels = {
            "data": [
              {
                "type": "model",
                "id": "claude-3-5-sonnet-latest",
                "display_name": "Claude 3.5 Sonnet",
                "created_at": "2024-10-22T00:00:00Z"
              },
              {
                "type": "model",
                "id": "claude-3-opus-20240229",
                "display_name": "Claude 3 Opus",
                "created_at": "2024-02-29T00:00:00Z"
              },
              {
                "type": "model",
                "id": "claude-3-sonnet-20240229",
                "display_name": "Claude 3 Sonnet",
                "created_at": "2024-02-29T00:00:00Z"
              },
              {
                "type": "model",
                "id": "claude-3-haiku-20240307",
                "display_name": "Claude 3 Haiku",
                "created_at": "2024-03-07T00:00:00Z"
              }
            ],
            "has_more": false
          };
          return Response.json(defaultModels);
        }
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
          const model = body.model as string;
          
          console.log(`API Request: ${url.pathname}, Model: ${model}`);
          
          // Continue the conversation using user-provided API key and model
          const response = await continueConversation(userApiKey, claudeChat, newMessage, model);
          
          console.log(`API Response: Status 200, ID: ${response.id}`);
          
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

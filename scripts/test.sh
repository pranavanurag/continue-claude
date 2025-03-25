curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "chat": {
      "chat_messages": [
        {
          "sender": "human",
          "content": [{"type": "text", "text": "Hello, Claude!"}]
        },
        {
          "sender": "assistant",
          "content": [{"type": "text", "text": "Hello! How can I help you today?"}]
        }
      ]
    },
    "message": "What''s the weather like?"
  }'

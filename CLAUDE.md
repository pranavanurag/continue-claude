# CLAUDE.md - Guide for Agentic Coding Assistants

## Build & Run Commands
> **Note:** Bun is the recommended runtime for this project, not npm.

- Run server: `bun run src/server/server.ts` or `bun start`
- Run example: `bun run src/server/example.ts` or `bun example`
- Test API: `bun test`
- Run with API key: `ANTHROPIC_API_KEY=sk-... bun run src/server/claude.ts`
- Web UI: After running the server, visit http://localhost:3000

## Style Guidelines
- **Imports**: Group related imports, place built-in modules first
- **Naming**: camelCase for variables/functions, PascalCase for interfaces/types
- **Types**: Use explicit TypeScript types everywhere, avoid `any`
- **Error Handling**: Use try/catch with specific error messages
- **Comments**: Use JSDoc for functions, descriptive comments for complex logic
- **Format**: 2-space indentation, semicolons, single quotes for strings
- **API Keys**: Never hardcode API keys, load from environment or files
- **Async/Await**: Prefer async/await over raw Promises
- **Validation**: Validate all inputs before processing

## Codebase Structure
This project provides a server that uses Claude API to continue conversations
from claude.ai export format, converting between formats as needed.

```
continue-claude/
├── config/               # Configuration files
│   ├── key.txt           # API key storage
│   └── models.json       # Claude models configuration
├── docs/                 # Documentation
│   ├── symbolic-links.md # Documentation for code functionality
│   └── tasks.md          # Project tasks and TODOs
├── src/                  # Source code
│   ├── frontend/         # Frontend files
│   │   ├── api.js        # API client
│   │   ├── app.js        # Application logic
│   │   ├── index.html    # Web UI
│   │   ├── storage.js    # Storage utilities
│   │   └── ui.js         # UI components/handlers
│   └── server/           # Server code
│       ├── chat.json     # Example chat data
│       ├── claude.ts     # Claude API integration
│       ├── example.ts    # Example usage
│       └── server.ts     # Server implementation
├── CLAUDE.md             # Project documentation
└── package.json          # Project configuration
```

## Features
- Convert Claude chat JSON from network tab to API format
- Continue conversations using Anthropic API
- Web UI for pasting chat JSON and continuing conversations
- API endpoint for chat continuation
- Support for user-provided API keys through UI
- Lightweight server using Bun
- Render all chat messages as Markdown
- Collapsible user inputs

## Core Functionality

### Claude API Integration
- `convertClaudeChat`: Converts claude.ai chat format to Anthropic API format
- `continueConversation`: Continues a conversation using the Anthropic API

### Server Components
- HTTP server on port 3000
- API endpoint for chat continuation at `/api/chat`
- Static file serving for web UI

### Web UI Components
- Chat display with markdown rendering
- Form for pasting Claude chat exports
- Interface for continuing conversations
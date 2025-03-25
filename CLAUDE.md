# CLAUDE.md - Guide for Agentic Coding Assistants

## Build & Run Commands
- Run server: `bun run server.ts`
- Run example: `bun run example.ts`
- Test API: `./test.sh`
- Run with API key: `ANTHROPIC_API_KEY=sk-... bun run claude.ts`
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

## Features
- Convert Claude chat JSON from network tab to API format
- Continue conversations using Anthropic API
- Web UI for pasting chat JSON and continuing conversations
- API endpoint for chat continuation
- Support for user-provided API keys through UI
- Lightweight server using Bun
- Render all chat messages as Markdown
- Collapsible user inputs
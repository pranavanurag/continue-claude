export ANTHROPIC_API_KEY=$(cat ./config/key.txt)
bun run src/server/claude.ts

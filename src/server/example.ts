import {
    convertClaudeChat,
    continueConversation,
    ClaudeChat,
    ApiMessage
} from './claude';
import { readFile } from 'fs/promises';

async function main() {
    try {
        const data = await readFile('./src/server/chat.json', 'utf8');
        const key = await readFile('./config/key.txt', 'utf8');
        const claudeChat = JSON.parse(data) as ClaudeChat;
        const messages = convertClaudeChat(claudeChat);
        // console.log("messages so far", messages);
        continueConversation(key, claudeChat, "");
        } catch (error) {
            console.error("Error:", error);
        }
    }

main(); 
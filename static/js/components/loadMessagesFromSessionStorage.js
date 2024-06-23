import { displayMessage } from './displayMessage.js';

export function loadMessagesFromSessionStorage() {
    const messages = JSON.parse(sessionStorage.getItem('chatMessages')) || [];
    messages.forEach(msg => {
        const decodedMessage = msg.message.replace(/<br>/g, '\n');
        displayMessage(msg.name, decodedMessage, msg.position);
    });
}

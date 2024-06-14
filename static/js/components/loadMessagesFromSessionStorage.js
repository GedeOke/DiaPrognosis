import { displayMessage } from './displayMessage.js';

export function loadMessagesFromSessionStorage() {
    const messages = JSON.parse(sessionStorage.getItem('chatMessages')) || [];
    messages.forEach(msg => {
        displayMessage(msg.name, msg.message, msg.position);
    });
}

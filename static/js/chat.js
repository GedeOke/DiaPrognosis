import { displayMessage } from './components/displayMessage.js';
import { botResponse } from './components/botResponse.js';
import { saveMessageToSessionStorage, deleteAllMessagesFromSessionStorage } from './components/saveMessageToSessionStorage.js';
import { loadMessagesFromSessionStorage } from './components/loadMessagesFromSessionStorage.js';

document.addEventListener('DOMContentLoaded', (event) => {
    initializeChat();
    loadMessagesFromSessionStorage();

    const initialMessage = sessionStorage.getItem('initialMessage');
    if (initialMessage) {
        sendMessage(initialMessage, true); // Send the message immediately
        sessionStorage.removeItem('initialMessage'); // Ensure message is processed only once
    }
});

document.getElementById('sendButton').addEventListener('click', () => sendMessage());
document.getElementById('inputField').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
document.getElementById('deleteButton').addEventListener('click', () => deleteAllMessages());

function sendMessage(initialMessage = '', isInitial = false) {
    const inputField = document.getElementById('inputField');
    const message = isInitial ? initialMessage : inputField.value;
    if (!isInitial) inputField.value = '';

    if (message.trim() === '') return;

    displayMessage('User', message, 'right');
    saveMessageToSessionStorage('User', message, 'right');
    botResponse(message).then(botMessage => {
        saveMessageToSessionStorage('Diaprognosis', botMessage, 'left');
    });
}

function initializeChat() {
    document.getElementById('sendButton').addEventListener('click', () => sendMessage());
    document.getElementById('inputField').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
}

function deleteAllMessages() {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    deleteAllMessagesFromSessionStorage();
}

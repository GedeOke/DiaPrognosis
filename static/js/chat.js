import { displayMessage } from './components/displayMessage.js';
import { botResponse } from './components/botResponse.js';

document.addEventListener('DOMContentLoaded', (event) => {
    initializeChat();
    const urlParams = new URLSearchParams(window.location.search);
    const initialMessage = urlParams.get('message');
    if (initialMessage) {
        displayMessage('User', initialMessage, 'right');
        botResponse(initialMessage).then(botMessage => {
            saveMessageToSessionStorage('Diaprognosis', botMessage, 'left');
        });
    }

    loadMessagesFromSessionStorage();
});

document.getElementById('sendButton').addEventListener('click', sendMessage);
document.getElementById('inputField').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const inputField = document.getElementById('inputField');
    const message = inputField.value;
    inputField.value = '';
    if (message.trim() === '') return;

    displayMessage('User', message, 'right');
    saveMessageToSessionStorage('User', message, 'right');
    botResponse(message).then(botMessage => {
        saveMessageToSessionStorage('Diaprognosis', botMessage, 'left');
    });
}

function initializeChat() {
    document.getElementById('sendButton').addEventListener('click', sendMessage);
    document.getElementById('inputField').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
}

function saveMessageToSessionStorage(name, message, position) {
    const messages = JSON.parse(sessionStorage.getItem('chatMessages')) || [];
    messages.push({ name, message, position });
    sessionStorage.setItem('chatMessages', JSON.stringify(messages));
}

function loadMessagesFromSessionStorage() {
    const messages = JSON.parse(sessionStorage.getItem('chatMessages')) || [];
    messages.forEach(msg => {
        displayMessage(msg.name, msg.message, msg.position);
    });
}
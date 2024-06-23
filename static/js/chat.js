import { displayMessage } from './components/displayMessage.js';
import { botResponse } from './components/botResponse.js';
import { saveMessageToSessionStorage, deleteAllMessagesFromSessionStorage } from './components/saveMessageToSessionStorage.js';
import { loadMessagesFromSessionStorage } from './components/loadMessagesFromSessionStorage.js';
import { createForm } from './components/createForm.js';

let username = null;

document.addEventListener('DOMContentLoaded', (event) => {
    fetch('/get-username')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                username = data.username;
                sessionStorage.setItem('username', username); // Store username in session storage
            } else {
                console.error('Username not found.');
            }
        })
        .catch(error => console.error('Error fetching username:', error));

    initializeChat();
    loadMessagesFromSessionStorage();

    if (sessionStorage.getItem('formDisplayed') === 'true') {
        const messagesDiv = document.getElementById('messages');
        const formPosition = parseInt(sessionStorage.getItem('formPosition'), 10);
        createForm(messagesDiv, formPosition);
    }

    const predictionResult = sessionStorage.getItem('predictionResult');
    const resultPosition = parseInt(sessionStorage.getItem('resultPosition'), 10);
    if (predictionResult && !isNaN(resultPosition)) {
        const messagesDiv = document.getElementById('messages');
        const resultDiv = document.createElement('div');
        resultDiv.className = 'message left';
        resultDiv.innerHTML = `
            <div class="name">Dian</div>
            <div class="bubble">Hasil prediksi: ${predictionResult}</div>
        `;
        messagesDiv.insertBefore(resultDiv, messagesDiv.children[resultPosition]);
    }

    const initialMessage = sessionStorage.getItem('initialMessage');
    if (initialMessage) {
        sendMessage(initialMessage, true);
        sessionStorage.removeItem('initialMessage');
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

    username = sessionStorage.getItem('username');
    if (!username) {
        console.error('Username not set.');
        return;
    }

    displayMessage(username, message, 'right'); // Display user message
    saveMessageToSessionStorage(username, message, 'right');
    botResponse(message).then(botMessage => {
        saveMessageToSessionStorage('Dian', botMessage, 'left');
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
    sessionStorage.removeItem('formDisplayed');
    sessionStorage.removeItem('formPosition');
    sessionStorage.removeItem('predictionResult');
    sessionStorage.removeItem('resultPosition');
}

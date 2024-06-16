import { displayMessage } from './components/displayMessage.js';
import { botResponse } from './components/botResponse.js';
import { saveMessageToSessionStorage, deleteAllMessagesFromSessionStorage } from './components/saveMessageToSessionStorage.js';
import { loadMessagesFromSessionStorage } from './components/loadMessagesFromSessionStorage.js';
import { createForm } from './components/createForm.js';

document.addEventListener('DOMContentLoaded', (event) => {
    initializeChat();
    loadMessagesFromSessionStorage();

    // Check if form was displayed before refresh
    if (sessionStorage.getItem('formDisplayed') === 'true') {
        const messagesDiv = document.getElementById('messages');
        const formPosition = parseInt(sessionStorage.getItem('formPosition'), 10);
        createForm(messagesDiv, formPosition);
    }

    // // Check if prediction result was stored
    // const predictionResult = sessionStorage.getItem('predictionResult');
    // if (predictionResult) {
    //     const resultDiv = document.createElement('div');
    //     resultDiv.className = 'message left';
    //     resultDiv.innerHTML = `
    //         <div class="name">Chatbot</div>
    //         <div class="bubble">Hasil prediksi: ${predictionResult}</div>
    //     `;
    //     messagesDiv.appendChild(resultDiv);
    // }

    // Ensure scroll to the bottom
    setTimeout(() => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 100); // Adjust the delay if needed

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
    // Remove form from session storage
    sessionStorage.removeItem('formDisplayed');
    sessionStorage.removeItem('formPosition');
    sessionStorage.removeItem('predictionResult');
}

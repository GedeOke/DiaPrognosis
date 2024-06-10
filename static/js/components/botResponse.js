// botResponse.js
import { createForm } from './createForm.js';

export function botResponse(userMessage) {
    return new Promise((resolve, reject) => {
        const messagesDiv = document.getElementById('messages');
        const botMessageDiv = document.createElement('div');
        const logo = document.getElementById('logo');

        botMessageDiv.className = 'message left';
        botMessageDiv.innerHTML = `
            <div class="name">DiaPrognosis</div>
            <div class="bubble">...</div>
        `;
        messagesDiv.appendChild(botMessageDiv);

        logo.classList.add('logo-scale');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        const typingDuration = 2000;

        setTimeout(() => {
            let botMessage;
            if (userMessage.toLowerCase().includes('halo')) {
                botMessage = 'Halo! Saya adalah Chatbot Prediksi Diabetes. Apakah ada yang bisa saya bantu?';
                botMessageDiv.querySelector('.bubble').innerText = botMessage;
                resolve(botMessage);
            } else if (userMessage.toLowerCase().includes('prediksi')) {
                botMessage = 'Silakan isi form berikut untuk prediksi diabetes:';
                botMessageDiv.querySelector('.bubble').innerText = botMessage;
                createForm(messagesDiv);
                resolve(botMessage);
            } else {
                fetch('/chat-response', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({ message: userMessage })
                })
                .then(response => response.json())
                .then(data => {
                    botMessage = data.response;
                    botMessageDiv.querySelector('.bubble').innerText = botMessage;
                    resolve(botMessage);
                })
                .catch(error => {
                    botMessage = 'Maaf, ada kesalahan. Silakan coba lagi.';
                    botMessageDiv.querySelector('.bubble').innerText = botMessage;
                    resolve(botMessage);
                })
                .finally(() => {
                    setTimeout(() => {
                        logo.classList.remove('logo-scale');
                    }, typingDuration);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                });
            }
            setTimeout(() => {
                logo.classList.remove('logo-scale');
            }, typingDuration);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, typingDuration);
    });
}

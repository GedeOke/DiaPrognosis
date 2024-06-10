// displayMessage.js
export function displayMessage(name, message, position) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${position}`;

    // Replace new lines with <br> tags
    const formattedMessage = message.replace(/\n/g, '<br>');

    messageDiv.innerHTML = `
        <div class="name font-bold">${name}</div>
        <div class="bubble">${formattedMessage}</div>
    `;
    messagesDiv.appendChild(messageDiv);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

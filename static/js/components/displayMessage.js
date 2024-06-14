export function displayMessage(sender, message, position) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${position}`;
    messageDiv.innerHTML = `
        <div class="name">${sender}</div>
        <div class="bubble">${message}</div>
    `;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

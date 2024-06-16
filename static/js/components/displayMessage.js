export function displayMessage(sender, message, position) {
    const messagesDiv = document.getElementById('messages');

    if (!messagesDiv) {
        console.error('Messages container not found!');
        return;
    }

    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${position}`;
    messageDiv.innerHTML = `
        <div class="name">${escapeHtml(sender)}</div>
        <div class="bubble">${message.replace(/\n/g, '<br>')}</div>
    `;

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

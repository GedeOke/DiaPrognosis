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

    const formatMessage = (message) => {
        message = message.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        message = message.replace(/\*(.*?)\*/g, '<i>$1</i>');
        message = message.replace(/_(.*?)_/g, '<i>$1</i>');
        message = message.replace(/->(.*?)->/g, '<span style="cursor: pointer;">$1</span>');
        
        message = message.replace(/^(\d+)\.\s+(.*)$/gm, '<ol start="$1"><li>$2</li></ol>');
        message = message.replace(/^-\s+(.*)$/gm, '<ul><li>$1</li></ul>');

        message = message.replace(/<\/(ol|ul)>\s*<\1>/g, '');
        
        return message;
    };

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${position}`;
    messageDiv.innerHTML = `
        <div class="name">${escapeHtml(sender)}</div>
        <div class="bubble">${formatMessage(message).replace(/\n/g, '<br>')}</div>
    `;

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

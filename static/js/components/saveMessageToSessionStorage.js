export function saveMessageToSessionStorage(name, message, position) {
    const messages = JSON.parse(sessionStorage.getItem('chatMessages')) || [];
    const encodedMessage = message.replace(/\n/g, '<br>');
    messages.push({ name, message: encodedMessage, position });
    sessionStorage.setItem('chatMessages', JSON.stringify(messages));
}

export function deleteAllMessagesFromSessionStorage() {
    sessionStorage.removeItem('chatMessages');
}

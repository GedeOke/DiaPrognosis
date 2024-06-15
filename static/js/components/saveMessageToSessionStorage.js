export function saveMessageToSessionStorage(name, message, position) {
    const messages = JSON.parse(sessionStorage.getItem('chatMessages')) || [];
    messages.push({ name, message, position });
    sessionStorage.setItem('chatMessages', JSON.stringify(messages));
}

export function deleteAllMessagesFromSessionStorage() {
    sessionStorage.removeItem('chatMessages');
}

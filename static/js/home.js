document.getElementById('chatForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const message = document.getElementById('message').value;
    sessionStorage.setItem('initialMessage', message);
    window.location.href = "/chat";
});

function handleFormSubmit(event) {
    event.preventDefault();
    const message = document.getElementById('message').value;
    sessionStorage.setItem('initialMessage', message);
    window.location.href = "/chat";
}

function openLogoutModal() {
    document.getElementById('logoutModal').classList.remove('hidden');
}

function closeLogoutModal() {
    document.getElementById('logoutModal').classList.add('hidden');
}

function handleLogout() {
    sessionStorage.clear();
    window.location.href = "/login";
}

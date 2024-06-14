document.getElementById('chatForm').addEventListener('submit', function(event) {
    event.preventDefault();
    document.body.classList.add('fade-out');
    setTimeout(() => {
        handleFormSubmit(event);
    }, 1000);
});

function handleFormSubmit(event) {
    event.preventDefault();
    const message = document.getElementById('message').value;
    sessionStorage.setItem('initialMessage', message);
    window.location.href = "/chat";
}

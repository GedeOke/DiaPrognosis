document.getElementById('chatForm').addEventListener('submit', function(event) {
    event.preventDefault();
    document.body.classList.add('fade-out');
    setTimeout(() => {
        event.target.submit();
    }, 1000);
});

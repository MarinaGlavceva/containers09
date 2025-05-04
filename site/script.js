console.log('Site is working!');

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickMe');
    const output = document.getElementById('output');

    button.addEventListener('click', function() {
        const messages = [
            'You clicked the button!',
            'Docker is awesome 🚀',
            'Nginx is serving this page 📄',
            'Another click, another message 😄',
            'Keep exploring Docker!'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        output.textContent = randomMessage;
    });
});

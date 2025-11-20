// frontend/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (!loginForm || !registerForm) return;

    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const registerErrorDiv = document.getElementById('register-error');
    const loginErrorDiv = document.getElementById('login-error');

    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); loginForm.classList.add('hidden'); registerForm.classList.remove('hidden'); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); registerForm.classList.add('hidden'); loginForm.classList.remove('hidden'); });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerErrorDiv.textContent = '';
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            const res = await fetch('http://localhost:5000/api/users/register', { // URL REVERTED
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.msg || 'Registration failed'); }
            alert('Registration successful! Please log in.');
            showLoginLink.click();
        } catch (error) {
            registerErrorDiv.textContent = error.message;
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginErrorDiv.textContent = '';
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const res = await fetch('http://localhost:5000/api/users/login', { // URL REVERTED
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.msg || 'Login failed'); }
            const { token, userName } = await res.json();
            localStorage.setItem('token', token);
            localStorage.setItem('userName', userName);
            window.location.href = 'index.html';
        } catch (error) {
            loginErrorDiv.textContent = error.message;
        }
    });
});

function getToken() { return localStorage.getItem('token'); }
function getUserName() { return localStorage.getItem('userName'); }
function logout() { localStorage.removeItem('token'); localStorage.removeItem('userName'); window.location.reload(); }
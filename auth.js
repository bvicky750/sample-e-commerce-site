// This file handles user authentication logic using localStorage.

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // --- Form Toggling ---
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }

    // --- Registration ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value; // In a real app, hash this!
            const errorDiv = document.getElementById('register-error');

            const users = JSON.parse(localStorage.getItem('users')) || [];

            if (users.find(user => user.email === email)) {
                errorDiv.textContent = 'User with this email already exists.';
                errorDiv.classList.remove('hidden');
                return;
            }

            users.push({ name, email, password });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful! Please log in.');
            
            // Switch to login form
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            errorDiv.classList.add('hidden');
            registerForm.reset();
        });
    }

    // --- Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Login successful
                localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
                window.location.href = 'index.html'; // Redirect to store page
            } else {
                errorDiv.textContent = 'Invalid email or password.';
                errorDiv.classList.remove('hidden');
            }
        });
    }
});

// --- Helper functions for use in other scripts ---

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.reload(); // Refresh to update UI
}
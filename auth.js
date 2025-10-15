// --- Global Authentication Functions ---

/**
 * Retrieves the current user from localStorage.
 * @returns {object|null} The user object or null if not logged in.
 */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

/**
 * Logs the user out by removing their data from localStorage and reloading the page.
 */
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html'; // Redirect to home for a clean state
}

// --- Logic specifically for the Login/Register Page ---

// This ensures the code only runs on pages that have these form elements (i.e., login.html)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // If the forms don't exist on this page, stop executing this script block.
    if (!loginForm || !registerForm) {
        return;
    }

    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    
    // --- Form Toggling ---
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // --- Registration Handler ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value; // In a real app, HASH this!
        const errorDiv = document.getElementById('register-error');

        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.find(user => user.email === email)) {
            errorDiv.textContent = 'User with this email already exists.';
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful! Please log in.');
        
        // Switch to login form after successful registration
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        errorDiv.textContent = '';
        registerForm.reset();
    });

    // --- Login Handler ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
            window.location.href = 'index.html'; // Redirect to the store
        } else {
            errorDiv.textContent = 'Invalid email or password.';
        }
    });
});
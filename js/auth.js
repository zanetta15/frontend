// Initialize users if not exists
if (!localStorage.getItem('users')) {
    // Create default admin user
    const defaultUsers = [
        {
            id: 1,
            fullName: 'Admin User',
            email: 'admin',
            password: 'admin',
            role: 'admin',
            dateCreated: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

// Initialize hostels array in localStorage if it doesn't exist
if (!localStorage.getItem('hostels')) {
    localStorage.setItem('hostels', JSON.stringify([]));
}

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Store user info in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }));
        
        // Redirect based on role
        if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
        }
    } else {
        alert('Invalid email or password');
    }
});

// Handle Registration
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users'));
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        alert('Email already registered');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(), // Simple unique ID
        fullName,
        email,
        password,
        role: 'student' // Default role
    };

    // Add user to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Store current user info
    localStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
    }));

    // Redirect to student dashboard
    window.location.href = 'student-dashboard.html';
});

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Check if current user is admin
function isAdmin() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'admin';
}

// Check if current user is student
function isStudent() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'student';
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Redirect based on user role
function redirectBasedOnRole() {
    if (isLoggedIn()) {
        if (isAdmin()) {
            window.location.href = 'admin-dashboard.html';
        } else if (isStudent()) {
            window.location.href = 'student-dashboard.html';
        }
    }
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // If on index page, don't redirect
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        return;
    }
    
    // If on login/register pages, redirect if already logged in
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
        redirectBasedOnRole();
        return;
    }
    
    // For other pages, check if logged in
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user has correct role for the page
    if (window.location.pathname.includes('admin') && !isAdmin()) {
        window.location.href = 'index.html';
        return;
    }
    
    if (window.location.pathname.includes('student') && !isStudent()) {
        window.location.href = 'index.html';
        return;
    }
}); 
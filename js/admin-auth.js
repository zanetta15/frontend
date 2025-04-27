// API URL
const API_URL = 'http://localhost:5000/api';

// Handle Admin Login
document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user info in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('userName', data.user.name);
            
            // Redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            alert(data.msg || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
});

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'admin') {
        // User is logged in as admin
        window.location.href = 'admin-dashboard.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
}

// Add event listener for logout button
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// Check authentication status when page loads
document.addEventListener('DOMContentLoaded', checkAuth); 
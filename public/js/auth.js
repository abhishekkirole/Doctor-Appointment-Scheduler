// API Base URL
const API_URL = '/api';

// Store token in localStorage
const setToken = (token) => {
    localStorage.setItem('token', token);
};

const getToken = () => {
    return localStorage.getItem('token');
};

const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Store user data
const setUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Check if user is logged in
const isLoggedIn = () => {
    return !!getToken();
};

// API request helper
const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// Show alert message
const showAlert = (elementId, message, type = 'error') => {
    const alert = document.getElementById(elementId);
    if (alert) {
        alert.textContent = message;
        alert.className = `alert alert-${type}`;
        alert.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                alert.style.display = 'none';
            }, 3000);
        }
    }
};

// Hide alert
const hideAlert = (elementId) => {
    const alert = document.getElementById(elementId);
    if (alert) {
        alert.style.display = 'none';
    }
};

// Logout function
const logout = () => {
    removeToken();
    window.location.href = '/';
};

// Format date for display
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format time for display
const formatTime = (timeString) => {
    return timeString;
};

// Get status badge HTML
const getStatusBadge = (status) => {
    return `<span class="badge badge-${status}">${status}</span>`;
};

// API URL
const API_URL = 'http://localhost:5000/api';

// Check if user is logged in and is an admin
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Load admin profile information
function loadProfile() {
    if (!checkAuth()) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('adminName').textContent = currentUser.fullName || 'Admin';
}

// Load hostels summary
function loadHostelsSummary() {
    if (!checkAuth()) return;
    
    const hostels = JSON.parse(localStorage.getItem('hostels')) || [];
    document.getElementById('totalHostels').textContent = hostels.length;
}

// Load applications summary
function loadApplicationsSummary() {
    if (!checkAuth()) return;
    
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    
    // Count applications by status
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    
    // Update summary cards
    document.getElementById('totalApplications').textContent = totalApplications;
    document.getElementById('pendingApplications').textContent = pendingApplications;
}

// Load students summary
async function loadStudentsSummary() {
    if (!checkAuth()) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/students/summary`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const summary = await response.json();
            
            // Display students summary
            const studentsSummary = document.getElementById('studentsSummary');
            studentsSummary.innerHTML = `
                <div class="summary-item">
                    <span class="summary-value">${summary.total_students}</span>
                    <span class="summary-label">Total Students</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${summary.active_students}</span>
                    <span class="summary-label">Active Students</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${summary.new_students}</span>
                    <span class="summary-label">New Students (This Month)</span>
                </div>
            `;
        } else {
            console.error('Failed to load students summary');
        }
    } catch (error) {
        console.error('Error loading students summary:', error);
    }
}

// Load reports summary
async function loadReportsSummary() {
    if (!checkAuth()) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/reports/summary`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const summary = await response.json();
            
            // Display reports summary
            const reportsSummary = document.getElementById('reportsSummary');
            reportsSummary.innerHTML = `
                <div class="summary-item">
                    <span class="summary-value">${summary.occupancy_rate}%</span>
                    <span class="summary-label">Occupancy Rate</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${summary.revenue}</span>
                    <span class="summary-label">Total Revenue</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${summary.pending_issues}</span>
                    <span class="summary-label">Pending Issues</span>
                </div>
            `;
        } else {
            console.error('Failed to load reports summary');
        }
    } catch (error) {
        console.error('Error loading reports summary:', error);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
}

// Load all applications
function loadApplications(status = 'all') {
    if (!checkAuth()) return;
    
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const hostels = JSON.parse(localStorage.getItem('hostels')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Filter applications by status if specified
    const filteredApplications = status === 'all' 
        ? applications 
        : applications.filter(app => app.status === status);
    
    const applicationsGrid = document.getElementById('applicationsGrid');
    applicationsGrid.innerHTML = '';
    
    if (filteredApplications.length === 0) {
        applicationsGrid.innerHTML = '<p class="no-applications">No applications found.</p>';
        return;
    }
    
    // Sort applications by date (newest first)
    filteredApplications.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredApplications.forEach(application => {
        // Find the hostel and user for this application
        const hostel = hostels.find(h => h.id === application.hostelId);
        const user = users.find(u => u.id === application.userId);
        
        const applicationCard = document.createElement('div');
        applicationCard.className = 'application-card';
        
        const statusClass = getStatusClass(application.status);
        
        applicationCard.innerHTML = `
            <div class="application-info">
                <h3>Application #${application.id}</h3>
                <p><strong>Student:</strong> ${user ? user.fullName : 'Unknown Student'}</p>
                <p><strong>Hostel:</strong> ${hostel ? hostel.name : 'Unknown Hostel'}</p>
                <p><strong>Room:</strong> ${application.roomNumber || 'Unknown Room'}</p>
                <p><strong>Status:</strong> <span class="status ${statusClass}">${application.status}</span></p>
                <p><strong>Applied:</strong> ${new Date(application.date).toLocaleDateString()}</p>
                ${application.processedDate ? 
                    `<p><strong>Processed:</strong> ${new Date(application.processedDate).toLocaleDateString()}</p>` 
                    : ''}
            </div>
            <div class="application-actions">
                ${application.status === 'pending' ? `
                    <button class="btn" onclick="updateApplicationStatus(${application.id}, 'approved')">Approve</button>
                    <button class="btn" onclick="updateApplicationStatus(${application.id}, 'rejected')">Reject</button>
                ` : ''}
            </div>
        `;
        
        applicationsGrid.appendChild(applicationCard);
    });
}

// Update application status
function updateApplicationStatus(applicationId, newStatus) {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const application = applications.find(app => app.id === applicationId);
    
    if (application) {
        application.status = newStatus;
        application.processedDate = new Date().toISOString();
        localStorage.setItem('applications', JSON.stringify(applications));
        
        // Reload applications
        loadApplications();
        loadApplicationsSummary();
    }
}

// Load all hostels
function loadHostels() {
    if (!checkAuth()) return;
    
    const hostels = JSON.parse(localStorage.getItem('hostels')) || [];
    const hostelsGrid = document.getElementById('hostelsGrid');
    hostelsGrid.innerHTML = '';
    
    if (hostels.length === 0) {
        hostelsGrid.innerHTML = '<p class="no-hostels">No hostels found.</p>';
        return;
    }
    
    hostels.forEach(hostel => {
        const hostelCard = createHostelCard(hostel);
        hostelsGrid.appendChild(hostelCard);
    });
}

// Create hostel card element
function createHostelCard(hostel) {
    const card = document.createElement('div');
    card.className = 'hostel-card';
    
    card.innerHTML = `
        <h3>${hostel.name}</h3>
        <p>${hostel.description}</p>
        <p><strong>Address:</strong> ${hostel.address}</p>
        <p><strong>Total Rooms:</strong> ${hostel.total_rooms}</p>
        <div class="action-buttons">
            <button class="btn" onclick="editHostel(${hostel.id})">Edit</button>
            <button class="btn" onclick="deleteHostel(${hostel.id})">Delete</button>
        </div>
    `;
    
    return card;
}

// Show add hostel modal
function showAddHostelModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Add New Hostel</h2>
            <form id="addHostelForm">
                <div class="form-group">
                    <label for="hostelName">Hostel Name</label>
                    <input type="text" id="hostelName" required>
                </div>
                <div class="form-group">
                    <label for="hostelDescription">Description</label>
                    <textarea id="hostelDescription" required></textarea>
                </div>
                <div class="form-group">
                    <label for="hostelAddress">Address</label>
                    <input type="text" id="hostelAddress" required>
                </div>
                <div class="form-group">
                    <label for="totalRooms">Total Rooms</label>
                    <input type="number" id="totalRooms" required>
                </div>
                <button type="submit" class="btn">Add Hostel</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.remove();
    };
    
    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    };
    
    // Handle form submission
    document.getElementById('addHostelForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newHostel = {
            id: Date.now(),
            name: document.getElementById('hostelName').value,
            description: document.getElementById('hostelDescription').value,
            address: document.getElementById('hostelAddress').value,
            total_rooms: parseInt(document.getElementById('totalRooms').value),
            rooms: []
        };
        
        // Add hostel to storage
        const hostels = JSON.parse(localStorage.getItem('hostels')) || [];
        hostels.push(newHostel);
        localStorage.setItem('hostels', JSON.stringify(hostels));
        
        // Close modal and reload hostels
        modal.remove();
        loadHostels();
        loadHostelsSummary();
    });
}

// Edit hostel
function editHostel(hostelId) {
    const hostels = JSON.parse(localStorage.getItem('hostels')) || [];
    const hostel = hostels.find(h => h.id === hostelId);
    
    if (!hostel) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Edit Hostel</h2>
            <form id="editHostelForm">
                <div class="form-group">
                    <label for="hostelName">Hostel Name</label>
                    <input type="text" id="hostelName" value="${hostel.name}" required>
                </div>
                <div class="form-group">
                    <label for="hostelDescription">Description</label>
                    <textarea id="hostelDescription" required>${hostel.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="hostelAddress">Address</label>
                    <input type="text" id="hostelAddress" value="${hostel.address}" required>
                </div>
                <div class="form-group">
                    <label for="totalRooms">Total Rooms</label>
                    <input type="number" id="totalRooms" value="${hostel.total_rooms}" required>
                </div>
                <button type="submit" class="btn">Save Changes</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.remove();
    };
    
    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    };
    
    // Handle form submission
    document.getElementById('editHostelForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Update hostel data
        hostel.name = document.getElementById('hostelName').value;
        hostel.description = document.getElementById('hostelDescription').value;
        hostel.address = document.getElementById('hostelAddress').value;
        hostel.total_rooms = parseInt(document.getElementById('totalRooms').value);
        
        // Save updated hostels
        localStorage.setItem('hostels', JSON.stringify(hostels));
        
        // Close modal and reload hostels
        modal.remove();
        loadHostels();
    });
}

// Delete hostel
function deleteHostel(hostelId) {
    if (confirm('Are you sure you want to delete this hostel?')) {
        const hostels = JSON.parse(localStorage.getItem('hostels')) || [];
        const updatedHostels = hostels.filter(h => h.id !== hostelId);
        localStorage.setItem('hostels', JSON.stringify(updatedHostels));
        
        loadHostels();
        loadHostelsSummary();
    }
}

// Get status class for styling
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'status-pending';
        case 'approved':
            return 'status-approved';
        case 'rejected':
            return 'status-rejected';
        default:
            return '';
    }
}

// Filter applications by status
function filterApplications(status) {
    loadApplications(status);
}

// Tab switching
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
            
            // Load data based on tab
            if (tabId === 'applications') {
                loadApplications();
            } else if (tabId === 'hostels') {
                loadHostels();
            }
        });
    });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadProfile();
        loadApplicationsSummary();
        loadHostelsSummary();
        loadApplications();
        setupTabs();
    }
    
    // Add event listener for logout button
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
});

function loadApplications() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const applicationsList = document.getElementById('applicationsList');
    applicationsList.innerHTML = '';

    applications.forEach(application => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title">${application.studentName}</h5>
                    <span class="badge ${getStatusClass(application.status)}">${application.status}</span>
                </div>
                <p class="card-text">
                    <strong>Student ID:</strong> ${application.studentId}<br>
                    <strong>Room:</strong> ${application.roomType}<br>
                    <strong>Date:</strong> ${new Date(application.date).toLocaleDateString()}<br>
                    <strong>Reason:</strong> ${application.reason}
                </p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success" onclick="updateApplicationStatus(${application.id}, 'approved')" ${application.status === 'approved' ? 'disabled' : ''}>
                            Approve
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="updateApplicationStatus(${application.id}, 'rejected')" ${application.status === 'rejected' ? 'disabled' : ''}>
                            Reject
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteApplication(${application.id})">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        applicationsList.appendChild(card);
    });
}

function deleteApplication(applicationId) {
    if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
        const applications = JSON.parse(localStorage.getItem('applications')) || [];
        const updatedApplications = applications.filter(app => app.id !== applicationId);
        localStorage.setItem('applications', JSON.stringify(updatedApplications));
        
        // Reload applications and summary
        loadApplications();
        loadApplicationsSummary();
        
        alert('Application deleted successfully');
    }
} 
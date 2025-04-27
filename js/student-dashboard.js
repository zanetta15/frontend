// API URL
const API_URL = 'http://localhost:5000/api';

// Check if user is logged in and is a student
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Load student profile information
function loadProfile() {
    if (!checkAuth()) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Display student name
    document.getElementById('studentName').textContent = currentUser.fullName || 'Student';
    
    // Display profile information
    document.getElementById('profileName').textContent = currentUser.fullName || '-';
    document.getElementById('profileEmail').textContent = currentUser.email || '-';
    document.getElementById('profilePhone').textContent = currentUser.phone || '-';
    document.getElementById('profileStudentId').textContent = currentUser.studentId || '-';
}

// Load applications summary
function loadApplicationsSummary() {
    if (!checkAuth()) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    
    // Filter applications for current user
    const userApplications = applications.filter(app => app.userId === currentUser.id);
    
    // Count applications by status
    const totalApplications = userApplications.length;
    const pendingApplications = userApplications.filter(app => app.status === 'pending').length;
    const approvedApplications = userApplications.filter(app => app.status === 'approved').length;
    
    // Update summary cards
    document.getElementById('totalApplications').textContent = totalApplications;
    document.getElementById('pendingApplications').textContent = pendingApplications;
    document.getElementById('approvedApplications').textContent = approvedApplications;
}

// Load all applications
function loadApplications() {
    if (!checkAuth()) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const hostels = JSON.parse(localStorage.getItem('hostels')) || [];
    
    // Filter applications for current user
    const userApplications = applications.filter(app => app.userId === currentUser.id);
    
    const applicationsGrid = document.getElementById('applicationsGrid');
    applicationsGrid.innerHTML = '';
    
    if (userApplications.length === 0) {
        applicationsGrid.innerHTML = '<p class="no-applications">No applications found.</p>';
        return;
    }
    
    // Sort applications by date (newest first)
    userApplications.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    userApplications.forEach(application => {
        // Find the hostel for this application
        const hostel = hostels.find(h => h.id === application.hostelId);
        
        const applicationCard = document.createElement('div');
        applicationCard.className = 'application-card';
        
        const statusClass = getStatusClass(application.status);
        
        applicationCard.innerHTML = `
            <div class="application-info">
                <h3>Application #${application.id}</h3>
                <p><strong>Hostel:</strong> ${hostel ? hostel.name : 'Unknown Hostel'}</p>
                <p><strong>Room:</strong> ${application.roomNumber || 'Unknown Room'}</p>
                <p><strong>Status:</strong> <span class="status ${statusClass}">${application.status}</span></p>
                <p><strong>Applied:</strong> ${new Date(application.date).toLocaleDateString()}</p>
                ${application.processedDate ? 
                    `<p><strong>Processed:</strong> ${new Date(application.processedDate).toLocaleDateString()}</p>` 
                    : ''}
            </div>
        `;
        
        applicationsGrid.appendChild(applicationCard);
    });
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
    
    // Get image based on room type
    const imageSrc = getHostelImage(hostel);
    
    card.innerHTML = `
        <img src="${imageSrc}" alt="${hostel.name}">
        <div class="hostel-info">
            <h3>${hostel.name}</h3>
            <p>${hostel.description}</p>
            <p><strong>Address:</strong> ${hostel.address}</p>
            <p><strong>Total Rooms:</strong> ${hostel.total_rooms}</p>
            <button class="btn" onclick="viewRooms(${hostel.id})">View Rooms</button>
        </div>
    `;
    
    return card;
}

// Get appropriate image for hostel
function getHostelImage(hostel) {
    // Default image
    let imageSrc = 'images/hostel.jpeg';
    
    // Check if hostel has rooms
    if (hostel.rooms && hostel.rooms.length > 0) {
        // Get the first room to determine type
        const firstRoom = hostel.rooms[0];
        
        // Map room types to images
        switch (firstRoom.room_type.toLowerCase()) {
            case 'single':
                imageSrc = 'images/one in a room.jpeg';
                break;
            case 'double':
                imageSrc = 'images/2 in a room.jpg';
                break;
            case 'triple':
                imageSrc = 'images/3 in a room.jpeg';
                break;
            case 'quad':
                imageSrc = 'images/4 in a room.jpeg';
                break;
            case 'suite':
                imageSrc = 'images/Suite.webp';
                break;
            default:
                // Check capacity for other room types
                if (firstRoom.capacity >= 6) {
                    imageSrc = 'images/6 in a room.jpg';
                } else if (firstRoom.capacity >= 4) {
                    imageSrc = 'images/4 in a room.jpeg';
                }
        }
    }
    
    return imageSrc;
}

// View rooms in a hostel
function viewRooms(hostelId) {
    const hostels = JSON.parse(localStorage.getItem('hostels'));
    const hostel = hostels.find(h => h.id === hostelId);
    
    if (!hostel) {
        alert('Hostel not found');
        return;
    }
    
    // Create modal to display rooms
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Available Rooms in ${hostel.name}</h2>
            <div class="room-grid">
                ${hostel.rooms.map(room => `
                    <div class="room-card">
                        <img src="${getRoomImage(room)}" alt="Room ${room.room_number}">
                        <h3>Room ${room.room_number}</h3>
                        <p><strong>Type:</strong> ${room.room_type}</p>
                        <p><strong>Capacity:</strong> ${room.capacity}</p>
                        <p><strong>Current Occupancy:</strong> ${room.current_occupancy}</p>
                        <p><strong>Price:</strong> $${room.price}</p>
                        <button class="btn" onclick="applyForRoom(${room.id})" 
                            ${room.current_occupancy >= room.capacity ? 'disabled' : ''}>
                            ${room.current_occupancy >= room.capacity ? 'Full' : 'Apply'}
                        </button>
                    </div>
                `).join('')}
            </div>
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
}

// Get appropriate image for room
function getRoomImage(room) {
    // Map room types to images
    switch (room.room_type.toLowerCase()) {
        case 'single':
            return 'images/one in a room.jpeg';
        case 'double':
            return 'images/2 in a room.jpg';
        case 'triple':
            return 'images/3 in a room.jpeg';
        case 'quad':
            return 'images/4 in a room.jpeg';
        case 'suite':
            return 'images/Suite.webp';
        default:
            // Check capacity for other room types
            if (room.capacity >= 6) {
                return 'images/6 in a room.jpg';
            } else if (room.capacity >= 4) {
                return 'images/4 in a room.jpeg';
            } else if (room.capacity >= 2) {
                return 'images/2 in a room.jpg';
            } else {
                return 'images/one in a room.jpeg';
            }
    }
}

// Apply for a room
function applyForRoom(roomId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please login to apply for a room');
        window.location.href = 'login.html';
        return;
    }
    
    const hostels = JSON.parse(localStorage.getItem('hostels'));
    const applications = JSON.parse(localStorage.getItem('applications'));
    
    // Find the room and its hostel
    let targetRoom;
    let targetHostel;
    for (const hostel of hostels) {
        const room = hostel.rooms.find(r => r.id === roomId);
        if (room) {
            targetRoom = room;
            targetHostel = hostel;
            break;
        }
    }
    
    if (!targetRoom || !targetHostel) {
        alert('Room not found');
        return;
    }
    
    // Check if room is full
    if (targetRoom.current_occupancy >= targetRoom.capacity) {
        alert('This room is already full');
        return;
    }
    
    // Check if user already has an application for this room
    const existingApplication = applications.find(
        app => app.userId === currentUser.id && app.roomId === roomId
    );
    
    if (existingApplication) {
        alert('You have already applied for this room');
        return;
    }
    
    // Create new application
    const newApplication = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.fullName,
        hostelId: targetHostel.id,
        hostelName: targetHostel.name,
        roomId: roomId,
        roomNumber: targetRoom.room_number,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    // Add application to storage
    applications.push(newApplication);
    localStorage.setItem('applications', JSON.stringify(applications));
    
    alert('Application submitted successfully');
    
    // Close the modal if it exists
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    
    // Reload applications
    loadApplications();
    loadApplicationsSummary();
}

// Edit profile
function editProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Create modal for editing
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Edit Profile</h2>
            <form id="editProfileForm">
                <div class="form-group">
                    <label for="fullName">Full Name</label>
                    <input type="text" id="fullName" value="${currentUser.fullName || ''}" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" value="${currentUser.email || ''}" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone</label>
                    <input type="tel" id="phone" value="${currentUser.phone || ''}" required>
                </div>
                <div class="form-group">
                    <label for="studentId">Student ID</label>
                    <input type="text" id="studentId" value="${currentUser.studentId || ''}" required>
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
    document.getElementById('editProfileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Update user data
        currentUser.fullName = document.getElementById('fullName').value;
        currentUser.email = document.getElementById('email').value;
        currentUser.phone = document.getElementById('phone').value;
        currentUser.studentId = document.getElementById('studentId').value;
        
        // Save updated user
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Close modal and reload profile
        modal.remove();
        loadProfile();
        
        alert('Profile updated successfully');
    });
}

// Change password
function changePassword() {
    // Create modal for changing password
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Change Password</h2>
            <form id="changePasswordForm">
                <div class="form-group">
                    <label for="currentPassword">Current Password</label>
                    <input type="password" id="currentPassword" required>
                </div>
                <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <input type="password" id="newPassword" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm New Password</label>
                    <input type="password" id="confirmPassword" required>
                </div>
                <button type="submit" class="btn">Change Password</button>
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
    document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        // In a real application, you would verify the current password with the server
        // For this demo, we'll just update the password in localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Close modal
        modal.remove();
        
        alert('Password changed successfully');
    });
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
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
        loadApplications();
        setupTabs();
    }
}); 
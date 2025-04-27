// Load user's applications
function loadApplications() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const userApplications = applications.filter(app => app.userId === currentUser.id);
    
    const applicationsGrid = document.getElementById('applicationsGrid');
    applicationsGrid.innerHTML = '';
    
    if (userApplications.length === 0) {
        applicationsGrid.innerHTML = '<p class="no-applications">You have no applications yet.</p>';
        return;
    }
    
    userApplications.forEach(application => {
        const applicationCard = createApplicationCard(application);
        applicationsGrid.appendChild(applicationCard);
    });
}

// Create application card element
function createApplicationCard(application) {
    const card = document.createElement('div');
    card.className = 'application-card';
    
    const statusClass = getStatusClass(application.status);
    
    card.innerHTML = `
        <div class="application-info">
            <h3>Application #${application.id}</h3>
            <p><strong>Hostel:</strong> ${application.hostelName}</p>
            <p><strong>Room:</strong> ${application.roomNumber}</p>
            <p><strong>Status:</strong> <span class="status ${statusClass}">${application.status}</span></p>
            <p><strong>Applied:</strong> ${new Date(application.date).toLocaleDateString()}</p>
            ${application.processedDate ? 
                `<p><strong>Processed:</strong> ${new Date(application.processedDate).toLocaleDateString()}</p>` 
                : ''}
        </div>
    `;
    
    return card;
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

// Add event listener to load applications when page loads
document.addEventListener('DOMContentLoaded', loadApplications); 
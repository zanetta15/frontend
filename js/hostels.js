// Initialize hostels data structure if it doesn't exist
if (!localStorage.getItem('hostels')) {
    const initialHostels = [
        {
            id: 1,
            name: "University Hostel A",
            description: "Modern hostel with great amenities",
            address: "123 University Ave",
            total_rooms: 50,
            rooms: [
                {
                    id: 1,
                    room_number: "101",
                    room_type: "Single",
                    capacity: 1,
                    current_occupancy: 0,
                    price: 500
                },
                {
                    id: 2,
                    room_number: "102",
                    room_type: "Double",
                    capacity: 2,
                    current_occupancy: 1,
                    price: 400
                }
            ]
        },
        {
            id: 2,
            name: "Student Residence B",
            description: "Cozy and affordable accommodation",
            address: "456 College Street",
            total_rooms: 30,
            rooms: [
                {
                    id: 3,
                    room_number: "201",
                    room_type: "Single",
                    capacity: 1,
                    current_occupancy: 0,
                    price: 450
                },
                {
                    id: 4,
                    room_number: "202",
                    room_type: "Triple",
                    capacity: 3,
                    current_occupancy: 2,
                    price: 300
                }
            ]
        }
    ];
    localStorage.setItem('hostels', JSON.stringify(initialHostels));
}

// Initialize applications if it doesn't exist
if (!localStorage.getItem('applications')) {
    localStorage.setItem('applications', JSON.stringify([]));
}

// Fetch and display hostels
function loadHostels() {
    const hostels = JSON.parse(localStorage.getItem('hostels'));
    const hostelGrid = document.getElementById('hostelGrid');
    hostelGrid.innerHTML = '';

    hostels.forEach(hostel => {
        const hostelCard = createHostelCard(hostel);
        hostelGrid.appendChild(hostelCard);
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
    window.location.href = 'my-applications.html';
}

// Filter hostels
function filterHostels() {
    const roomType = document.getElementById('roomType').value;
    const priceRange = document.getElementById('priceRange').value;
    
    const hostels = JSON.parse(localStorage.getItem('hostels'));
    const hostelGrid = document.getElementById('hostelGrid');
    hostelGrid.innerHTML = '';
    
    hostels.forEach(hostel => {
        // Filter rooms based on criteria
        const filteredRooms = hostel.rooms.filter(room => {
            const matchesType = roomType === 'all' || room.room_type === roomType;
            const matchesPrice = priceRange === 'all' || 
                (priceRange === 'low' && room.price <= 400) ||
                (priceRange === 'medium' && room.price > 400 && room.price <= 600) ||
                (priceRange === 'high' && room.price > 600);
            return matchesType && matchesPrice;
        });
        
        // Only show hostel if it has rooms matching the criteria
        if (filteredRooms.length > 0) {
            const hostelCard = createHostelCard(hostel);
            hostelGrid.appendChild(hostelCard);
        }
    });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadHostels();
    
    // Add filter event listeners
    document.getElementById('roomType')?.addEventListener('change', filterHostels);
    document.getElementById('priceRange')?.addEventListener('change', filterHostels);
}); 
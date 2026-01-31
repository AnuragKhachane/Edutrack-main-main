// Application Data
const appData = {
  "students": [
    {"id": 1, "name": "Alice Johnson", "email": "alice@edu.com", "class": "CS101", "attendance": 85, "faceRegistered": true, "rollNo": "S001"},
    {"id": 2, "name": "Bob Smith", "email": "bob@edu.com", "class": "CS101", "attendance": 92, "faceRegistered": true, "rollNo": "S002"},
    {"id": 3, "name": "Carol Davis", "email": "carol@edu.com", "class": "CS101", "attendance": 78, "faceRegistered": false, "rollNo": "S003"},
    {"id": 4, "name": "David Wilson", "email": "david@edu.com", "class": "CS102", "attendance": 90, "faceRegistered": true, "rollNo": "S004"},
    {"id": 5, "name": "Emma Student", "email": "emma@student.edu", "class": "MATH101", "attendance": 94, "faceRegistered": true, "rollNo": "S005"},
    {"id": 6, "name": "Frank Miller", "email": "frank@edu.com", "class": "PHYS101", "attendance": 88, "faceRegistered": true, "rollNo": "S006"}
  ],
  "teachers": [
    {"id": 1, "name": "Dr. Sarah Brown", "email": "sarah@edu.com", "subjects": ["Computer Science - CS101", "Data Structures - CS102"], "faceRegistered": true, "username": "teacher"},
    {"id": 2, "name": "Prof. Mike Johnson", "email": "mike@edu.com", "subjects": ["Mathematics - MATH101", "Statistics - STAT101"], "faceRegistered": true, "username": "teacher2"},
    {"id": 3, "name": "Dr. Lisa Wilson", "email": "lisa@edu.com", "subjects": ["Physics - PHYS101", "Chemistry - CHEM101"], "faceRegistered": true, "username": "teacher3"}
  ],
  "classes": [
    {"id": "CS101", "name": "Computer Science", "fullName": "Introduction to Programming", "teacher": "Dr. Sarah Brown", "students": 25, "schedule": "Mon-Wed-Fri 9:00 AM", "room": "Room 101", "geofence": { "lat": 18.5204, "long": 73.8567, "radius": 100 } }, // Pune, India center for mock testing (100m radius)
    {"id": "CS102", "name": "Data Structures", "fullName": "Advanced Data Structures", "teacher": "Dr. Sarah Brown", "students": 20, "schedule": "Tue-Thu 10:00 AM", "room": "Lab 201", "geofence": { "lat": 18.5204, "long": 73.8567, "radius": 50 } }, // Same location, smaller radius
    {"id": "MATH101", "name": "Mathematics", "fullName": "Calculus I", "teacher": "Prof. Mike Johnson", "students": 30, "schedule": "Mon-Wed-Fri 11:00 AM", "room": "Room 202", "geofence": { "lat": 18.5204, "long": 73.8567, "radius": 500 } }, 
    {"id": "PHYS101", "name": "Physics", "fullName": "General Physics I", "teacher": "Dr. Lisa Wilson", "students": 28, "schedule": "Tue-Thu 2:00 PM", "room": "Lab 301", "geofence": null }, // No geofence defined
    {"id": "STAT101", "name": "Statistics", "fullName": "Applied Statistics", "teacher": "Prof. Mike Johnson", "students": 22, "schedule": "Mon-Wed 3:00 PM", "room": "Room 203"},
    {"id": "CHEM101", "name": "Chemistry", "fullName": "General Chemistry I", "teacher": "Dr. Lisa Wilson", "students": 26, "schedule": "Tue-Thu 1:00 PM", "room": "Lab 302"}
  ],
  "sessions": [
    {"id": 1, "teacherId": 1, "classId": "CS101", "status": "active", "startTime": "2025-09-19T09:00:00", "duration": 90},
    {"id": 2, "teacherId": 2, "classId": "MATH101", "status": "completed", "startTime": "2025-09-18T11:00:00", "endTime": "2025-09-18T12:30:00", "duration": 90}
  ],
  "attendanceRecords": [
    {"date": "2025-09-19", "student": "Alice Johnson", "class": "CS101", "status": "Present", "method": "Face Recognition", "confidence": 95.2, "sessionId": 1},
    {"date": "2025-09-19", "student": "Bob Smith", "class": "CS101", "status": "Present", "method": "Face Recognition", "confidence": 92.8, "sessionId": 1},
    {"date": "2025-09-18", "student": "Emma Student", "class": "MATH101", "status": "Present", "method": "Manual", "confidence": null, "sessionId": 2}
  ],
  "credentials": {
    "student": {"username": "student", "password": "student123"},
    "teacher": {"username": "teacher", "password": "teacher123"},
    "administrator": {"username": "admin", "password": "admin123"}
  },
  "faceRecognitionSettings": {
    "confidenceThreshold": 85,
    "livenessDetection": true,
    "multipleAngleVerification": false,
    "lightingCheck": true
  },
  "systemStats": {
    "totalStudents": 450,
    "totalTeachers": 25,
    "totalClasses": 12,
    "overallAttendanceRate": 89.5,
    "activeUsers": 423,
    "faceRegisteredCount": 380
  }
};

// Application State
let currentUser = null;
let currentRole = null;
let currentView = 'dashboardView';
let cameraInterval = null;
let confidenceSimulation = null;
let activeSession = null;
let sessionTimer = null;
let selectedSubjects = [];

// Geolocation State
let userLocation = null; // Stores { latitude, longitude, accuracy }
let userFaceVerified = false; // Tracks if face was verified (true after detectFaceForAttendance success)

// Face-API.js specific variables
let faceApiInitialized = false;
let faceMatcher = null;
let registeredDescriptor = null;
let faceDetectionInterval = null;

// DOM Elements for Camera (Ensure IDs exist in HTML) - Initialized once at the top
const videoFeed = document.getElementById('videoFeed');
const detectionCanvas = document.getElementById('detectionCanvas');
const initialPrompt = document.getElementById('initialPrompt');
const locationStatusElement = document.getElementById('locationStatus');
const locationCoordsElement = document.getElementById('locationCoords'); 


// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    showWelcomeScreen();
    setupEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const cameraTimeElement = document.getElementById('cameraTime');
    if (cameraTimeElement) {
        cameraTimeElement.textContent = timeString;
    }
}

function setupEventListeners() {
    // Role selection - Fixed event listener
    document.addEventListener('click', function(e) {
        if (e.target.closest('.role-card')) {
            const roleCard = e.target.closest('.role-card');
            const role = roleCard.dataset.role;
            console.log('Role selected:', role); // Debug log
            selectRole(role);
        }
    });

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Navigation
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-view]')) {
            e.preventDefault();
            switchView(e.target.dataset.view);
        }
    });
    
    // Student Details
    document.addEventListener('click', function(e) {
        if (e.target.closest('.view-details-btn')) {
            const studentId = e.target.closest('.view-details-btn').dataset.id;
            renderStudentDetails(parseInt(studentId));
        }
    });

    // START SESSION Button (in modal)
    const confirmStartSessionBtn = document.getElementById('confirmStartSession');
    if (confirmStartSessionBtn) {
        confirmStartSessionBtn.addEventListener('click', confirmStartSession);
    }
    
    // SAVE SETTINGS Button (in settings view)
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        // Since the button is dynamically rendered, we attach the listener to the view container
        document.getElementById('settingsContent').addEventListener('click', function(e) {
            if (e.target.id === 'saveSettingsBtn') {
                saveSettings();
            }
        });
    }

    // Camera button listeners
    const startCameraBtn = document.getElementById('startCameraBtn');
    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', startCamera);
    }
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
        captureBtn.addEventListener('click', capturePhoto);
    }
    const retakeBtn = document.getElementById('retakeBtn');
    if (retakeBtn) {
        retakeBtn.addEventListener('click', retakePhoto);
    }
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmAttendance);
    }
    const cancelCameraBtn = document.getElementById('cancelCameraBtn');
    if (cancelCameraBtn) {
        cancelCameraBtn.addEventListener('click', closeCameraModal);
    }
}

// Screen Navigation
function showScreen(screenId) {
    console.log('Showing screen:', screenId); // Debug log
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('Screen activated:', screenId); // Debug log
    } else {
        console.error('Screen not found:', screenId); // Debug log
    }
}

function showWelcomeScreen() {
    showScreen('welcomeScreen');
}

function showLoginScreen() {
    showScreen('loginScreen');
}

function showMainApp() {
    showScreen('mainApp');
}

// Role Selection
function selectRole(role) {
    console.log('selectRole called with:', role); // Debug log
    currentRole = role;
    updateLoginCredentials(role);
    
    // Add visual feedback for role selection
    document.querySelectorAll('.role-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-role="${role}"]`).classList.add('selected');
    
    // Small delay to show selection feedback, then navigate
    setTimeout(() => {
        showLoginScreen();
    }, 300);
}

function updateLoginCredentials(role) {
    const roleDescriptions = {
        student: 'Sign in as Student',
        teacher: 'Sign in as Teacher', 
        administrator: 'Sign in as Administrator'
    };
    
    const roleDescElement = document.getElementById('roleDescription');
    const demoUsernameElement = document.getElementById('demoUsername');
    const demoPasswordElement = document.getElementById('demoPassword');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (roleDescElement) {
        roleDescElement.textContent = roleDescriptions[role] || 'Sign in';
    }
    
    const credentials = appData.credentials[role];
    if (credentials) {
        if (demoUsernameElement) demoUsernameElement.textContent = credentials.username;
        if (demoPasswordElement) demoPasswordElement.textContent = credentials.password;
        
        // Auto-fill credentials for demo
        if (usernameInput) usernameInput.value = credentials.username;
        if (passwordInput) passwordInput.value = credentials.password;
    }
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Login attempt:', username, 'for role:', currentRole); // Debug log
    
    const credentials = appData.credentials[currentRole];
    
    if (username === credentials.username && password === credentials.password) {
        // Set current user based on role
        if (currentRole === 'student') {
            currentUser = appData.students[4]; // Emma Student
        } else if (currentRole === 'teacher') {
            currentUser = appData.teachers[0]; // Dr. Sarah Brown
        } else {
            currentUser = { name: 'System Administrator', role: 'administrator' };
        }
        
        console.log('Login successful, current user:', currentUser); // Debug log
        showMainApp();
        setupNavigation();
        switchView('dashboardView');
        updateUserWelcome();
        initializeActiveSession();
    } else {
        alert('Invalid credentials. Please use the demo credentials provided.');
    }
}

function updateUserWelcome() {
    const welcomeText = `Welcome, ${currentUser.name}!`;
    const welcomeElement = document.getElementById('userWelcome');
    if (welcomeElement) {
        welcomeElement.textContent = welcomeText;
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    currentView = 'dashboardView';
    activeSession = null;
    selectedSubjects = [];
    if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
    }
    showWelcomeScreen();
}

// Session Management Functions
function initializeActiveSession() {
    // We keep this to initialize the activeSession variable if one exists in the mock data
    if (currentRole === 'teacher') {
        const teacherSessions = appData.sessions.filter(s => s.teacherId === currentUser.id && s.status === 'active');
        if (teacherSessions.length > 0) {
            activeSession = teacherSessions[0];
            startSessionTimer();
        }
    }
}

/**
 * Opens the Start Session modal.
 */
function openStartSessionModal() {
    if (currentRole !== 'teacher') {
        showAlert('error', 'Only teachers can start sessions.');
        return;
    }
    
    // Prefill the current time
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timeInput = document.getElementById('sessionTime');
    if (timeInput) {
        timeInput.value = timeString;
    }

    // Reset validation state before opening
    const form = document.getElementById('newSessionForm');
    if(form) {
        form.classList.remove('was-validated');
    }

    const modal = new bootstrap.Modal(document.getElementById('startSessionModal'));
    modal.show();
}

/**
 * Confirms session details, creates a new session object, and sets it as active.
 * Ends any existing active session before creating the new one.
 */
function confirmStartSession() {
    const subjectInput = document.getElementById('sessionSubject');
    const roomInput = document.getElementById('sessionRoom');
    const timeInput = document.getElementById('sessionTime');
    const durationInput = document.getElementById('sessionDuration');
    const form = document.getElementById('newSessionForm');

    // Form validation
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        showAlert('warning', 'Please fill in all required session details.');
        return;
    }
    
    // --- Prototype Fix: End any existing active session gracefully ---
    if (activeSession) {
        // If an old session is active, stop its timer and mark it complete before starting the new one
        activeSession.status = 'completed';
        activeSession.endTime = new Date().toISOString();
        if (sessionTimer) clearInterval(sessionTimer);
        sessionTimer = null;
        // Find the index of the class/session entry added dynamically and remove it
        const classIndex = appData.classes.findIndex(c => c.id === activeSession.classId);
        if (classIndex !== -1) {
             appData.classes.splice(classIndex, 1);
        }
        showAlert('info', `Previous session (${activeSession.subjectName}) was ended.`);
    }
    // ---------------------------------------------------

    // Calculate start time based on today's date and the time input
    const now = new Date();
    const [hours, minutes] = timeInput.value.split(':');
    now.setHours(parseInt(hours, 10));
    now.setMinutes(parseInt(minutes, 10));
    now.setSeconds(0);
    now.setMilliseconds(0);

    // Create new session object
    const newSessionId = Math.max(...appData.sessions.map(s => s.id)) + 1;
    
    // IMPORTANT: Generate a mock ID for the class and use the manual subject name
    const newClassId = subjectInput.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8) + Math.floor(Math.random() * 100);

    activeSession = {
        id: newSessionId,
        teacherId: currentUser.id,
        classId: newClassId, // Use the generated ID
        status: 'active',
        startTime: now.toISOString(),
        duration: parseInt(durationInput.value, 10),
        room: roomInput.value,
        subjectName: subjectInput.value // Use the manually entered subject name for display
    };
    
    // Also push a new mock class object to appData.classes so it can be looked up by renderTeacherDashboard
    // This is the CRITICAL STEP to make the new session appear in "My Classes"
    appData.classes.push({
        id: activeSession.classId,
        name: activeSession.subjectName,
        fullName: activeSession.subjectName,
        teacher: currentUser.name,
        students: 30, // Mock student count
        schedule: `${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`, 
        room: activeSession.room
    });

    // Add to sessions data
    appData.sessions.push(activeSession);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('startSessionModal'));
    modal.hide();
    
    // Start session timer
    startSessionTimer();
    
    // Show success message
    showAlert('success', `Session for ${activeSession.subjectName} started successfully in ${activeSession.room}!`);
    
    // Refresh dashboard to show active session
    renderDashboard();
    
    // Reset validation state
    form.classList.remove('was-validated');
}

function startSessionTimer() {
    if (!activeSession) return;
    
    sessionTimer = setInterval(() => {
        const sessionIndicator = document.querySelector('.session-timer');
        if (sessionIndicator) {
            sessionIndicator.textContent = `${getTimeElapsed(activeSession.startTime)} elapsed`;
        }
    }, 60000); // Update every minute
}


function endSession() {
    if (!activeSession) {
        showAlert('warning', 'No active session to end.');
        return;
    }

    Swal.fire({
        title: 'End Session?',
        text: "Are you sure you want to end the current session?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, end it!'
    }).then((result) => {
        if (result.isConfirmed) {
            activeSession.status = 'completed';
            activeSession.endTime = new Date().toISOString();

            const sessionIndex = appData.sessions.findIndex(s => s.id === activeSession.id);
            if (sessionIndex !== -1) {
                appData.sessions[sessionIndex] = activeSession;
            }

            activeSession = null;
            if (sessionTimer) {
                clearInterval(sessionTimer);
                sessionTimer = null;
            }

            showAlert('info', 'Session ended successfully!');
            renderDashboard();
        }
    });
}
// Navigation Setup
function setupNavigation() {
    const navItems = getNavigationItems();
    const sidebar = document.getElementById('sidebarNav');
    
    if (sidebar) {
        sidebar.innerHTML = navItems.map(item => `
            <li class="nav-item">
                <a class="nav-link ${item.active ? 'active' : ''}" href="#" data-view="${item.view}">
                    <i class="${item.icon} me-2"></i>${item.label}
                </a>
            </li>
        `).join('');
    }
}

function getNavigationItems() {
    const commonItems = [
        { label: 'Dashboard', icon: 'bi bi-house-door', view: 'dashboardView', active: true }
    ];
    
    if (currentRole === 'student') {
        return [
            ...commonItems,
            { label: 'Mark Attendance', icon: 'bi bi-camera-video', view: 'attendanceView', active: false },
            { label: 'My Analytics', icon: 'bi bi-graph-up', view: 'analyticsView', active: false }
        ];
    } else if (currentRole === 'teacher') {
        return [
            ...commonItems,
            { label: 'Manage Attendance', icon: 'bi bi-person-check', view: 'attendanceView', active: false },
            { label: 'Students', icon: 'bi bi-people', view: 'studentsView', active: false },
            { label: 'Reports', icon: 'bi bi-graph-up', view: 'analyticsView', active: false }
        ];
    } else {
        return [
            ...commonItems,
            { label: 'Students', icon: 'bi bi-people', view: 'studentsView', active: false },
            { label: 'Analytics', icon: 'bi bi-graph-up', view: 'analyticsView', active: false },
            { label: 'Settings', icon: 'bi bi-gear', view: 'settingsView', active: false }
        ];
    }
}

// View Management
function switchView(viewId) {
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeNavLink = document.querySelector(`[data-view="${viewId}"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }
    
    // Show selected view
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    currentView = viewId;
    
    // Render view content
    switch(viewId) {
        case 'dashboardView':
            renderDashboard();
            break;
        case 'attendanceView':
            renderAttendanceView();
            break;
        case 'studentsView':
            renderStudentsView();
            break;
        case 'studentDetailsView':
            // Don't re-render, this is handled by renderStudentDetails
            break;
        case 'analyticsView':
            renderAnalyticsView();
            break;
        case 'settingsView':
            renderSettingsView();
            break;
    }
}

// Dashboard Rendering
function renderDashboard() {
    const dashboard = document.getElementById('dashboardContent');
    if (!dashboard) return;
    
    if (currentRole === 'student') {
        dashboard.innerHTML = renderStudentDashboard();
    } else if (currentRole === 'teacher') {
        dashboard.innerHTML = renderTeacherDashboard();
    } else {
        dashboard.innerHTML = renderAdminDashboard();
    }
    
    // Initialize charts after rendering
    setTimeout(() => {
        if (currentRole === 'student') {
            renderStudentAttendanceChart();
        } else if (currentRole === 'teacher') {
            renderClassAttendanceChart();
        } else {
            renderSystemOverviewChart();
        }
    }, 100);
}

function renderStudentDashboard() {
    const student = currentUser;
    const recentRecords = appData.attendanceRecords.filter(r => r.student === student.name).slice(-5);
    
    return `
        <div class="row mb-4">
            <div class="col-12">
                <h2>Welcome back, ${student.name}!</h2>
                <p class="text-muted">Ready to mark your attendance today?</p>
            </div>
        </div>
        
        <div class="quick-actions mb-4">
            <div class="row">
                <div class="col-md-8">
                    <h4 class="mb-3">Quick Actions</h4>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <button class="action-btn w-100" onclick="openCameraModal()">
                                <i class="bi bi-camera-video-fill"></i>
                                <span>Mark Attendance</span>
                            </button>
                        </div>
                        <div class="col-md-6">
                            <a href="#" class="action-btn w-100" data-view="analyticsView">
                                <i class="bi bi-graph-up"></i>
                                <span>View Analytics</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="dashboard-card stat-card">
                        <div class="stat-icon">
                            <i class="bi bi-percent"></i>
                        </div>
                        <div class="stat-number">${student.attendance}%</div>
                        <div class="stat-label">Attendance Rate</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="dashboard-card p-3">
                    <h5 class="mb-3">Face Registration Status</h5>
                    <div class="face-status ${student.faceRegistered ? 'registered' : 'not-registered'}">
                        <i class="bi bi-${student.faceRegistered ? 'check-circle-fill' : 'exclamation-triangle-fill'}"></i>
                        <span>${student.faceRegistered ? 'Face Registered' : 'Face Not Registered'}</span>
                    </div>
                    ${!student.faceRegistered ? '<p class="text-muted mt-2 small">Please register your face for automatic attendance marking.</p>' : ''}
                </div>
            </div>
            <div class="col-md-6">
                <div class="dashboard-card p-3">
                    <h5 class="mb-3">Class Information</h5>
                    <div><strong>Class:</strong> ${student.class}</div>
                    <div><strong>Roll No:</strong> ${student.rollNo}</div>
                    <div><strong>Email:</strong> ${student.email}</div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="dashboard-card p-3">
                    <h5 class="mb-3">Attendance Trend</h5>
                    <div class="chart-container" style="height: 300px;">
                        <canvas id="studentChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="dashboard-card p-3">
                    <h5 class="mb-3">Recent Attendance</h5>
                    <div class="recent-attendance">
                        ${recentRecords.map(record => `
                            <div class="attendance-item">
                                <div>
                                    <div class="fw-medium">${record.date}</div>
                                    <div class="attendance-method">
                                        <i class="bi bi-${getMethodIcon(record.method)} method-icon"></i>
                                        <span>${record.method}</span>
                                    </div>
                                </div>
                                <span class="badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}">
                                    ${record.status}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTeacherDashboard() {
    const teacher = currentUser;

    // Collect all classes for this teacher
    let displayClasses = [];

    // 1. Add active session if exists
    if (activeSession && activeSession.status === 'active') {
        displayClasses.push({
            id: activeSession.classId,
            name: activeSession.subjectName,
            students: appData.classes.find(c => c.id === activeSession.classId)?.students || 30,
            schedule: `${new Date(activeSession.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (${activeSession.duration} min)`,
            room: activeSession.room,
            status: 'Active',
            isActive: true
        });
    }

    // 2. Add all completed sessions for this teacher
    const completedSessions = appData.sessions.filter(s => s.teacherId === teacher.id && s.status === 'completed');
    completedSessions.forEach(s => {
        displayClasses.push({
            id: s.classId,
            name: s.subjectName || appData.classes.find(c => c.id === s.classId)?.name || "TOC",
            students: appData.classes.find(c => c.id === s.classId)?.students || 30,
            schedule: `${new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
            room: s.room || "N/A",
            status: 'Completed',
            isActive: false
        });
    });

    // 3. Add static classes of this teacher
    const staticClasses = appData.classes.filter(c => c.teacher === teacher.name);
    staticClasses.forEach(c => {
        // Prevent duplicates if already added
        if (!displayClasses.some(dc => dc.id === c.id)) {
            displayClasses.push({
                id: c.id,
                name: c.name,
                students: c.students,
                schedule: c.schedule,
                room: c.room,
                status: 'Scheduled',
                isActive: false
            });
        }
    });

    return `
        <div class="row mb-4">
            <div class="col-12">
                <h2>Welcome back, ${teacher.name}!</h2>
                <p class="text-muted">Manage your classes and track student attendance.</p>
            </div>
        </div>
        
        <div class="session-panel mb-4">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h4 class="mb-3">
                        <i class="bi bi-broadcast me-2"></i>Session Management
                    </h4>
                    ${getSessionStatusDisplay()}
                </div>
                <div class="col-md-6 text-end">
                    ${activeSession ? 
                        `<button class="btn btn-outline-danger" onclick="endSession()">
                            <i class="bi bi-stop-circle me-2"></i>End Session
                        </button>` :
                        `<button class="btn btn--primary start-session-btn" onclick="openStartSessionModal()">
                            <i class="bi bi-play-circle me-2"></i>Start Session
                        </button>`
                    }
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-8">
                <div class="dashboard-card p-3">
                    <h5 class="mb-3">Class Attendance Overview</h5>
                    <div class="chart-container" style="height: 300px;">
                        <canvas id="teacherChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="dashboard-card p-3">
                    <h5 class="mb-3">My Classes</h5>
                    ${displayClasses.map(cls => `
                        <div class="class-item mb-3 p-3 border rounded ${cls.isActive ? 'border-primary bg-light active-class-card' : ''}">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="mb-1">${cls.name}</h6>
                                    <div class="small text-muted">
                                        <div><i class="bi bi-people me-1"></i>${cls.students} students</div>
                                        <div><i class="bi bi-clock me-1"></i>${cls.schedule}</div>
                                        <div><i class="bi bi-geo-alt me-1"></i>${cls.room}</div>
                                        <div><i class="bi bi-check2-circle me-1"></i>Status: ${cls.status}</div>
                                    </div>
                                </div>
                                ${cls.isActive ? 
                                    `<div class="active-session-indicator active-small"><i class="bi bi-broadcast"></i><span>Active</span></div>` : 
                                    ''
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}


function getTimeElapsed(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const elapsedMinutes = Math.floor((now - start) / 1000 / 60);
    if (elapsedMinutes < 60) {
        return `${elapsedMinutes}m`;
    }
    const hours = Math.floor(elapsedMinutes / 60);
    const minutes = elapsedMinutes % 60;
    return `${hours}h ${minutes}m`;
}

function getSessionStatusDisplay() {
    if (activeSession) {
        const className = activeSession.subjectName || appData.classes.find(c => c.id === activeSession.classId)?.name || 'TOC';
        
        return `
            <div class="active-session-indicator">
                <i class="bi bi-broadcast"></i>
                <span>Active Session: ${className}</span>
                <span class="session-timer">${getTimeElapsed(activeSession.startTime)} elapsed</span>
            </div>
        `;
    }
    
    return `
        <p class="text-muted mb-0">No active session. Click "Start Session" to begin attendance tracking.</p>
    `;
}

function renderAdminDashboard() {
    const stats = appData.systemStats;
    
    return `
        <div class="row mb-4">
            <div class="col-12">
                <h2>System Dashboard</h2>
                <p class="text-muted">Monitor system performance and manage users.</p>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="dashboard-card stat-card">
                    <div class="stat-icon">
                        <i class="bi bi-people"></i>
                    </div>
                    <div class="stat-number">${stats.totalStudents}</div>
                    <div class="stat-label">Total Students</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="dashboard-card stat-card">
                    <div class="stat-icon">
                        <i class="bi bi-person-badge"></i>
                    </div>
                    <div class="stat-number">${stats.totalTeachers}</div>
                    <div class="stat-label">Teachers</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="dashboard-card stat-card">
                    <div class="stat-icon">
                        <i class="bi bi-door-open"></i>
                    </div>
                    <div class="stat-number">${stats.totalClasses}</div>
                    <div class="stat-label">Active Classes</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="dashboard-card stat-card">
                    <div class="stat-icon">
                        <i class="bi bi-percent"></i>
                    </div>
                    <div class="stat-number">${stats.overallAttendanceRate}%</div>
                    <div class="stat-label">Overall Attendance</div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="dashboard-card stat-card">
                    <div class="stat-icon status-online">
                        <i class="bi bi-person-check"></i>
                    </div>
                    <div class="stat-number">${stats.activeUsers}</div>
                    <div class="stat-label">Active Users</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="dashboard-card stat-card">
                    <div class="stat-icon">
                        <i class="bi bi-camera"></i>
                    </div>
                    <div class="stat-number">${stats.faceRegisteredCount}</div>
                    <div class="stat-label">Face Registered</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="dashboard-card stat-card">
                    <div class="stat-icon">
                        <i class="bi bi-shield-check"></i>
                    </div>
                    <div class="stat-number">99.2%</div>
                    <div class="stat-label">System Uptime</div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="dashboard-card p-3">
                    <h5 class="mb-3">System Performance Overview</h5>
                    <div class="chart-container" style="height: 300px;">
                        <canvas id="adminChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="dashboard-card p-3">
                    <h5 class="mb-3">System Status</h5>
                    <div class="status-items">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span>Face Recognition Service</span>
                            <span class="status status--success">Online</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span>Database</span>
                            <span class="status status--success">Connected</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span>Camera Systems</span>
                            <span class="status status--success">12/12 Active</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span>API Gateway</span>
                            <span class="status status--success">Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ** New: Admin Analytics View Renderer **
function renderAnalyticsView() {
    const content = document.getElementById('analyticsContent');
    if (!content) return;
    
    // Check if the current user is an admin or a teacher (both use this view, though content may differ)
    const isAdmin = currentRole === 'administrator';
    
    content.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2>${isAdmin ? 'System-wide Analytics' : 'My Reports'}</h2>
                <p class="text-muted">Review attendance trends and performance metrics.</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="dashboard-card p-4">
                    <h5 class="mb-3">Weekly Attendance Trend (${isAdmin ? 'All Classes' : 'My Classes'})</h5>
                    <div class="chart-container" style="height: 350px;">
                        <canvas id="analyticsChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="dashboard-card p-4">
                    <h5 class="mb-3">Quick Stats</h5>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Face Recognition Rate
                            <span class="badge bg-primary rounded-pill">90.5%</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Manual Attendance Rate
                            <span class="badge bg-secondary rounded-pill">9.5%</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Highest Class Attendance
                            <span class="badge bg-success rounded-pill">MATH101 (94%)</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Unregistered Faces
                            <span class="badge bg-warning rounded-pill">${appData.systemStats.totalStudents - appData.systemStats.faceRegisteredCount}</span>
                        </li>
                    </ul>
                    <button class="btn btn--outline mt-3 w-100"><i class="bi bi-file-earmark-arrow-down me-2"></i>Export Report</button>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(renderAnalyticsChart, 100);
}

// ** New: Admin Settings View Renderer **
function renderSettingsView() {
    const content = document.getElementById('settingsContent');
    if (!content) return;
    
    const settings = appData.faceRecognitionSettings;
    
    content.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2>System Settings</h2>
                <p class="text-muted">Configure face recognition and system parameters.</p>
            </div>
        </div>
        
        <div class="dashboard-card p-4">
            <h5 class="mb-4"><i class="bi bi-camera-video me-2"></i>Face Recognition Settings</h5>
            <form id="settingsForm">
                <div class="mb-3">
                    <label for="confidenceThreshold" class="form-label">Confidence Threshold (%)</label>
                    <input type="number" class="form-control" id="confidenceThreshold" min="50" max="100" value="${settings.confidenceThreshold}" required>
                    <div class="form-text">Minimum percentage match required to mark a face as verified (e.g., 85).</div>
                </div>
                
                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" id="livenessDetection" ${settings.livenessDetection ? 'checked' : ''}>
                    <label class="form-check-label" for="livenessDetection">Enable Liveness Detection</label>
                    <div class="form-text">Requires a subtle movement (e.g., blinking) to prevent spoofing.</div>
                </div>
                
                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" id="multipleAngle" ${settings.multipleAngleVerification ? 'checked' : ''}>
                    <label class="form-check-label" for="multipleAngle">Multiple Angle Verification</label>
                    <div class="form-text">Requires multiple face captures from different angles for initial registration/high security checks.</div>
                </div>
                
                <div class="form-check form-switch mb-4">
                    <input class="form-check-input" type="checkbox" id="lightingCheck" ${settings.lightingCheck ? 'checked' : ''}>
                    <label class="form-check-label" for="lightingCheck">Lighting Condition Check</label>
                    <div class="form-text">Verifies that ambient lighting is adequate for a clear face capture.</div>
                </div>
                
                <button type="button" class="btn btn--primary" id="saveSettingsBtn">
                    <i class="bi bi-save me-2"></i>Save Settings
                </button>
            </form>
        </div>
    `;
}

// View Renderers
function renderAttendanceView() {
    const contentContainer = document.getElementById('attendanceView');
    const content = contentContainer.querySelector('#attendanceContent');
    
    if (!content) return;
    
    if (currentRole === 'student') {
        const markBtn = document.getElementById('markAttendanceBtn');
        if (markBtn) markBtn.style.display = 'block';
        
        content.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <div class="dashboard-card p-3">
                        <h5 class="mb-3">Attendance Instructions</h5>
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            Click "Mark Attendance" to use the camera for face recognition attendance marking.
                        </div>
                        <div class="steps">
                            <div class="step mb-3">
                                <h6><i class="bi bi-1-circle text-primary me-2"></i>Position Yourself</h6>
                                <p class="text-muted">Ensure good lighting and position your face within the frame.</p>
                            </div>
                            <div class="step mb-3">
                                <h6><i class="bi bi-2-circle text-primary me-2"></i>Face Detection</h6>
                                <p class="text-muted">Wait for the system to detect and verify your face.</p>
                            </div>
                            <div class="step mb-3">
                                <h6><i class="bi bi-3-circle text-primary me-2"></i>Capture & Confirm</h6>
                                <p class="text-muted">Review the captured image and confirm attendance.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="dashboard-card p-3">
                        <h5 class="mb-3">Today's Status</h5>
                        <div class="text-center">
                            <div class="status status--success mb-3">
                                <i class="bi bi-check-circle me-1"></i>
                                Present
                            </div>
                            <p class="text-muted">Marked at 9:15 AM via Camera</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        const markBtn = document.getElementById('markAttendanceBtn');
        if (markBtn) markBtn.style.display = 'none';
        
        content.innerHTML = `
            ${activeSession ? `
            <div class="alert alert-info mb-4">
                <i class="bi bi-info-circle me-2"></i>
                Active session for ${activeSession.subjectName || appData.classes.find(c => c.id === activeSession.classId)?.name || 'TOC'}. 
                Students can now mark their attendance. (Room: ${activeSession.room || 'N/A'})
            </div>
            ` : `
            <div class="alert alert-warning mb-4">
                <i class="bi bi-exclamation-triangle me-2"></i>
                No active session. Start a session to enable attendance marking.
            </div>
            `}
            <div class="dashboard-card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Student</th>
                                    <th>Class</th>
                                    <th>Status</th>
                                    <th>Method</th>
                                    <th>Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${appData.attendanceRecords.map(record => `
                                    <tr>
                                        <td>${record.date}</td>
                                        <td>${record.student}</td>
                                        <td>${record.class}</td>
                                        <td>
                                            <span class="badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}">
                                                ${record.status}
                                            </span>
                                        </td>
                                        <td>
                                            <i class="bi bi-${getMethodIcon(record.method)} me-1"></i>
                                            ${record.method}
                                        </td>
                                        <td>${record.confidence ? record.confidence + '%' : 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderStudentsView() {
    const content = document.getElementById('studentsContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="dashboard-card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Class</th>
                                <th>Attendance</th>
                                <th>Face Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appData.students.map(student => `
                                <tr>
                                    <td>${student.rollNo}</td>
                                    <td>
                                        <img src="${getStudentImageUrl(student.name)}" alt="${student.name} profile" class="student-list-img me-2">
                                        ${student.name}
                                    </td>
                                    <td>${student.email}</td>
                                    <td>${student.class}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="progress me-2" style="width: 100px;">
                                                <div class="progress-bar" style="width: ${student.attendance}%"></div>
                                            </div>
                                            <span>${student.attendance}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="face-status ${student.faceRegistered ? 'registered' : 'not-registered'}">
                                            <i class="bi bi-${student.faceRegistered ? 'check-circle' : 'x-circle'}"></i>
                                            ${student.faceRegistered ? 'Registered' : 'Not Registered'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn--outline view-details-btn" data-id="${student.id}">View Details</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderStudentDetails(studentId) {
    const student = appData.students.find(s => s.id === studentId);
    if (!student) {
        showAlert('error', 'Student not found!');
        return;
    }
    
    const contentContainer = document.getElementById('studentDetailsContent');
    if (!contentContainer) return;
    
    const studentAttendanceRecords = appData.attendanceRecords.filter(r => r.student === student.name);
    
    contentContainer.innerHTML = `
        <button class="btn btn--secondary mb-4" onclick="switchView('studentsView')">
            <i class="bi bi-arrow-left me-2"></i>Back to Students
        </button>
        <div class="row">
            <div class="col-md-4">
                <div class="dashboard-card p-4 student-profile-card">
                    <h5 class="mb-3">Student Profile</h5>
                    <div class="text-center">
                        <img src="${getStudentImageUrl(student.name)}" class="rounded-circle mb-3 student-profile-img" alt="${student.name} Profile">
                        <h4 class="mb-1">${student.name}</h4>
                        <p class="text-muted">${student.class}</p>
                    </div>
                    <ul class="list-unstyled mt-4">
                        <li class="mb-2"><i class="bi bi-person-badge me-2 text-primary"></i><strong>Roll No:</strong> ${student.rollNo}</li>
                        <li class="mb-2"><i class="bi bi-envelope me-2 text-primary"></i><strong>Email:</strong> ${student.email}</li>
                        <li class="mb-2"><i class="bi bi-check-circle me-2 text-primary"></i><strong>Face Status:</strong> 
                            <span class="face-status ${student.faceRegistered ? 'registered' : 'not-registered'}">
                                ${student.faceRegistered ? 'Registered' : 'Not Registered'}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="col-md-8">
                <div class="dashboard-card p-4 mb-4">
                    <h5 class="mb-3">Attendance Overview</h5>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="dashboard-card stat-card">
                                <div class="stat-icon">
                                    <i class="bi bi-percent"></i>
                                </div>
                                <div class="stat-number">${student.attendance}%</div>
                                <div class="stat-label">Overall Attendance</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="dashboard-card p-3">
                                <h6 class="mb-3">Attendance Trend</h6>
                                <div class="chart-container" style="height: 150px;">
                                    <canvas id="studentDetailsChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dashboard-card p-4">
                    <h5 class="mb-3">Attendance History</h5>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Method</th>
                                    <th>Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${studentAttendanceRecords.map(record => `
                                    <tr>
                                        <td>${record.date}</td>
                                        <td>
                                            <span class="badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}">
                                                ${record.status}
                                            </span>
                                        </td>
                                        <td><i class="bi bi-${getMethodIcon(record.method)} me-1"></i>${record.method}</td>
                                        <td>${record.confidence ? record.confidence + '%' : 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Switch to the new view
    switchView('studentDetailsView');

    // Render the chart
    setTimeout(() => {
        renderStudentDetailsChart(studentAttendanceRecords);
    }, 100);
}

// Chart Renderers with Blue Theme Colors
function renderStudentAttendanceChart() {
    const ctx = document.getElementById('studentChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            datasets: [{
                label: 'Attendance %',
                data: [95, 100, 90, 100, 95],
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3b82f6',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// New chart renderer for student details
function renderStudentDetailsChart(records) {
    const ctx = document.getElementById('studentDetailsChart');
    if (!ctx) return;
    
    const labels = records.map(r => r.date);
    const data = records.map(r => r.status === 'Present' ? 100 : 0); // Simple present/absent for a line chart
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Attendance',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (context.parsed.y > 0) {
                                label += ': Present';
                            } else {
                                label += ': Absent';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    display: false,
                    beginAtZero: true,
                    max: 100
                },
                x: {
                    display: true,
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderClassAttendanceChart() {
    const ctx = document.getElementById('teacherChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['CS101', 'CS102', 'MATH101'],
            datasets: [{
                label: 'Attendance Rate',
                data: [85, 92, 78],
                backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function renderSystemOverviewChart() {
    const ctx = document.getElementById('adminChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent', 'Late'],
            datasets: [{
                data: [75, 15, 10],
                backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderAnalyticsChart() {
    const ctx = document.getElementById('analyticsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
            datasets: [{
                label: 'Weekly Attendance %',
                data: [88, 92, 85, 94, 91],
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3b82f6',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Camera Modal Functions
function openCameraModal() {
    if (currentRole !== 'student') {
        showAlert('error', 'Only students can access camera attendance.');
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('cameraModal'));
    modal.show();
    
    // START GEOLOCATION REQUEST
    if (navigator.geolocation) {
        // Initial state
        if (locationStatusElement) {
            locationStatusElement.textContent = 'Requesting...';
            locationStatusElement.classList.remove('text-danger', 'text-success');
            locationStatusElement.classList.add('text-warning');
        }
        getLocation();
    } else {
        if (locationStatusElement) {
            locationStatusElement.textContent = 'Not Supported';
            locationStatusElement.classList.remove('text-warning');
            locationStatusElement.classList.add('text-danger');
        }
    }
    // END GEOLOCATION REQUEST
    
    // Reset face status on opening
    userFaceVerified = false;

    // Hide the initial prompt and buttons
    initialPrompt.style.display = 'block';
    videoFeed.style.display = 'none';
    detectionCanvas.style.display = 'none';
    document.getElementById('startCameraBtn').style.display = 'block';
    document.getElementById('captureBtn').style.display = 'none';
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('confirmBtn').style.display = 'none';
    document.getElementById('countdownTimer').classList.remove('active');
}

function closeCameraModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('cameraModal'));
    if (modal) {
        modal.hide();
    }
    stopCamera();
    
    // Reset location state on modal close
    userLocation = null;
    userFaceVerified = false;
    if (locationStatusElement) {
        locationStatusElement.textContent = 'Pending...';
        locationStatusElement.classList.remove('text-danger', 'text-success');
        locationStatusElement.classList.add('text-warning');
    }
    if (locationCoordsElement) {
        locationCoordsElement.textContent = '';
    }
}

function startCamera() {
    initialPrompt.style.display = 'none';
    videoFeed.style.display = 'block';

    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            videoFeed.srcObject = stream;
            videoFeed.addEventListener('loadedmetadata', () => {
                const displaySize = { width: videoFeed.videoWidth, height: videoFeed.videoHeight };
                faceapi.matchDimensions(detectionCanvas, displaySize);
                
                loadFaceApiAndStartDetection();
            });
        })
        .catch(err => {
            console.error("Error accessing camera:", err);
            initialPrompt.innerHTML = `<i class="bi bi-camera-video-off display-1"></i><p class="mt-3 text-white">Camera access denied. Please allow access.</p>`;
            initialPrompt.style.display = 'block';
        });
}

function stopCamera() {
    if (videoFeed.srcObject) {
        videoFeed.srcObject.getTracks().forEach(track => track.stop());
        videoFeed.srcObject = null;
    }
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }
}

async function loadFaceApiAndStartDetection() {
    initialPrompt.innerHTML = `<div class="spinner-border text-primary mb-3" role="status"></div><p class="mt-3 text-white">Loading AI models...</p>`;
    initialPrompt.style.display = 'block';
    
    // Use the CDN path for models to avoid local file errors
    const modelsUrl = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';
    
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelsUrl);
        await faceapi.nets.faceLandmark68Net.loadFromUri(modelsUrl);
        await faceapi.nets.faceRecognitionNet.loadFromUri(modelsUrl);
        
        faceApiInitialized = true;
        initialPrompt.style.display = 'none';
        detectionCanvas.style.display = 'block';
        document.getElementById('captureBtn').style.display = 'block';
        
        faceDetectionInterval = setInterval(async () => {
            if (videoFeed.srcObject && videoFeed.readyState === videoFeed.HAVE_ENOUGH_DATA) {
                const detections = await faceapi.detectSingleFace(videoFeed, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
                
                const displaySize = { width: videoFeed.videoWidth, height: videoFeed.videoHeight };
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                
                const ctx = detectionCanvas.getContext('2d');
                ctx.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);
                
                if (resizedDetections) {
                    faceapi.draw.drawDetections(detectionCanvas, resizedDetections);
                }
            }
        }, 100);
        
    } catch (err) {
        console.error("Error loading models or starting detection:", err);
        initialPrompt.innerHTML = `<i class="bi bi-exclamation-triangle-fill display-1 text-danger"></i><p class="mt-3 text-white">Error loading AI models. Please try again later.</p>`;
        document.getElementById('startCameraBtn').style.display = 'block';
    }
}

function capturePhoto() {
    if (!faceApiInitialized) {
        showAlert('warning', 'Face detection system is not ready yet.');
        return;
    }
    // NEW: REQUIRE LOCATION BEFORE CAPTURE
    if (!userLocation) {
        showAlert('error', 'Location data is required for attendance. Please grant location permission.');
        getLocation(); // Attempt to get location again
        return;
    }
    
    // Stop face detection loop
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }
    
    // Start countdown
    let countdown = 3;
    const timer = document.getElementById('countdownTimer');
    timer.classList.add('active');
    timer.textContent = countdown;
    
    document.getElementById('captureBtn').style.display = 'none';
    
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            timer.textContent = countdown;
        } else {
            timer.classList.remove('active');
            clearInterval(countdownInterval);
            
            // Check for face detection
            detectFaceForAttendance();
        }
    }, 1000);
}

async function detectFaceForAttendance() {
    const detection = await faceapi.detectSingleFace(videoFeed, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    
    if (detection) {
        showAlert('success', 'Face Verified!');
        userFaceVerified = true; // Set face verification status
        document.getElementById('confirmBtn').style.display = 'block';
        document.getElementById('retakeBtn').style.display = 'block';
    } else {
        showAlert('error', 'Face Verification Failed. Retrying is recommended.');
        userFaceVerified = false; // Set face verification status
        document.getElementById('retakeBtn').style.display = 'block';
    }
}

function retakePhoto() {
    document.getElementById('confirmBtn').style.display = 'none';
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('captureBtn').style.display = 'block';
    userFaceVerified = false; // Reset status on retake
    startCamera();
}

/**
 * CORE LOGIC: Final check for Face and Geolocation before marking attendance.
 */
function confirmAttendance() {
    const student = currentUser;
    const activeClass = appData.classes.find(c => c.id === student.class);
    const attendanceResultModal = new bootstrap.Modal(document.getElementById('attendanceResultModal'));
    const resultTitle = document.getElementById('attendanceResultTitle');
    const modalBody = document.getElementById('attendanceResultModalBody');

    // --- 1. Check Face Verification Status ---
    const faceVerified = userFaceVerified;

    // --- 2. Check Location Verification Status (Geofence Logic) ---
    let locationVerified = false;
    let geofenceResultText = "Location Not Captured";
    let distance = 0;
    
    if (userLocation) {
        // Find the geofence data for the student's current class (using mock data in this prototype)
        if (activeClass && activeClass.geofence) {
            const geofence = activeClass.geofence;
            
            // Calculate distance using Haversine formula (see getDistance helper function)
            distance = getDistance(
                userLocation.latitude, 
                userLocation.longitude, 
                geofence.lat, 
                geofence.long
            );
            
            if (distance <= geofence.radius) {
                locationVerified = true;
                geofenceResultText = `Within Geofence (Distance: ${distance.toFixed(0)}m)`;
            } else {
                geofenceResultText = `Outside Geofence (Distance: ${distance.toFixed(0)}m)`;
            }
        } else {
            locationVerified = true; // Allow if no geofence is defined for the class
            geofenceResultText = "No Geofence Defined (Allowed)";
        }
    } else {
        locationVerified = false; // Fail if location wasn't captured
        geofenceResultText = "Location Data Missing";
    }

    const finalStatus = faceVerified && locationVerified;
    const faceIcon = faceVerified ? '<i class="bi bi-check-circle-fill text-success me-2"></i>' : '<i class="bi bi-x-circle-fill text-danger me-2"></i>';
    const locationIcon = locationVerified ? '<i class="bi bi-check-circle-fill text-success me-2"></i>' : '<i class="bi bi-x-circle-fill text-danger me-2"></i>';

    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
    
    // Simulate processing delay
    setTimeout(() => {
        loadingModal.hide();
        closeCameraModal();

        // Prepare the result modal content
        const resultModal = new bootstrap.Modal(document.getElementById('attendanceResultModal'));
        const resultTitle = document.getElementById('attendanceResultTitle');
        const modalBody = document.getElementById('attendanceResultModalBody');

        if (finalStatus) {
            // SUCCESS
            resultTitle.textContent = 'Attendance Confirmed! 🎉';
            resultTitle.className = 'modal-title text-success';
            
            // Update attendance record
            appData.attendanceRecords.push({
                date: new Date().toISOString().split('T')[0],
                student: student.name,
                class: student.class,
                status: 'Present',
                method: 'Biometrics + Geo', // Updated method
                confidence: 99, 
                location: userLocation ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : 'N/A',
                sessionId: activeSession?.id || null
            });

            modalBody.innerHTML = `
                <div class="text-center">
                    <i class="bi bi-check-circle-fill text-success display-1 mb-3"></i>
                    <h4 class="mb-3">Attendance Marked Successfully!</h4>
                    <ul class="list-group list-group-flush mb-4 text-start">
                        <li class="list-group-item d-flex justify-content-between align-items-center p-2">
                            <strong>Biometrics:</strong> 
                            <span class="text-success">${faceIcon} Success</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center p-2">
                            <strong>Location:</strong> 
                            <span class="text-success">${locationIcon} ${geofenceResultText}</span>
                        </li>
                    </ul>
                </div>
            `;
            
        } else {
            // FAILURE
            resultTitle.textContent = 'Attendance Failed 🛑';
            resultTitle.className = 'modal-title text-danger';

            modalBody.innerHTML = `
                <div class="text-center">
                    <i class="bi bi-x-circle-fill text-danger display-1 mb-3"></i>
                    <h4 class="mb-3">Verification Failed.</h4>
                    <ul class="list-group list-group-flush mb-4 text-start">
                        <li class="list-group-item d-flex justify-content-between align-items-center p-2">
                            <strong>Biometrics:</strong> 
                            <span class="${faceVerified ? 'text-success' : 'text-danger'}">${faceIcon} ${faceVerified ? 'Success' : 'Failed'}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center p-2">
                            <strong>Location Check:</strong> 
                            <span class="${locationVerified ? 'text-success' : 'text-danger'}">${locationIcon} ${geofenceResultText}</span>
                        </li>
                    </ul>
                    <p class="text-muted small">You must pass both checks to mark attendance.</p>
                    <button type="button" class="btn btn-warning mt-3" data-bs-dismiss="modal" onclick="openCameraModal()">Try Again</button>
                </div>
            `;
        }
        
        resultModal.show();
        renderDashboard(); // Refresh dashboard to update attendance log
        
    }, 1500);
}

/**
 * Requests geolocation and updates the modal UI.
 */
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                if (locationStatusElement) {
                    locationStatusElement.textContent = 'Acquired';
                    locationStatusElement.classList.remove('text-warning', 'text-danger');
                    locationStatusElement.classList.add('text-success');
                }
                if (locationCoordsElement) {
                    locationCoordsElement.textContent = `Lat/Lon: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)} (±${userLocation.accuracy.toFixed(0)}m)`;
                }
            },
            (error) => {
                userLocation = null;
                console.error("Geolocation Error:", error);
                if (locationStatusElement) {
                    locationStatusElement.textContent = 'Denied/Error';
                    locationStatusElement.classList.remove('text-warning', 'text-success');
                    locationStatusElement.classList.add('text-danger');
                }
                if (locationCoordsElement) {
                    locationCoordsElement.textContent = 'Required for attendance.';
                }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }
}

/**
 * Calculates the distance between two coordinates using the Haversine formula (in meters).
 */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of Earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
    return distance;
}


// Utility Functions
function getStudentImageUrl(studentName) {
    // Generates a consistent, unique placeholder image based on the student's initials and a unique color/size
    const initials = studentName.split(' ').map(n => n[0]).join('');
    // We'll use a simple name hash to get a unique number for color/size variations
    const hash = studentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Example dynamic placeholder URL
    return `https://placehold.co/100x100/3b82f6/ffffff?text=${initials}&font=arial&bold=true&h=${hash % 50}`;
}

function getMethodIcon(method) {
    switch(method) {
        case 'Face Recognition':
        case 'Camera':
            return 'camera-video-fill';
        case 'Manual':
            return 'person-check-fill';
        default:
            return 'question-circle-fill';
    }
}

function saveSettings() {
    const confidenceThreshold = document.getElementById('confidenceThreshold');
    const livenessDetection = document.getElementById('livenessDetection');
    const multipleAngle = document.getElementById('multipleAngle');
    const lightingCheck = document.getElementById('lightingCheck');
    
    if (confidenceThreshold && livenessDetection && multipleAngle && lightingCheck) {
        const settings = {
            confidenceThreshold: parseInt(confidenceThreshold.value, 10),
            livenessDetection: livenessDetection.checked,
            multipleAngleVerification: multipleAngle.checked,
            lightingCheck: lightingCheck.checked
        };
        
        // Update app data
        appData.faceRecognitionSettings = settings;
        
        showAlert('success', 'Face recognition settings saved successfully!');
        // Re-render the view to show updated values if necessary (e.g., after navigating away and back)
        // For simplicity, we just show an alert here.
    }
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle-fill' : type === 'error' ? 'x-circle-fill' : 'info-circle-fill'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}
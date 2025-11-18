// ==========================================
// 1. MOCK DATA & STATE (Mirroring App Logic)
// ==========================================

// Cloudinary Config
const CLOUD_NAME = 'dnia8lb2q';
const UPLOAD_PRESET = 'EcoBirla_avatars';

let adminState = {
    users: [
        { id: 1, studentId: '5207872', name: 'Alex Green', course: 'FYBCOM', email: 'alex@college.edu', mobile: '9890098900', points: 375, lifetime: 1200, password: 'pass', joined: '2025-08-20', logs: [] },
        { id: 2, studentId: '5201122', name: 'Jane Doe', course: 'SYBCOM', email: 'jane@college.edu', mobile: '9890011111', points: 520, lifetime: 1500, password: 'pass', joined: '2025-09-01', logs: [] }
    ],
    products: [
        { id: 'p1', name: 'Veg Thali', cost: 30, price: 50, img: 'https://placehold.co/100x100' },
        { id: 'p2', name: 'College Hoodie', cost: 200, price: 800, img: 'https://placehold.co/100x100' }
    ],
    events: [
        { id: 1, title: 'Campus Cleanup', date: '2025-11-20', rsvps: [ {userId: 1, status: 'confirmed'}, {userId: 2, status: 'pending'} ] }
    ],
    logs: [
        { type: 'Points', msg: 'Alex earned 50 pts (Cleanup)', time: '10:30 AM' },
        { type: 'Store', msg: 'Jane redeemed Hoodie', time: '09:15 AM' },
        { type: 'Auth', msg: 'New user registered', time: '08:00 AM' }
    ]
};

// ==========================================
// 2. NAVIGATION & INITIALIZATION
// ==========================================

function navTo(viewId) {
    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Switch View
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${viewId}`).classList.remove('hidden');
    
    // Update Title
    document.getElementById('page-title').textContent = viewId.charAt(0).toUpperCase() + viewId.slice(1);

    // Refresh specific data if needed
    if(viewId === 'users') renderUsersTable();
    if(viewId === 'store') renderStoreGrid();
    if(viewId === 'events') renderEventsList();
    if(viewId === 'logs') renderFullLogs();
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

window.onload = () => {
    lucide.createIcons();
    initCharts();
    updateDashboardStats();
    renderLogsPreview();
};

// ==========================================
// 3. ANALYTICS (Chart.js)
// ==========================================

function initCharts() {
    // Traffic Chart
    const ctxTraffic = document.getElementById('trafficChart').getContext('2d');
    new Chart(ctxTraffic, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Page Views',
                data: [120, 190, 300, 250, 200, 350, 400],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // Distribution Chart
    const ctxDist = document.getElementById('distChart').getContext('2d');
    new Chart(ctxDist, {
        type: 'doughnut',
        data: {
            labels: ['Events', 'Recycling', 'Quizzes', 'Check-ins'],
            datasets: [{
                data: [30, 40, 15, 15],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateDashboardStats() {
    // Calculate mock totals
    const totalDist = adminState.users.reduce((acc, u) => acc + u.lifetime, 0);
    const currentBal = adminState.users.reduce((acc, u) => acc + u.points, 0);
    
    document.getElementById('stat-total-dist').textContent = totalDist.toLocaleString();
    document.getElementById('stat-total-red').textContent = (totalDist - currentBal).toLocaleString();
    document.getElementById('stat-impact').textContent = "1,240.5"; // Mock
    document.getElementById('stat-pending').textContent = "12";
}

// ==========================================
// 4. USER MANAGEMENT
// ==========================================

function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    
    adminState.users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b dark:border-gray-800 transition cursor-pointer";
        tr.onclick = (e) => { if(!e.target.closest('button')) openUserModal(user.id); };
        tr.innerHTML = `
            <td class="p-4 font-medium flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">${user.name.charAt(0)}</div>
                ${user.name}
            </td>
            <td class="p-4 text-gray-500">${user.studentId}</td>
            <td class="p-4"><span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-semibold">${user.course}</span></td>
            <td class="p-4 font-bold text-green-600">${user.points}</td>
            <td class="p-4 text-xs text-blue-500 font-bold uppercase">Gold</td>
            <td class="p-4 text-right">
                <button onclick="openUserModal(${user.id})" class="p-1 hover:text-blue-500"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                <button class="p-1 hover:text-red-500 ml-2"><i data-lucide="trash" class="w-4 h-4"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    lucide.createIcons();
}

function openUserModal(userId) {
    const user = adminState.users.find(u => u.id === userId);
    if(!user) return;

    document.getElementById('modal-user-name').textContent = user.name;
    document.getElementById('modal-user-id').textContent = `ID: ${user.studentId}`;
    document.getElementById('modal-user-email').textContent = user.email;
    document.getElementById('modal-user-mobile').textContent = user.mobile;
    document.getElementById('modal-user-pass').textContent = user.password; // Plain text as requested
    document.getElementById('modal-user-points').textContent = user.lifetime;
    
    // Mock Transaction History for Modal
    const historyContainer = document.getElementById('modal-user-history');
    historyContainer.innerHTML = `
        <div class="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600">
            <div><p class="font-semibold">Daily Check-in</p><p class="text-xs text-gray-400">Today, 9:00 AM</p></div>
            <span class="text-green-500 font-bold">+10</span>
        </div>
        <div class="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600">
            <div><p class="font-semibold">Store Purchase (Thali)</p><p class="text-xs text-gray-400">Yesterday</p></div>
            <span class="text-red-500 font-bold">-30</span>
        </div>
    `;

    document.getElementById('user-modal').classList.remove('hidden');
}

// ==========================================
// 5. STORE & CLOUDINARY
// ==========================================

function renderStoreGrid() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    adminState.products.forEach(p => {
        grid.innerHTML += `
            <div class="glass-panel p-4 flex flex-col">
                <img src="${p.img}" class="w-full h-32 object-cover rounded-lg mb-3 bg-gray-100">
                <h4 class="font-bold">${p.name}</h4>
                <div class="flex justify-between items-center mt-auto pt-2">
                    <span class="text-sm text-gray-500">${p.cost} Pts</span>
                    <button class="p-2 bg-gray-100 dark:bg-gray-700 rounded-full"><i data-lucide="edit" class="w-4 h-4"></i></button>
                </div>
            </div>
        `;
    });
    lucide.createIcons();
}

function openProductModal() {
    document.getElementById('product-modal').classList.remove('hidden');
}

async function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    document.getElementById('upload-text').textContent = "Uploading...";
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        // Show preview
        const preview = document.getElementById('upload-preview');
        preview.style.backgroundImage = `url(${data.secure_url})`;
        preview.classList.remove('hidden');
        document.getElementById('upload-text').textContent = "Image Uploaded!";
        
    } catch (err) {
        console.error("Upload failed", err);
        document.getElementById('upload-text').textContent = "Upload Failed";
    }
}

// ==========================================
// 6. EVENTS & PDF GENERATION
// ==========================================

function renderEventsList() {
    const container = document.getElementById('events-list-container');
    container.innerHTML = '';
    adminState.events.forEach(e => {
        container.innerHTML += `
            <div class="glass-panel p-4 flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-lg">${e.title}</h4>
                    <p class="text-sm text-gray-500">${e.date} • ${e.rsvps.length} RSVPs</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="openRSVPModal(${e.id})" class="btn-secondary text-sm">View RSVPs</button>
                    <button class="btn-primary text-sm">Edit</button>
                </div>
            </div>
        `;
    });
}

function openRSVPModal(eventId) {
    const eventData = adminState.events.find(e => e.id === eventId);
    document.getElementById('rsvp-event-name').textContent = eventData.title;
    
    const tbody = document.getElementById('rsvp-list-body');
    tbody.innerHTML = '';
    
    eventData.rsvps.forEach(rsvp => {
        const user = adminState.users.find(u => u.id === rsvp.userId);
        tbody.innerHTML += `
            <tr class="border-b dark:border-gray-700">
                <td class="py-2">${user.studentId}</td>
                <td class="py-2 font-bold">${user.name}</td>
                <td class="py-2"><span class="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">${rsvp.status}</span></td>
                <td class="py-2"><button class="text-green-600 font-bold text-xs hover:underline">Mark Attended</button></td>
            </tr>
        `;
    });

    document.getElementById('rsvp-modal').classList.remove('hidden');
}

function downloadRSVPPdf() {
    const element = document.getElementById('rsvp-table');
    const eventName = document.getElementById('rsvp-event-name').textContent;
    
    const opt = {
        margin: 1,
        filename: `${eventName}_RSVP_List.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Use html2pdf library
    html2pdf().set(opt).from(element).save();
}

// ==========================================
// 7. LOGS & UTILS
// ==========================================

function renderLogsPreview() {
    const div = document.getElementById('dashboard-logs-preview');
    div.innerHTML = adminState.logs.map(log => `
        <div class="flex items-start gap-3 text-sm">
            <div class="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
            <div>
                <p class="font-medium text-gray-800 dark:text-gray-200">${log.msg}</p>
                <p class="text-xs text-gray-500">${log.time}</p>
            </div>
        </div>
    `).join('');
}

function renderFullLogs() {
    const div = document.getElementById('full-logs-list');
    div.innerHTML = adminState.logs.map((log, i) => `
        <div class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <div class="flex items-center gap-4">
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">LOG-#${1000+i}</span>
                <div>
                    <p class="font-bold text-gray-800 dark:text-gray-200">${log.msg}</p>
                    <p class="text-xs text-gray-500">Action: ${log.type}</p>
                </div>
            </div>
            <span class="text-sm text-gray-500">${log.time}</span>
        </div>
    `).join('');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

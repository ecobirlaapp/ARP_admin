import { supabase } from './supabase-client.js';
import { uploadToCloudinary } from './cloudinary-service.js';

const PLASTIC_TYPES = {
    'PET': 1.60,
    'HDPE': 1.25,
    'PVC': 0.90,
    'LDPE': 1.10,
    'PP': 1.45,
    'PS': 1.15,
    'Other': 0.75
};

// =======================
// 1. RENDER MAIN PAGE
// =======================
export const renderPlasticLogs = async (container) => {
    const { data: logs, error } = await supabase
        .from('plastic_submissions')
        .select('*, users!user_id(full_name, student_id)')
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching plastic logs:', error);

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-xl text-gray-800">Plastic Recycling Logs</h3>
            <div class="flex gap-2">
                <button onclick="openLogModal()" class="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2 shadow-sm transition-all">
                    <i data-lucide="plus" class="w-4 h-4"></i> New Log
                </button>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-200">
                        <tr>
                            <th class="p-4">Student</th>
                            <th class="p-4">Weight / Type</th>
                            <th class="p-4">CO₂ Saved</th>
                            <th class="p-4">Proof</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${(logs || []).map(log => {
                            const co2 = (log.weight_kg * (PLASTIC_TYPES[log.plastic_type] || 0.75)).toFixed(2);
                            const points = Math.ceil(log.weight_kg * 100);
                            
                            return `
                            <tr class="hover:bg-gray-50 transition">
                                <td class="p-4">
                                    <div class="font-bold text-gray-900">${log.users?.full_name || 'Unknown'}</div>
                                    <div class="text-xs text-gray-500">${log.users?.student_id}</div>
                                </td>
                                <td class="p-4">
                                    <div class="font-bold text-gray-800">${log.weight_kg} kg</div>
                                    <span class="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">${log.plastic_type || 'Other'}</span>
                                </td>
                                <td class="p-4">
                                    <div class="text-green-600 font-bold">${co2} kg</div>
                                    <div class="text-xs text-gray-400">Potential: ${points} pts</div>
                                </td>
                                <td class="p-4">
                                    ${log.image_url 
                                        ? `<a href="${log.image_url}" target="_blank" class="text-blue-600 hover:underline text-xs flex items-center gap-1"><i data-lucide="image" class="w-3 h-3"></i> View</a>` 
                                        : '<span class="text-gray-400 text-xs">No Image</span>'}
                                </td>
                                <td class="p-4">
                                    <span class="px-2 py-1 rounded text-xs font-bold uppercase ${
                                        log.status === 'verified' ? 'bg-green-100 text-green-700' :
                                        log.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }">${log.status}</span>
                                </td>
                                <td class="p-4 text-right">
                                    ${log.status === 'pending' ? `
                                        <button onclick="verifyLog('${log.id}', ${log.weight_kg}, '${log.plastic_type || 'Other'}')" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm">Verify</button>
                                        <button onclick="rejectLog('${log.id}')" class="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 ml-1">Reject</button>
                                    ` : '<span class="text-gray-400 text-xs italic">Locked</span>'}
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    if(window.lucide) window.lucide.createIcons();
};

// =======================
// 2. CREATE LOG MODAL
// =======================
window.openLogModal = async () => {
    // 1. Fetch Users for Dropdown
    const { data: users } = await supabase.from('users').select('id, full_name, student_id').order('full_name');
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const { data: adminUser } = await supabase.from('users').select('id').eq('auth_user_id', currentUser.id).single();

    const html = `
        <div class="p-6 h-full flex flex-col relative">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-800">Log Plastic Waste</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-6 h-6"></i></button>
            </div>
            
            <form id="plastic-form" class="space-y-5 flex-grow overflow-y-auto p-1">
                
                <!-- User Selection -->
                <div>
                    <label class="label">Select Student</label>
                    <select id="pl-user" class="input-field" required>
                        <option value="">-- Select User --</option>
                        <option value="${adminUser?.id}" class="font-bold bg-gray-100">★ Record for Myself (Admin)</option>
                        ${users.map(u => `<option value="${u.id}">${u.full_name} (${u.student_id})</option>`).join('')}
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="label">Weight (kg)</label>
                        <input type="number" id="pl-weight" step="0.01" class="input-field" placeholder="0.00" required>
                    </div>
                    <div>
                        <label class="label">Plastic Type</label>
                        <select id="pl-type" class="input-field" required>
                            ${Object.keys(PLASTIC_TYPES).map(t => `<option value="${t}">${t} (#${getPlasticCode(t)})</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- Auto Calc Preview -->
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p class="text-xs text-blue-600 uppercase font-bold">Points to Award</p>
                        <p class="text-2xl font-bold text-blue-800" id="calc-points">0</p>
                    </div>
                    <div>
                        <p class="text-xs text-blue-600 uppercase font-bold">CO₂ Saved</p>
                        <p class="text-2xl font-bold text-green-700" id="calc-co2">0.00 kg</p>
                    </div>
                </div>

                <div>
                    <label class="label">Photo Proof (Optional)</label>
                    <div class="flex gap-2">
                        <input type="file" id="pl-file" class="input-field text-sm" accept="image/*">
                    </div>
                </div>

                <div>
                    <label class="label">Location / Source</label>
                    <input type="text" id="pl-location" class="input-field" placeholder="e.g. Canteen, Hostel A">
                </div>

                <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <input type="checkbox" id="pl-verify" class="w-5 h-5 text-green-600 rounded cursor-pointer">
                    <div>
                        <label for="pl-verify" class="font-bold text-green-800 text-sm cursor-pointer">Verify Immediately</label>
                        <p class="text-xs text-green-600">Check this if you have physically verified the waste.</p>
                    </div>
                </div>

                <button type="submit" class="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 shadow-md mt-4">
                    Submit Log
                </button>
            </form>
        </div>
        <style>
            .label { display: block; font-size: 0.75rem; font-weight: 700; color: #374151; margin-bottom: 4px; uppercase; }
            .input-field { width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; background: #fff; }
        </style>
    `;
    openModal(html);

    // Live Calculation Logic
    const weightInput = document.getElementById('pl-weight');
    const typeInput = document.getElementById('pl-type');
    
    const updateCalc = () => {
        const w = parseFloat(weightInput.value) || 0;
        const type = typeInput.value;
        const co2Rate = PLASTIC_TYPES[type] || 0.75;
        
        document.getElementById('calc-points').textContent = Math.ceil(w * 100);
        document.getElementById('calc-co2').textContent = (w * co2Rate).toFixed(2) + ' kg';
    };

    weightInput.addEventListener('input', updateCalc);
    typeInput.addEventListener('change', updateCalc);

    // Submit Handler
    document.getElementById('plastic-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerText = 'Submitting...';

        try {
            let imageUrl = null;
            const fileInput = document.getElementById('pl-file');
            if (fileInput.files.length > 0) {
                btn.innerText = 'Uploading Image...';
                imageUrl = await uploadToCloudinary(fileInput.files[0]);
            }

            const isAutoVerify = document.getElementById('pl-verify').checked;
            const userId = document.getElementById('pl-user').value;

            const payload = {
                user_id: userId,
                weight_kg: parseFloat(document.getElementById('pl-weight').value),
                plastic_type: document.getElementById('pl-type').value,
                location: document.getElementById('pl-location').value,
                submission_url: imageUrl, // Note: ensure your DB has this column, usually mapped to notes or metadata if not explicit
                status: isAutoVerify ? 'verified' : 'pending',
                verified_by: isAutoVerify ? adminUser?.id : null,
                verified_at: isAutoVerify ? new Date().toISOString() : null,
                created_by: adminUser?.id
            };

            const { error } = await supabase.from('plastic_submissions').insert(payload);
            if (error) throw error;

            closeModal();
            renderPlasticLogs(document.getElementById('view-container'));

        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
            btn.disabled = false; btn.innerText = 'Retry';
        }
    });
};

// =======================
// 3. VERIFY / REJECT ACTIONS
// =======================
window.verifyLog = async (logId, weight, type) => {
    if (!confirm(`Confirm verification of ${weight}kg ${type}? This will award points immediately.`)) return;

    const { data: { user } } = await supabase.auth.getUser();
    const { data: admin } = await supabase.from('users').select('id').eq('auth_user_id', user.id).single();

    const { error } = await supabase
        .from('plastic_submissions')
        .update({ 
            status: 'verified', 
            verified_by: admin?.id, 
            verified_at: new Date().toISOString() 
        })
        .eq('id', logId);

    if (error) alert('Verification failed: ' + error.message);
    else renderPlasticLogs(document.getElementById('view-container'));
};

window.rejectLog = async (logId) => {
    if (!confirm("Are you sure you want to reject this log?")) return;
    const { error } = await supabase.from('plastic_submissions').update({ status: 'rejected' }).eq('id', logId);
    if (!error) renderPlasticLogs(document.getElementById('view-container'));
};

// Helper
const getPlasticCode = (type) => {
    const codes = { 'PET': 1, 'HDPE': 2, 'PVC': 3, 'LDPE': 4, 'PP': 5, 'PS': 6, 'Other': 7 };
    return codes[type] || 7;
};

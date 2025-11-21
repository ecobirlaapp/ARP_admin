import { supabase } from './supabase-client.js';

export const renderUsers = async (container) => {
    const { data: users } = await supabase.from('users').select('*').order('created_at', {ascending: false});

    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <input type="text" placeholder="Search users..." class="p-2 border rounded-lg w-64 text-sm">
                <span class="text-sm text-gray-500">${users.length} Students Registered</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-100 text-gray-600 uppercase font-bold text-xs">
                        <tr>
                            <th class="p-4">Student</th>
                            <th class="p-4">Course</th>
                            <th class="p-4">Points</th>
                            <th class="p-4">Joined</th>
                            <th class="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${users.map(u => `
                            <tr class="hover:bg-gray-50 transition">
                                <td class="p-4 flex items-center gap-3">
                                    <img src="${u.profile_img_url || 'https://placehold.co/40'}" class="w-8 h-8 rounded-full object-cover">
                                    <div>
                                        <div class="font-bold text-gray-900">${u.full_name} ${u.tick_type ? 'Create tick img here' : ''}</div>
                                        <div class="text-xs text-gray-500">${u.email}</div>
                                    </div>
                                </td>
                                <td class="p-4">${u.course}</td>
                                <td class="p-4 font-bold text-green-600">${u.current_points}</td>
                                <td class="p-4 text-gray-500">${new Date(u.joined_at).toLocaleDateString()}</td>
                                <td class="p-4 text-center">
                                    <button onclick="openUserDetail('${u.id}')" class="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-brand-200">View</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    window.openUserDetail = openUserDetail;
};

const openUserDetail = async (userId) => {
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    
    // Fetch related data (Logs, Transactions, Orders) - Limit 5
    const { data: logs } = await supabase.from('user_activity_log').select('*').eq('user_id', userId).limit(5);
    const { data: txs } = await supabase.from('points_ledger').select('*').eq('user_id', userId).limit(5);
    
    const modalHtml = `
        <div class="bg-gray-900 p-6 text-white flex justify-between items-start">
            <div class="flex gap-4">
                <img src="${user.profile_img_url}" class="w-20 h-20 rounded-full border-4 border-gray-700">
                <div>
                    <h2 class="text-2xl font-bold">${user.full_name}</h2>
                    <p class="text-gray-400">${user.student_id} | ${user.course}</p>
                    <div class="mt-2 flex gap-2">
                        <span class="bg-green-600 px-2 py-0.5 rounded text-xs font-bold">${user.current_points} pts</span>
                        <span class="bg-gray-700 px-2 py-0.5 rounded text-xs font-bold">${user.role}</span>
                    </div>
                </div>
            </div>
            <button onclick="closeModal()" class="text-gray-400 hover:text-white"><i data-lucide="x"></i></button>
        </div>
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase">Change Password</label>
                    <div class="flex mt-1">
                        <input type="password" placeholder="New Password" class="border p-2 rounded-l w-full text-sm">
                        <button class="bg-gray-900 text-white px-3 rounded-r text-sm">Update</button>
                    </div>
                </div>
                 <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase">Change Avatar URL</label>
                    <div class="flex mt-1">
                        <input type="text" value="${user.profile_img_url || ''}" class="border p-2 rounded-l w-full text-sm">
                        <button class="bg-gray-900 text-white px-3 rounded-r text-sm">Save</button>
                    </div>
                </div>
            </div>

            <div>
                <h3 class="font-bold text-lg mb-3 border-b pb-2">Recent Transactions</h3>
                <div class="space-y-2">
                    ${txs.map(t => `
                        <div class="flex justify-between text-sm border-b border-gray-100 pb-1">
                            <span>${t.description}</span>
                            <span class="${t.points_delta > 0 ? 'text-green-600' : 'text-red-500'} font-bold">${t.points_delta}</span>
                        </div>
                    `).join('')}
                    ${txs.length === 0 ? '<p class="text-gray-400 text-sm">No transactions.</p>' : ''}
                </div>
                <button class="mt-2 text-brand-600 text-xs font-bold hover:underline">View All Transactions</button>
            </div>
        </div>
    `;
    openModal(modalHtml);
};

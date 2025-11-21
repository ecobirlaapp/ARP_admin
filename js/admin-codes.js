import { supabase } from './supabase-client.js';

export const renderCodes = async (container) => {
    const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching codes:', error);

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-xl text-gray-800">Redeem Codes</h3>
            <button onclick="openCreateCodeModal()" class="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2 shadow-sm transition-all">
                <i data-lucide="plus" class="w-4 h-4"></i> Create Code
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${coupons.map(c => `
                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
                    <div class="flex justify-between items-start mb-2">
                        <div class="bg-gray-100 text-gray-800 font-mono font-bold text-lg px-3 py-1 rounded tracking-widest select-all border border-gray-300 border-dashed">
                            ${c.code}
                        </div>
                        <div class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                            ${c.is_active ? 'Active' : 'Expired'}
                        </div>
                    </div>
                    <p class="text-sm text-gray-500 mb-4 h-10 line-clamp-2">${c.description || 'No description provided.'}</p>
                    
                    <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div class="text-xs text-gray-400">
                            Used: <span class="font-bold text-gray-700">${c.redeemed_count}</span> / ${c.max_redemptions || '∞'}
                        </div>
                        <div class="font-bold text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                            ${c.points_fixed ? `+${c.points_fixed}` : `${c.points_min}-${c.points_max}`} pts
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-2">
                        <button onclick="viewRedemptions('${c.id}')" class="w-full text-center text-xs font-bold text-brand-600 hover:text-brand-800 hover:bg-brand-50 py-2 rounded transition">
                            View Redemptions
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    if(window.lucide) window.lucide.createIcons();
};

window.openCreateCodeModal = () => {
    const html = `
        <div class="p-6">
            <h3 class="text-xl font-bold mb-4">Create New Code</h3>
            <form class="space-y-4">
                <div><label class="block text-sm font-medium text-gray-700">Code (e.g. WELCOME2025)</label><input type="text" class="w-full border p-2 rounded mt-1 uppercase font-mono"></div>
                <div><label class="block text-sm font-medium text-gray-700">Description</label><input type="text" class="w-full border p-2 rounded mt-1"></div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-sm font-medium text-gray-700">Points Amount</label><input type="number" class="w-full border p-2 rounded mt-1"></div>
                    <div><label class="block text-sm font-medium text-gray-700">Max Uses</label><input type="number" class="w-full border p-2 rounded mt-1"></div>
                </div>
                <button type="button" onclick="alert('Creation logic demo')" class="w-full bg-brand-600 text-white font-bold py-2 rounded hover:bg-brand-700">Generate Code</button>
            </form>
        </div>
    `;
    openModal(html);
};

window.viewRedemptions = async (couponId) => {
    alert("Loading redemptions for " + couponId);
    // Logic to fetch from coupon_redemptions table would go here
};

import { supabase } from './supabase-client.js';

// =======================
// STORE & PRODUCTS VIEW
// =======================
export const renderStore = async (container) => {
    const { data: products, error } = await supabase
        .from('products')
        .select('*, stores(name)')
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching products:', error);

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-xl text-gray-800">Store Inventory</h3>
            <button onclick="openCreateProductModal()" class="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2 shadow-sm transition-all">
                <i data-lucide="plus" class="w-4 h-4"></i> Add Product
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-200">
                        <tr>
                            <th class="p-4">Product</th>
                            <th class="p-4">Store</th>
                            <th class="p-4">Price (₹)</th>
                            <th class="p-4">EcoPoints</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${products.map(p => `
                            <tr class="hover:bg-gray-50 transition group">
                                <td class="p-4 flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                        ${p.image_url 
                                            ? `<img src="${p.image_url}" class="w-full h-full object-cover">` 
                                            : `<div class="flex items-center justify-center h-full text-gray-400"><i data-lucide="image" class="w-4 h-4"></i></div>`
                                        }
                                    </div>
                                    <div>
                                        <p class="font-bold text-gray-900">${p.name}</p>
                                        <p class="text-xs text-gray-500 line-clamp-1">${p.description || 'No description'}</p>
                                    </div>
                                </td>
                                <td class="p-4 text-gray-600">${p.stores?.name || 'General'}</td>
                                <td class="p-4 font-medium">₹${p.discounted_price}</td>
                                <td class="p-4 font-bold text-green-600">${p.ecopoints_cost} pts</td>
                                <td class="p-4">
                                    <span class="px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                                        ${p.is_active ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td class="p-4 text-right">
                                    <button class="text-gray-400 hover:text-brand-600 p-1 rounded hover:bg-brand-50 transition"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    // Re-init icons for the newly added HTML
    if(window.lucide) window.lucide.createIcons();
};

window.openCreateProductModal = () => {
    const html = `
        <div class="p-6">
            <h3 class="text-xl font-bold mb-4">Add New Product</h3>
            <form class="space-y-4">
                <div><label class="block text-sm font-medium text-gray-700">Product Name</label><input type="text" class="w-full border p-2 rounded mt-1"></div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-sm font-medium text-gray-700">Price (₹)</label><input type="number" class="w-full border p-2 rounded mt-1"></div>
                    <div><label class="block text-sm font-medium text-gray-700">EcoPoints Cost</label><input type="number" class="w-full border p-2 rounded mt-1"></div>
                </div>
                <button type="button" onclick="alert('Feature demo only')" class="w-full bg-brand-600 text-white font-bold py-2 rounded hover:bg-brand-700">Create Product</button>
            </form>
        </div>
    `;
    openModal(html);
};


// =======================
// ORDERS VIEW
// =======================
export const renderOrders = async (container) => {
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            users (full_name, student_id),
            order_items (
                quantity,
                products (name)
            )
        `)
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching orders:', error);

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-xl text-gray-800">Order Management</h3>
            <div class="flex gap-2">
                <button class="px-3 py-1 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Filter</button>
                <button class="px-3 py-1 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Export</button>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-200">
                        <tr>
                            <th class="p-4">Order ID</th>
                            <th class="p-4">Student</th>
                            <th class="p-4">Items</th>
                            <th class="p-4">Total</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${orders.map(o => {
                            const itemsSummary = o.order_items.map(i => `${i.quantity}x ${i.products?.name}`).join(', ');
                            return `
                            <tr class="hover:bg-gray-50 transition">
                                <td class="p-4 font-mono text-xs text-gray-500">#${o.id.slice(0, 8)}</td>
                                <td class="p-4">
                                    <div class="font-bold text-gray-900">${o.users?.full_name || 'Unknown'}</div>
                                    <div class="text-xs text-gray-500">${o.users?.student_id || ''}</div>
                                </td>
                                <td class="p-4 text-gray-700 truncate max-w-xs" title="${itemsSummary}">${itemsSummary}</td>
                                <td class="p-4">
                                    <div class="font-bold text-gray-900">₹${o.total_price}</div>
                                    <div class="text-xs text-green-600 font-medium">${o.total_points} pts</div>
                                </td>
                                <td class="p-4">
                                    <span class="px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                                        ${o.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                          o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}">
                                        ${o.status}
                                    </span>
                                </td>
                                <td class="p-4 text-right">
                                    ${o.status === 'pending' ? `
                                        <button onclick="updateOrderStatus('${o.id}', 'confirmed')" class="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition">Complete</button>
                                    ` : `<span class="text-gray-400 text-xs">No Action</span>`}
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

window.updateOrderStatus = async (orderId, status) => {
    if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) alert('Error updating order');
    else document.querySelector(`button[onclick*="${orderId}"]`).closest('tr').style.opacity = '0.5'; // Simple UI feedback
};

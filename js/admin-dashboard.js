import { supabase } from './supabase-client.js';

export const renderDashboard = async (container) => {
    // Fetch Stats using the SQL function provided
    const { data: stats, error } = await supabase.rpc('get_admin_dashboard_stats');
    if(error) console.error(error);

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            ${statCard('Total Distributed', stats?.distributed || 0, 'leaf', 'text-green-600', 'bg-green-100')}
            ${statCard('Points Redeemed', stats?.redeemed || 0, 'shopping-bag', 'text-blue-600', 'bg-blue-100')}
            ${statCard('System Balance', stats?.balance || 0, 'wallet', 'text-purple-600', 'bg-purple-100')}
            ${statCard('Pending Actions', stats?.pending || 0, 'clock', 'text-orange-600', 'bg-orange-100')}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold mb-4 text-gray-800">Impact Overview</h3>
                <div class="grid grid-cols-3 gap-4 text-center mb-6">
                    <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div class="text-2xl font-bold text-gray-900">${stats?.plastic_kg || 0} kg</div>
                        <div class="text-xs text-gray-500 uppercase tracking-wide font-bold">Plastic Recycled</div>
                    </div>
                    <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                         <div class="text-2xl font-bold text-gray-900">${(stats?.plastic_kg * 2.5).toFixed(1) || 0} kg</div>
                        <div class="text-xs text-gray-500 uppercase tracking-wide font-bold">CO2 Saved</div>
                    </div>
                    <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                         <div class="text-2xl font-bold text-gray-900" id="total-events-count">...</div>
                        <div class="text-xs text-gray-500 uppercase tracking-wide font-bold">Events Held</div>
                    </div>
                </div>
                <canvas id="trafficChart" height="100"></canvas>
            </div>
            
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold mb-4 text-gray-800">Top Performers</h3>
                <div id="top-students-list" class="space-y-4">Loading...</div>
            </div>
        </div>
    `;

    // Fetch extra data
    const { count } = await supabase.from('events').select('*', { count: 'exact', head: true });
    document.getElementById('total-events-count').textContent = count || 0;

    // Top Students
    const { data: topUsers } = await supabase.from('users').select('full_name, course, lifetime_points').order('lifetime_points', {ascending: false}).limit(5);
    const list = document.getElementById('top-students-list');
    list.innerHTML = topUsers.map((u, i) => `
        <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
            <div class="flex items-center gap-3">
                <span class="font-bold text-gray-400 w-4">#${i+1}</span>
                <div>
                    <div class="font-bold text-sm text-gray-900">${u.full_name}</div>
                    <div class="text-xs text-gray-500">${u.course}</div>
                </div>
            </div>
            <span class="font-bold text-green-600 text-sm">${u.lifetime_points} pts</span>
        </div>
    `).join('');

    // Chart.js implementation
    initChart();
};

const statCard = (title, value, icon, colorClass, bgClass) => `
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm font-medium">${title}</p>
            <p class="text-2xl font-black text-gray-900 mt-1">${value}</p>
        </div>
        <div class="w-12 h-12 rounded-full ${bgClass} flex items-center justify-center">
            <i data-lucide="${icon}" class="${colorClass}"></i>
        </div>
    </div>
`;

const initChart = () => {
    const ctx = document.getElementById('trafficChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Active Users',
                data: [12, 19, 15, 25, 22, 30, 45], // This would ideally come from analytics table
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
};

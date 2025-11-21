import { supabase } from './supabase-client.js';

export const renderEvents = async (container) => {
    const { data: events } = await supabase.from('events').select('*').order('start_at', {ascending: false});

    container.innerHTML = `
        <div class="flex justify-between mb-4">
            <h3 class="font-bold text-lg">All Events</h3>
            <button class="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2">
                <i data-lucide="plus-circle" class="w-4 h-4"></i> Create Event
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${events.map(e => `
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <div class="bg-brand-100 text-brand-800 text-xs font-bold px-2 py-1 rounded uppercase">${new Date(e.start_at).toDateString()}</div>
                        <span class="font-bold text-green-600">+${e.points_reward} pts</span>
                    </div>
                    <h4 class="font-bold text-lg mb-1">${e.title}</h4>
                    <p class="text-sm text-gray-500 mb-4 line-clamp-2">${e.description}</p>
                    <div class="mt-auto flex gap-2">
                         <button onclick="openAttendance('${e.id}', '${e.title}')" class="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-800">Attendance</button>
                         <button class="p-2 border rounded-lg hover:bg-gray-50"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    window.openAttendance = openAttendance;
};

const openAttendance = async (eventId, eventTitle) => {
    const { data: list } = await supabase.from('event_attendance')
        .select('*, users(full_name, student_id, course)')
        .eq('event_id', eventId);

    const modalHtml = `
        <div class="p-6 h-full flex flex-col">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Attendance: ${eventTitle}</h2>
                <button onclick="downloadPDF('${eventId}', '${eventTitle}')" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    <i data-lucide="file-down" class="w-4 h-4"></i> Download PDF
                </button>
            </div>
            <div class="overflow-y-auto flex-1 border rounded-lg">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-50"><tr><th class="p-3">Student</th><th class="p-3">Status</th><th class="p-3 text-right">Action</th></tr></thead>
                    <tbody>
                        ${list.map(row => `
                            <tr class="border-b">
                                <td class="p-3">
                                    <div class="font-bold">${row.users.full_name}</div>
                                    <div class="text-xs text-gray-500">${row.users.student_id}</div>
                                </td>
                                <td class="p-3"><span class="px-2 py-1 rounded text-xs font-bold ${row.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${row.status}</span></td>
                                <td class="p-3 text-right">
                                    ${row.status !== 'confirmed' ? 
                                        `<button onclick="markPresent('${row.id}', '${eventId}', '${eventTitle}')" class="bg-brand-600 text-white px-3 py-1 rounded text-xs font-bold">Mark Present</button>` 
                                        : '<span class="text-gray-400 text-xs">Locked</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    openModal(modalHtml);
};

window.markPresent = async (rowId, eventId, title) => {
    if(!confirm("Marking present will instantly award points and cannot be undone.")) return;
    
    // Trigger in SQL handles points awarding automatically on update
    const { error } = await supabase.from('event_attendance').update({ status: 'confirmed' }).eq('id', rowId);
    if(!error) openAttendance(eventId, title); // Refresh
};

window.downloadPDF = async (eventId, title) => {
    const { data: list } = await supabase.from('event_attendance').select('*, users(full_name, student_id, course)').eq('event_id', eventId);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(22, 163, 74); // Green
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("EcoCampus Event Attendance", 14, 13);
    
    // Event Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Event: ${title}`, 14, 30);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 36);

    // Table
    const tableData = list.map(row => [row.users.student_id, row.users.full_name, row.users.course, row.status.toUpperCase()]);
    
    doc.autoTable({
        startY: 45,
        head: [['ID', 'Student Name', 'Course', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74] }
    });

    doc.save(`${title}_Attendance.pdf`);
};

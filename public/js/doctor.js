// Doctor dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = '/doctor-login.html';
        return;
    }

    const user = getUser();
    if (user && user.role !== 'doctor') {
        window.location.href = '/patient-dashboard.html';
        return;
    }

    // Update welcome message
    const welcomeText = document.getElementById('welcomeText');
    if (welcomeText && user) {
        welcomeText.textContent = `Welcome, ${user.name}`;
    }

    // Load all appointments
    loadAllAppointments();
});

// Load all appointments for doctor
const loadAllAppointments = async () => {
    const container = document.getElementById('appointmentsList');
    const statsContainer = document.getElementById('statsContainer');

    if (!container) return;

    try {
        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        const appointments = await apiRequest('/appointments/all');

        // Update stats
        if (statsContainer) {
            const today = new Date().toDateString();
            const todayAppointments = appointments.filter(apt =>
                new Date(apt.date).toDateString() === today
            );
            const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

            statsContainer.innerHTML = `
                <div class="stat-card">
                    <h3>Total Appointments</h3>
                    <div class="value">${appointments.length}</div>
                </div>
                <div class="stat-card">
                    <h3>Today's Appointments</h3>
                    <div class="value">${todayAppointments.length}</div>
                </div>
                <div class="stat-card">
                    <h3>Pending</h3>
                    <div class="value">${pendingAppointments.length}</div>
                </div>
            `;
        }

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3>No appointments</h3>
                    <p>No patient appointments have been booked yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="appointments-table">
                <thead>
                    <tr>
                        <th>Patient Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${appointments.map(apt => `
                        <tr>
                            <td><strong>${apt.patientName}</strong></td>
                            <td>${apt.patientEmail}</td>
                            <td>${apt.patientPhone || '-'}</td>
                            <td>${formatDate(apt.date)}</td>
                            <td>${apt.time}</td>
                            <td>${apt.reason || '-'}</td>
                            <td>${getStatusBadge(apt.status)}</td>
                            <td>
                                <select class="form-control" style="padding: 0.5rem; min-width: 120px;" 
                                    onchange="updateStatus('${apt._id}', this.value)">
                                    <option value="pending" ${apt.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="confirmed" ${apt.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                    <option value="completed" ${apt.status === 'completed' ? 'selected' : ''}>Completed</option>
                                    <option value="cancelled" ${apt.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><p>Error loading appointments: ${error.message}</p></div>`;
    }
};

// Update appointment status
const updateStatus = async (appointmentId, status) => {
    try {
        await apiRequest(`/appointments/${appointmentId}`, 'PATCH', { status });
        loadAllAppointments();
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
};

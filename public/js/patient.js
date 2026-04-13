// Patient dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }

    const user = getUser();
    if (user && user.role !== 'patient') {
        window.location.href = '/doctor-dashboard.html';
        return;
    }

    // Update welcome message
    const welcomeText = document.getElementById('welcomeText');
    if (welcomeText && user) {
        welcomeText.textContent = `Welcome back, ${user.name}!`;
    }

    // Load appointments
    loadAppointments();

    // Handle appointment form
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleBookAppointment);
    }
});

// Load patient's appointments
const loadAppointments = async () => {
    const container = document.getElementById('appointmentsList');
    if (!container) return;

    try {
        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        const appointments = await apiRequest('/appointments/my');

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3>No appointments yet</h3>
                    <p>Book your first appointment using the form above.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="appointments-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${appointments.map(apt => `
                        <tr>
                            <td>${formatDate(apt.date)}</td>
                            <td>${apt.time}</td>
                            <td>${apt.reason || '-'}</td>
                            <td>${getStatusBadge(apt.status)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><p>Error loading appointments: ${error.message}</p></div>`;
    }
};

// Handle booking appointment
const handleBookAppointment = async (e) => {
    e.preventDefault();
    hideAlert('formAlert');

    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const reason = document.getElementById('reason').value;

    if (!date || !time) {
        showAlert('formAlert', 'Please select a date and time');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Booking...';
    submitBtn.disabled = true;

    try {
        await apiRequest('/appointments', 'POST', { date, time, reason });

        showAlert('formAlert', 'Appointment booked successfully!', 'success');
        e.target.reset();
        loadAppointments();
    } catch (error) {
        showAlert('formAlert', error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
};

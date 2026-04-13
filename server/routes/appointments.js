const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, doctorOnly } = require('../middleware/auth');

// @route   POST /api/appointments
// @desc    Book a new appointment
// @access  Private (Patient)
router.post('/', protect, async (req, res) => {
    try {
        const { date, time, reason } = req.body;

        const appointment = await Appointment.create({
            patient: req.user._id,
            patientName: req.user.name,
            patientEmail: req.user.email,
            patientPhone: req.user.phone || '',
            date,
            time,
            reason
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/appointments/my
// @desc    Get patient's appointments
// @access  Private (Patient)
router.get('/my', protect, async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id })
            .sort({ date: -1 });
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/appointments/all
// @desc    Get all appointments (Doctor only)
// @access  Private (Doctor)
router.get('/all', protect, doctorOnly, async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'name email phone')
            .sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PATCH /api/appointments/:id
// @desc    Update appointment status
// @access  Private (Doctor)
router.patch('/:id', protect, doctorOnly, async (req, res) => {
    try {
        const { status } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint for Render/Vercel
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));

// Seed default doctor account
const seedDoctor = async () => {
    try {
        const doctorExists = await User.findOne({ email: 'doctor@clinic.com' });
        if (!doctorExists) {
            await User.create({
                name: 'Dr. John Smith',
                email: 'doctor@clinic.com',
                password: 'doctor123',
                phone: '555-0100',
                role: 'doctor'
            });
            console.log('Default doctor account created: doctor@clinic.com / doctor123');
        }
    } catch (error) {
        console.error('Error seeding doctor:', error);
    }
};

// Serve HTML pages - catch all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Open http://localhost:${PORT} in your browser`);
    }
    await seedDoctor();
});

// Export for Vercel
module.exports = app;


const express = require('express');
const path = require('path');
const cors = require('cors');
const { sequelize } = require('./models/index');
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin'); // Changed from adminRoutes to adminRouter

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    console.log('Models loaded:', Object.keys(sequelize.models));
    // Schema changes must be applied via migrations: npx sequelize db:migrate
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
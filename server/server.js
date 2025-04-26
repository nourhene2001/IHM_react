const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./models');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Sync database
sequelize.sync({ force: false }).then(() => {
  console.log('MySQL database connected');
}).catch(err => {
  console.error('Database connection error:', err);
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);

console.log('authRoutes:', authRoutes);
console.log('jobRoutes:', jobRoutes);
console.log('userRoutes:', userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

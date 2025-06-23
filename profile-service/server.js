const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');
const profileRoutes = require('./routes/profile.routes');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:8080', 'http://nginx:8080'],
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/profile-service', profileRoutes);

mongoose.connect('mongodb://mongo:27017/bddTest')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('DB connection error:', err));

app.listen(3001, () => console.log('profile-service running on port 3001'));

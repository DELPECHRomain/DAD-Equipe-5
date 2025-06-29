const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const profileRoutes = require('./routes/profile.routes');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: ["http://localhost:8080", "http://nginx:8080"],
  credentials: true
}));

mongoose.connect("mongodb://mongo:27017/profile-db")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('DB connection error:', err));

app.use('/profile-service', profileRoutes);

app.listen(3001, () => console.log(`profile-service running on port 3001`));

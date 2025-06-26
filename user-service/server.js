const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:8080", "http://nginx:8080"],
  credentials: true
}));

mongoose.connect("mongodb://mongo:27017/user-db")
  .then(() => console.log('Connected to user-db'))
  .catch(err => console.error('DB connection error:', err));

app.use('/user-service', userRoutes);

app.listen(3000, () => console.log('user-service running on port 3000'));
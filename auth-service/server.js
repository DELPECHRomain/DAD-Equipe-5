const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth_user.routes');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:8080", "http://nginx:8080"],
  credentials: true
}));

mongoose.connect("mongodb://mongo:27017/auth-db")
  .then(() => console.log("Connection to the db successful"))
  .catch(err => console.error("Error connecting to the db:", err));

app.use('/auth-service', authRoutes);

app.listen(3000, () => console.log('auth-service running on port 3000'));

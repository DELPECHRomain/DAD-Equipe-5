const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const postRoutes = require('./routes/post.routes');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:8080", "http://nginx:8080"],
  credentials: true
}));

mongoose.connect("mongodb://mongo:27017/post-db")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('DB connection error:', err));

app.use('/post-service', postRoutes);

app.listen(3003, () => console.log(`post-service running on port 3003`));

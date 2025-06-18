const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const UserRouter = require('./routes/auth_user.routes');
const { Auth_User } = require('./models/Auth_User');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:8080"],
  credentials: true
}));

app.use(cookieParser());

app.get('/users', (req, res) => {
  Auth_User.find()
    .then(users => res.json(users))
    .catch(err => res.json(err));
});

app.use('/auth', UserRouter);

const port = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/bddTest")
.then(() => console.log("Connection to the db successful"))
.catch(err => console.error("Error connecting to the db:", err));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
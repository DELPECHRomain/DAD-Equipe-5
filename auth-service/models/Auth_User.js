const mongoose = require('mongoose');

const AuthUserSchema = new mongoose.Schema({
    username : {type: String, required: true, unique: true},
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true}
})

const Auth_User = mongoose.model('Auth_User', AuthUserSchema);

module.exports = Auth_User;
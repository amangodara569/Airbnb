// for authentication
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    //  imp-------username and password will be added by passport-local-mongoose automatically
    // we can add other fields if needed, e.g. email, name, etc.
    email: {
        type: String,
        required: true,
        unique: true
    },
});

User.plugin(passportLocalMongoose);//it will automatically do hashing , salting, and add username and password fields to the schema, and also add some methods for authentication

module.exports = mongoose.model('User', UserSchema);
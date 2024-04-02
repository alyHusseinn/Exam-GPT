const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['teacher', 'student'],
    }
});

userSchema.get('url', function() {
    if(this.role === 'teacher') {
        return `/teachers/${this._id}`;
    } else {
        return `/students/${this._id}`;
    }
});
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.post('save', async function(next) {
    console.log(this);
});

module.exports = mongoose.model('User', userSchema);
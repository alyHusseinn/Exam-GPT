const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
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
    enum: ['teacher', 'student']
  }
})

userSchema.virtual('url').get(function () {
  return this.role === 'teacher'
    ? `/teacher/${this._id}`
    : `/student/${this._id}`
})

userSchema.virtual('fullName').get( function () {
  return `${this.firstName} ${this.lastName}`
})
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.post('save', async function (next) {
  console.log(this)
})

module.exports = mongoose.model('User', userSchema)

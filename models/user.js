const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Submition = require('./submition')
const Exam = require('./exam')
const cloudinary = require('cloudinary').v2
const {
  CLOUD_NAME,
  CLOUDINARY_KEY,
  CLOUDINARY_SECRET
} = require('../config/env')

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET
})

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
    enum: ['admin', 'teacher', 'student']
  }
})

userSchema.virtual('url').get(function () {
  return this.role === 'teacher'
    ? `/teacher/${this._id}`
    : `/student/${this._id}`
})

userSchema.virtual('fullName').get(function () {
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

userSchema.pre('remove', async function (next) {
  // delete all exams of that user and submitions of that user
  try {
    await Submition.deleteMany({ student: this._id })
    await Exam.deleteMany({ teacher: this._id })
    // delete his avatar from cloudinary
    await cloudinary.uploader.destroy(this.avatar)
    next()
  } catch (error) {
    console.log(error)
  }
})

userSchema.post('save', async function (next) {
  console.log(this)
})

module.exports = mongoose.model('User', userSchema)

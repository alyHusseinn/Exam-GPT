const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const { body, validationResult } = require('express-validator')
const multer = require('multer')
const { storage } = require('../storage')
const jwt = require('jsonwebtoken')
const { NODE_ENV, JWT_SECRET } = require('../config/env')

const upload = multer({ storage })

exports.signup_get = (req, res) => {
  res.render('signup', {
    title: 'Register'
  })
}

exports.signup_post = [
  upload.single('avatar'),
  body('username', 'Please enter a valid username')
    .trim()
    .escape()
    .isLength({ min: 5 })
    .withMessage('Username must be at least 5 characters long'),
  body('password', 'Please enter a valid password')
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render('signup', {
        title: 'Register',
        errors: errors.array()
      })
    } else {
      const { username, password, role } = req.body
      const user = new User({
        username,
        password,
        avatar: req.file.path,
        role
      })
      try {
        await user.save()
        res.redirect('/login')
      } catch (err) {
        console.log(err)
        res.render('signup', {
          title: 'Register',
          errors: [
            {
              msg: err.message
            }
          ]
        })
      }
    }
  })
]

exports.login_get = (req, res) => {
  res.render('login', {
    title: 'Login'
  })
}

exports.login_post = [
  body('username', 'Please enter a valid username')
    .trim()
    .escape()
    .isLength({ min: 5 })
    .withMessage('Username must be at least 5 characters long'),
  body('password', 'Please enter a valid password')
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render('login', {
        title: 'Login',
        errors: errors.array()
      })
    } else {
      const { username, password } = req.body
      const user = await User.findOne({ username })
      const isPasswordMatch = user ? await user.matchPassword(password) : false
      if (!user || !isPasswordMatch) {
        return res.render('login', {
          title: 'Login',
          errors: [
            {
              msg: 'Invalid username or password'
            }
          ]
        })
      } else {
        const payload = {
          id: user._id,
          role: user.role,
          username: user.username,
          avatar: user.avatar,
          url: user.url
        }

        const token = jwt.sign(payload, JWT_SECRET, {
          expiresIn: '5 days',
          algorithm: 'HS256'
        })

        res.cookie('token', token, {
          maxAge: 5 * 24 * 60 * 60 * 1000,
          secure: NODE_ENV === 'production' ? true : false,
          httpOnly: true,
          path: '/'
        })

        res.redirect('home')
      }
    }
  })
]

exports.logout_post = (req, res, next) => {
  res.cookie('token', '')
  res.redirect('home')
}

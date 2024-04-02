const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const { storage } = require("../storage");
const jwt = require("jsonwebtoken");

const upload = multer({ storage });

exports.signup_get= (req, res) => {
  res.render("signup", {
    title: "Register",
  });
};

exports.signup_post = [
  upload.single("avatar"),
  body("username", "Please enter a valid username")
    .trim()
    .escape()
    .isLength({ min: 5 })
    .withMessage("Username must be at least 5 characters long"),
  body("password", "Please enter a valid password")
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("signup", {
        title: "Register",
        errors: errors.array(),
      });
    } else {
      const { username, password, role } = req.body;
      const user = new User({
        username,
        password,
        avatar: req.file.path,
        role,
      });
      try {
        await user.save();
        res.redirect("/login");
      } catch (err) {
        console.log(err);
        res.render("signup", {
          title: "Register",
          errors: [
            {
              msg: err.message,
            },
          ],
        });
      }
    }
  }),
];

exports.login_get = (req, res) => {
  res.render("login", {
    title: "Login",
  });
};

exports.login_post = [
  body("username", "Please enter a valid username")
    .trim()
    .escape()
    .isLength({ min: 5 })
    .withMessage("Username must be at least 5 characters long"),
  body("password", "Please enter a valid password")
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("login", {
        title: "Login",
        errors: errors.array(),
      });
    } else {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.render("login", {
          title: "Login",
          errors: [
            {
              msg: "Invalid username or password",
            },
          ],
        });
      }
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.render("login", {
          title: "Login",
          errors: [
            {
              msg: "Invalid username or password",
            },
          ],
        });
      } else {
        const payload = {
          user: {
            id: user._id,
            role: user.role,
            username: user.username,
          },
        };
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: "5 days" },
          (err, token) => {
            if (err) throw err;
            res.cookie("token", token, {
              maxAge: 5 * 24 * 60 * 60 * 1000,
              httpOnly: true,
              path: "/",
            });
            res.redirect("/home");
          }
        );
      }
    }
  }),
];

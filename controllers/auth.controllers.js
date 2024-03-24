const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const { body, validationResult } = require("express-validator");

exports.registerUser_get = (req, res) => {
  res.render("register", {
    title: "Register",
  });
};

exports.registerUser_post = [
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
      res.render("register", {
        title: "Register",
        errors: errors.array(),
      });
    } else {
      const { username, password } = req.body;
      const user = new User({
        username,
        password,
      });
      try {
        await user.save();
        res.redirect("/login");
      } catch (err) {
        console.log(err);
        res.render("register", {
          title: "Register",
          errors: [
            {
              msg: "Username already exists",
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
      }
    }
  }),
];

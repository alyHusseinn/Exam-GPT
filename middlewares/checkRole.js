const jwt = require("jsonwebtoken");
const asyncHanlder = require("express-async-handler");

const checkRole = (role) => {
  return asyncHanlder((req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== role) {
      return res.status(403).send("Forbidden");
    }
    next();
  });
};

module.exports = checkRole;

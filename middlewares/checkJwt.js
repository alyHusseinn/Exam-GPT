const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const checkJwt = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/login");
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        res.locals.user = decoded; // to be used in views
        next();
    } catch (error) {
        console.error(error);
        res.status(400).send("Invalid token.");
    }
}

module.exports = checkJwt;
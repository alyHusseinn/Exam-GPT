const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/login");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.locals.user = decoded; // to be used in views
        next();
    } catch (error) {
        res.status(400).send("Invalid token.");
    }
}

module.exports = isAuth;
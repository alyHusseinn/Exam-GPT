var express = require('express');
var router = express.Router();
// we should have three routes student and teacher and exam

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/home');
});

module.exports = router;

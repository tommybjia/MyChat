var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'MyChat' });
});


router.get('/getuser', function(req, res) {
  var data = {
  	name:"tommybjia",
  	sex:"M",
  	img:"/images/1.jpg"
  };
  res.json(data);
});


router.get('/getalluser', function(req, res) {
  var data = [
  {
  	name:"tommybjia",
  	sex:"M",
  	img:"/images/1.jpg"
  }];
  res.json(data);
});

module.exports = router;

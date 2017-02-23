var express = require('express');
var router = express.Router();
var orm = require('orm');
var opts = {
  database : "paysystem",
  protocol : "mysql",
  host : "127.0.0.1",
  username : "root",
  password : "jyh960928",
  query : {
    pool : true
  }
}

var un = '';
var pw = '';
var q_ro = "";
var q_h = 0;
var q_m = 0;
var q_payway = "";
var q_money = 0;
var loginstate = false;
var regtest = false;
var paystate = false;
var changestate = false;

/* GET home page. */
router.get('/', function(req, res, next) {
  loginstate = false;
  res.render('index',{error:''});
});

router.get('/contact', function(req, res, next) {
  loginstate = false;
  res.render('contact',{s:'var a = false'});
});

router.get('/notice_mod', function(req, res, next) {
  loginstate = false;
  res.render('notice_mod');
});

router.get('/register', function(req, res, next) {
  loginstate = false;
  res.render('register',{error:''});
});

router.get('/register_sec', function(req, res, next) {
  loginstate = false;
  if(un==''){
    res.send("è¯·å…ˆ <a href='/'>ç™»å½•</a> or <a href='/register'>æ³¨å†Œ</a>");//ÇëÏÈ<a href='/index'>µÇÂ¼</a> or <a href='/register'>×¢²á</a>
  }else
    res.render('register_sec');
});

router.get('/register_thr', function(req, res, next) {
  loginstate = false;
  if(!regtest){
    res.send("è¯·å…ˆ <a href='/'>ç™»å½•</a> or <a href='/register'>æ³¨å†Œ</a>");//ÇëÏÈ<a href='/index'>µÇÂ¼</a> or <a href='/register'>×¢²á</a>
  }else{
    regtest = false;
    res.render('register_thr');
  };

});

router.post('/register', function(req, res, next){
  orm.connect(opts, function(err,db){
    if(err)throw err;

    var User = db.define("users",{
      username: String,
      password: String,
      tname: String,
      phone: String,
      num: String,
      mail: String,
      room: String
    });

    un = req.body.username;
    pw = req.body.password;

    User.exists({username:un}, function(err,judge) {
      if(judge){
        res.render('register',{error:"<script>alert('ç”¨æˆ·åå·²å­˜åœ¨')</script>"});//ÓÃ»§ÃûÒÑ´æÔÚ
      }else{
        res.redirect('/register_sec');
      };
    });
  });
});

router.post('/register_sec',function(req,res,next){
  orm.connect(opts, function(err,db){
    if(err)throw err;

    var User = db.define("users",{
      username: String,
      password: String,
      tname: String,
      phone: String,
      num: String,
      mail: String,
      room: String
    });

    var na = req.body.tname;
    var ph = req.body.phone;
    var nu = req.body.number;
    var ro = ''+req.body.dong1+req.body.dong2+'-'+req.body.ceng+req.body.shi1+req.body.shi2;

    var newUser = {};
    newUser.username = un;
    newUser.password = pw;
    newUser.tname = na;
    newUser.phone = ph;
    newUser.num = nu;
    newUser.room = ro;
    newUser.mail = '';

    User.create(newUser, function(err, results) {
      if(err)throw err;
    });
    User.sync(function(err){
      console.log('Renew User table successfully!');
    });
    regtest = true;
    res.redirect('/register_thr');
  });
});

router.post('/register_thr', function(req, res, next) {
  loginstate = true;
  res.redirect('/user');
});

router.post('/',function(req, res, next){
  orm.connect(opts, function(err,db) {
    if (err)throw err;

    var User = db.define("users", {
      username: String,
      password: String,
      tname: String,
      phone: String,
      num: String,
      mail: String,
      room: String
    });

    var loun = req.body.login_user;
    var lopw = req.body.login_pass;

    User.find({username:loun}, function(err,u){
      if(u == undefined)
        res.render('index',{error:"<script>alert('ç”¨æˆ·åä¸å­˜åœ¨!')</script>"});//ÓÃ»§²»´æÔÚ,Çë×¢²á!
      else if(u.length==1){
        if(u[0].password==lopw){
          un = loun;
          loginstate = true;
          res.redirect('user');
        }else
          res.render('index',{error:"<script>alert('å¯†ç é”™è¯¯! ');</script>"})//ÃÜÂë´íÎó!
      }else
        res.render('index',{error:"<script>alert('ç”¨æˆ·åä¸å­˜åœ¨!')</script>"});//ÓÃ»§²»´æÔÚ,Çë×¢²á!
    });
  });
});

router.post('/contact',function(req,res,next){
  orm.connect(opts,function(err,db){
    if(err)throw err;

    var Contact = db.define("contact",{
      cname : String,
      cmail : String,
      ccontent: String
    });

    var cn = req.body.username;
    var cm = req.body.mail;
    var len = req.body.contact.length;
    console.log(len);
    if(len<250)
      var ccon = req.body.contact;
    else
      var ccon = '';

    var newContact = {};
    newContact.cname = cn;
    newContact.cmail = cm;
    newContact.ccontent = ccon;
    Contact.create(newContact, function(err, results) {
      if(err)throw err;
    });
    res.render('contact',{s:"var a = true"});
    Contact.sync(function(err){
      console.log('Renew User table successfully!');
    });
  });
});



//after login
router.get('/user',function(req,res){
  if(paystate){
    paystate = false;
    res.render('user',{username: un,room: q_ro,f: "s();"});
  }else if(changestate){
    changestate = false;
    res.render('user',{username: un,room: q_ro,f: "c();"});
  } else if(loginstate){
    orm.connect(opts, function(err,db) {
      if (err)throw err;

      var User = db.define("users", {
        username: String,
        room: String
      });

      User.find({username: un}, function (err, u) {
        var ro = u[0].room;
        q_ro = ro;
        res.render('user', {username: un,room:ro,f: ''});
      });
    });
  }else
    res.send("è¯·å…ˆ <a href='/'>ç™»å½•</a> or <a href='/register'>æ³¨å†Œ</a>");//ÇëÏÈ<a href='/index'>µÇÂ¼</a> or <a href='/register'>×¢²á</a>
});

router.post('/user',function(req,res){
  orm.connect(opts, function(err,db) {
    if (err)throw err;

    q_h = req.body.hour;
    q_m = req.body.minute;
    q_payway = req.body.pay_way;
    q_money = (q_h*120+q_m*2)/100;

    var Control = db.define("control", {
      hroom: String
    });

    Control.exists({hroom: q_ro}, function (err, ju) {
      if(!ju)
        res.render('user', {username: un,room: q_ro,f: "f();"});
      else
        res.render('userpay',{username:un,room:q_ro,hour:q_h,minute:q_m,payway:q_payway,money:q_money});
    });
  });
});

router.get('/userchange',function(req,res){
  if(loginstate){
      res.render('userchange', {username: un});
  }else
    res.send("è¯·å…ˆ <a href='/'>ç™»å½•</a> or <a href='/register'>æ³¨å†Œ</a>");//ÇëÏÈ<a href='/index'>µÇÂ¼</a> or <a href='/register'>×¢²á</a>
});

router.post('/userchange', function (req,res) {
  orm.connect(opts,function(err,db){
    if(err)throw  err;

    var User = db.define("users", {
      username: String,
      room: String
    });

    q_ro = ''+req.body.dong1+req.body.dong2+'-'+req.body.ceng+req.body.shi1+req.body.shi2;

    User.find({username:un},function(err,u){
      u[0].room = q_ro;
    });
    changestate = true;
    res.redirect('/user');
  });
});

router.post('/userpay',function(req,res){
  orm.connect(opts, function(err,db) {
    if (err)throw err;

    var Pay = db.define("pays", {
      username: String,
      room: String,
      hour:Number,
      minute:Number,
      payway:String,
      money:Number,
      paydate:String
    });

    var newPay = {};
    newPay.username = un;
    newPay.room = q_ro;
    newPay.hour = q_h;
    newPay.minute = q_m;
    newPay.payway = q_payway;
    newPay.paydate = new Date();
    newPay.money = q_money;

    q_h = 0;
    q_m = 0;
    q_payway = "";
    q_money = 0;

    Pay.create(newPay, function (err, results) {
      if (err)throw err;
    });
    Pay.sync(function (err) {
      console.log('Renew User table successfully!');
    });

    var Control = db.define('control',{
      hroom:String,
      hour:Number,
      minute:Number,
      state:Boolean
    });

    Control.find({hroom:newPay.room},function(err,u){
      u[0].hour = newPay.hour;
      u[0].minute = newPay.minute;
      u[0].state = true;
      u[0].save(function(err){});
    });

    paystate = true;
    res.redirect('/user');
  });
});

router.get('/userinfo',function(req,res){
  if(loginstate){
    orm.connect(opts, function(err,db) {
      if (err)throw err;

      var User = db.define("users", {
        username: String,
        password: String,
        tname: String,
        phone: String,
        num: String,
        mail: String,
        room: String
      });

      User.find({username:un}, function(err,u){
        var na = u[0].tname;
        var nu = u[0].num;
        var ph = u[0].phone;
        var ro = u[0].room;
        var ma = u[0].mail;
        q_ro = ro;
        res.render('userinfo',{username:un,name:na,num:nu,phone:ph,room:ro,mail:ma});
      });

    });
  }
  else
    res.send("è¯·å…ˆ <a href='/'>ç™»å½•</a> or <a href='/register'>æ³¨å†Œ</a>");//ÇëÏÈ<a href='/index'>µÇÂ¼</a> or <a href='/register'>×¢²á</a>
});

router.get('/passchange',function(req,res){
  if(loginstate)
    res.render('passchange',{username:un,error:''});
  else
    res.send("è¯·å…ˆ <a href='/'>ç™»å½•</a> or <a href='/register'>æ³¨å†Œ</a>");//ÇëÏÈ<a href='/index'>µÇÂ¼</a> or <a href='/register'>×¢²á</a>
});

router.get('/infochange',function(req,res){
  if(loginstate){
    orm.connect(opts, function(err,db) {
      if (err)throw err;

      var User = db.define("users", {
        username: String,
        password: String,
        tname: String,
        phone: String,
        num: String,
        mail: String,
        room: String
      });

      User.find({username:un}, function(err,u){
        var un = u[0].username;
        var na = u[0].tname;
        var nu = u[0].num;
        var ph = u[0].phone;

        var ma = u[0].mail;
        if(ma=='')
          res.render('infochange',{username:un,name:'value='+na,num:'value='+nu,phone:'value='+ph,mail:'',room:q_ro});
        else
          res.render('infochange',{username:un,name:'value='+na,num:'value='+nu,phone:'value='+ph,mail:'value='+ma,room:q_ro});
      });

    });
  }
  else
    res.send("è¯·å…ˆ <a href='/'>ç™»å½•</a> or <a href='/register'>æ³¨å†Œ</a>");//ÇëÏÈ<a href='/index'>µÇÂ¼</a> or <a href='/register'>×¢²á</a>
});

router.get('/roomchange',function(req,res){
  if(loginstate){
    orm.connect(opts, function(err,db) {
      if (err)throw err;

      var User = db.define("users", {
        username: String,
        password: String,
        tname: String,
        phone: String,
        num: String,
        mail: String,
        room: String
      });

      User.find({username:un}, function(err,u){
        var un = u[0].username;
        var na = u[0].tname;
        var nu = u[0].num;
        var ph = u[0].phone;

        var ma = u[0].mail;
        if(ma=='')
          res.render('roomchange',{username:un,name:'value='+na,num:'value='+nu,phone:'value='+ph,mail:''});
        else
          res.render('roomchange',{username:un,name:'value='+na,num:'value='+nu,phone:'value='+ph,mail:'value='+ma});
      });

    });
  }
  else
    res.send("è¯·å…ˆ <a href='/'>ç™»å½•</a> or <a href='/register'>æ³¨å†Œ</a>");//ÇëÏÈ<a href='/index'>µÇÂ¼</a> or <a href='/register'>×¢²á</a>
});

router.post('/passchange', function(req,res){
  orm.connect(opts,function(err,db){
    if(err) throw err;

    var User = db.define("users",{
      username:String,
      password:String,
      room:String
    });

    var opass = req.body.origin_pass;
    var npass = req.body.new_pass;
    User.find({username:un,password:opass},function(err,u){
      if(u[0] == undefined)
        res.render('passchange',{username:un,error:"a()"})
      else{
        q_ro = u[0].room;
        u[0].password = npass;
        u[0].save(function(err){});
        changestate = true;
        res.redirect('/user');
      }
    });
  });
});

router.post('/infochange', function(req,res){
  orm.connect(opts, function(err,db){
    if(err)throw err;

    var User = db.define("users",{
      username:String,
      password:String,
      tname: String,
      phone: String,
      num: String,
      mail: String,
      room: String
    });

    var tn = req.body.myname;
    var ph = req.body.myphone;
    var nu = req.body.mynum;
    var ma = req.body.mymail;

    User.find({username:un}, function (err,u) {

      q_ro = u[0].room;
      u[0].tname = tn;
      u[0].phone = ph;
      u[0].num = nu;
      u[0].mail = ma;

      u[0].save(function(err){});
    });

    changestate = true;
    res.redirect('/user');
  });
});

router.post('/roomchange', function(req,res){
  orm.connect(opts, function(err,db){
    if(err)throw err;

    var User = db.define("users",{
      username:String,
      password:String,
      tname: String,
      phone: String,
      num: String,
      mail: String,
      room: String
    });

    var tn = req.body.myname;
    var ph = req.body.myphone;
    var nu = req.body.mynum;
    var ma = req.body.mymail;
    var ro = ''+req.body.dong1+req.body.dong2+'-'+req.body.ceng+req.body.shi1+req.body.shi2;
    q_ro = ro;

    User.find({username:un}, function (err,u) {
      u[0].tname = tn;
      u[0].phone = ph;
      u[0].num = nu;
      u[0].mail = ma;
      u[0].room = ro;
      u[0].save(function(err){});
    });
    changestate = true;
    res.redirect('/user');
  });
});

router.post('/host', function(req,res){
  orm.connect(opts,function(err,db){

    var Hard = db.define("control",{
      hroom : String,
      hour : Number,
      minute : Number,
      state : Boolean
    });

    Hard.find({state:true}, function(err,r){
      var l = r.length;
      var i = 0;
      var obj = {};
      for(;i<l;i++) {
        obj[i] = {roomnum: r[i].hroom, hour: r[i].hour, minute: r[i].minute};
        r[i].hour = 0;
        r[i].minute = 0;
        r[i].state = false;
        r[i].save(function(err){});
      };
      res.send(obj);

    });
  });
});

router.get('/history',function(req,res){
  if(loginstate){
      res.render('history');
  }
  else
    res.send("è¯·å…ˆ <a href='/'>ç™»å½•</a> or <a href='/register'>æ³¨å†Œ</a>");//ÇëÏÈ<a href='/index'>µÇÂ¼</a> or <a href='/register'>×¢²á</a>
});

router.post('/historydata',function(err,res){
  orm.connect(opts,function(err,db){
    if (err) throw  err;

    var Pay = db.define("pays", {
      username: String,
      room: String,
      hour:Number,
      minute:Number,
      payway:String,
      money:Number,
      paydate:String
    });

    Pay.find({username:un},function(err,p){
      res.send(p);
    })
  });
});
router.get('/c',function(req,res){
  orm.connect(opts, function(err,db){
    if(err)throw err;

    var C = db.define("control",{
      hroom: String,
      hour:Number,
      minute:Number,
      state:Boolean
    });

    C.sync(function(err){
      console.log('Renew User table successfully!');
    });
  });
});

module.exports = router;

const express     = require('express'),
      router      = express.Router(),
      passport    = require('passport'),
      User        = require('../models/user');
      
//root route
router.get("/", (req,res) => {
  res.render("landing");
});

// Sign up form
router.get("/register", (req, res) => {
  res.render("register", {page: "register"});
});

// handling signup logic
router.post("/register", (req, res) => {
  if(req.body.camp.avatar.length === 0) {
    req.body.avatar = "https://www.w3schools.com/bootstrap4/img_avatar3.png"
  }
  var camp = req.body.camp;
  camp.username = req.body.username;
  var newUser = new User(camp);
  if(req.body.adminCode === "secretCode123") {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, (err,user) => {
    if(err || !user) {
      req.flash("error", err);
      return res.render("register", {error: err.message});
    }
    else {
      passport.authenticate("local")(req, res, () => {
        req.flash("success", `Successfully Signed Up! Nice to meet you ${user.username}`);
        res.redirect("/campgrounds");
      });
    }
  });
});

// Login form
router.get("/login", (req, res) => {
  res.render("login", {page: "login"});
});

// handling login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: 'Invalid username or password',
    successFlash: 'Welcome back to CampIndia!'
  }), (req, res) => {
});

// Logout route
router.get("/logout", (req,res) => {
  req.logOut();
  req.flash("success", "See you later!");
  res.redirect("/campgrounds");
});

module.exports = router;
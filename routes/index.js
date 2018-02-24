var express = require("express");

// This is not the same as "app"
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Thread = require("../models/thread");
var Comment = require("../models/comment");
var middleware = require("../middleware");


// INDEX
router.get("/", function(req, res) {
    Thread.find({}, function(err, allThreads) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong");
            return res.redirect("back");
        }
        else {
            res.render("index", { threads: allThreads, page: 'index' });
            // note that here we did not modify the allCampgrounds object, it can be used without any problem. Just like a js object!
        }
    });
});

// LOGIN
router.get("/login", function(req, res){
  res.render("login"); 
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash : true // allow flash messages
    }), function(req, res){
});

// SIGN UP
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
            
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Zeddit " + user.username);
            res.redirect("/"); 
        });
    });
});

// logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
});

module.exports = router;
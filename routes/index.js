var express = require("express");

// This is not the same as "app"
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Thread = require("../models/thread");


// INDEX
router.get("/", function(req, res) {
    
    // Pagination
    var perPage = 4;
    var pageQuery = parseInt(req.query.page); // what and why this? Who put that query up there?
    var pageNumber = pageQuery ? pageQuery : 1;

    // Fuzzy search is implemented via submitting a form to "/campgrounds" with method="GET", the data is submitted via query string, which can be accessed via "req.query.search(the name of the input)"
    if (req.query.search) {
        // TODO: This should be simplified
        // There are some npm packages that will make the fuzzy search more efficient, but here we are using regualr expressions; However, there are some issues with regular expressions in this case, for instance, some malicious program can slow down your server or even crashed it with some specific searching patterns
        
        const regex = new RegExp(escapeRegex(req.query.search), 'gi'); // g is global and i is ignore case, those are options for this constructor
        Thread.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(
            function(err, foundThreads) {
                Thread.count({name: regex}).exec(function (err, count) {
                    if (err) {
                        req.flash("error", "Something went wrong");
                        return res.redirect("back");
                    }
                    else {
                        if (foundThreads.length < 1) {
                            req.flash("error", "No campground match that query, please try again");
                            return res.redirect("/");
                        } else {
                            res.render("index", { 
                                threads: foundThreads, 
                                current: pageNumber,
                                pages: Math.ceil(count / perPage),
                                page: "index",
                                search: req.query.search
                            });
                        }
                    }
                });
            });
        
    }
    else {
        // Only showing perPage # of items, skip those ahead
        Thread.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allThreads) {
            // count means how many pages in total in this case
            Thread.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("index", {
                        threads: allThreads,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        page: "index",
                        search: false
                    });
                }
            });
        });
    }
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
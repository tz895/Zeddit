var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");

var passport = require("passport"),
    LocalStrategy = require("passport-local");
    
var User = require("./models/user");
var Thread = require("./models/thread");
var Comment = require("./models/comment");
var middleware = require("./middleware");

// time api
app.locals.moment = require('moment');

mongoose.connect("mongodb://localhost/a");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(flash());

// PASSPORT CONFIGURATION
// setup the express-session, in a short clean way
app.use(require("express-session")({
    secret: "ashdiuahsduhwhdnjxasndhas",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

/** The middleware to add user obj to every template (Update: this middleware mainly focusing on how to make params avaliable to all templates)
 * Same as "res.render("[anytemplate]", { currentUser: req.user });"
*/
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

// INDEX
app.get("/", function(req, res) {
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
app.get("/login", function(req, res){
   res.render("login"); 
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash : true // allow flash messages
    }), function(req, res){
});

// SIGN UP
app.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
app.post("/register", function(req, res){
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
app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
});

// ADD THREAD
app.get("/threads/new", function(req, res) {
    res.render("threads/new");
});

// CREATE
// the convension is called "rest"
// the convension on a new post name, should be the exactly the same as the one how shows it
app.post("/threads", middleware.isLoggedIn, function(req, res) {
    var newThread = req.body.thread;
    newThread.author = {
        id: req.user._id,
        username: req.user.username
    };

    // Create a new thread and save to DB
    Thread.create(newThread, function(err, newlyCreated) {
        if (err) {
            req.flash("error", "Cannot create a new thread");
            res.redirect("/");
        }
        else {
            // console.log(newlyCreated);
            req.flash("success", "Successfully created a thread")
            res.redirect("/");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Zeddit Server has started...");
}); 


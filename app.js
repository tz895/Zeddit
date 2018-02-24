var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var mongoose = require("mongoose");
var flash = require("connect-flash");

var passport = require("passport"),
    LocalStrategy = require("passport-local");
    
var User = require("./models/user");

// time api
app.locals.moment = require('moment');

mongoose.connect("mongodb://localhost/a");

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method")); // "_method" is sth to remind your app to keep an eye on this string in the URL
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

//requring routes
var threadRoutes = require("./routes/threads"),
    indexRoutes = require("./routes/index"),
    commentRoutes = require("./routes/comments");
    


/** The middleware to add user obj to every template (Update: this middleware mainly focusing on how to make params avaliable to all templates)
 * Same as "res.render("[anytemplate]", { currentUser: req.user });"
*/
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


app.use("/", indexRoutes);
app.use("/threads", threadRoutes);
app.use("/threads/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Zeddit Server has started...");
}); 


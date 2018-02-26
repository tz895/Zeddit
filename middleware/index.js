// all the middleare goes here
var middlewareObj = {};
var Thread = require("../models/thread");
var Comment = require("../models/comment");
var User = require("../models/user");

middlewareObj.checkThreadOwnership = function (req, res, next) {
    // check if the user is logged in
    if (req.isAuthenticated()) {
        Thread.findById(req.params.id, function(err, foundThread) {
            if (err || !foundThread) {
                req.flash("error", "Campground not found");
                return res.redirect("back");
            }
            else {
                if (foundThread.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error", "You don't have the permission to do this.");
                    return res.redirect("back");
                }
            }
        });
    }
    else {
        
        req.flash("error", "You need to be logged in to do that!"); 
        return res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
    // check if the user is logged in
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Something went wrong");
                res.redirect("/");
            }
            else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error", "You don't have permisson to do that");
                    res.redirect("/thread/" + req.params.id);
                }
            }
        });
    }
    else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkProfileOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        User.findById(req.params.id, function (err, foundUser) {
            if (err || !foundUser) {
                req.flash("error", "Something went wrong");
                res.redirect("/");
            }
            else {
                if (foundUser._id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error", "You don't have permisson to do that");
                    res.redirect("/");
                }
            }
        });
    }
    else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn =  function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    
    /**
     * Show the flash message, to make this web app more easy for user to use with such prompt message
     * "error" is the key of this message
     * The 2nd param is the message
     * Only adding this line won't display it for us, it only gives us a capability to access this message; You will have to handle it in your route
     * This message is only avaliable once, and that's why it's called flash
    */
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}

// This obj will contain all the function
module.exports = middlewareObj;
var express = require("express");
var router = express.Router();
var User = require("../models/user");
var middleware = require("../middleware");
var Thread = require("../models/thread");
var Comment = require("../models/comment");


//show profile
router.get("/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser){
        if (err || !foundUser) {
            req.flash("error", "This user is not available");
            return res.redirect("back");
        } else {
            Thread.find().where("author.id").equals(foundUser._id).exec(function (err, threads) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("profiles/show", { user: foundUser, threads: threads});
                }
            });
            
        }
    });
});


//admin
router.get("/:id/admin", middleware.checkProfileOwnership, function(req, res){
    res.render("profiles/admin", { userId: req.params.id });
});

router.post("/:id/admin", middleware.checkProfileOwnership, function(req, res){
    if (req.body.adminCode === "12345") {
        User.findById(req.params.id, function (err, user){
            if (err || !user) {
                req.flash("error", "User not found");
                return res.redirect("/");
            }
            user.isAdmin = true;
            user.save();
            req.flash("success", "Now you are an admin");
            return res.redirect("/profiles/" + req.params.id);
        });
    }
    else {
        req.flash("error", "Admin code doesn't match, sorry");
        return res.redirect("/profiles/" + req.params.id);
    }
    
});


//Edit
router.get("/:id/edit", middleware.checkProfileOwnership, function(req, res){
        User.findById(req.params.id, function(err, foundUser){
        if (err || !foundUser) {
            req.flash("error", "This user is not available");
            return res.redirect("back");
        } else {
            res.render("profiles/edit", { user: foundUser});
        }
    });
});

//Update
router.put("/:id", middleware.checkProfileOwnership, function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser) {
        if (err) {
            res.redirect("back");
        }
        else {
            req.flash("success", "Successfully updated a profile");
            res.redirect("/profiles/" + req.params.id);
        }
    });
});


module.exports = router;
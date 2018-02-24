var express = require("express");

// This is not the same as "app"
var router = express.Router();
var Thread = require("../models/thread");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// ADD THREAD
// THE SEQUENCE OF ROUTING MATTERS
router.get("/new", function(req, res) {
    res.render("threads/new");
    // res.send("Create a new thread");
});

// SHOW 
router.get("/:id", function(req, res) {
    Thread.findById(req.params.id).populate("comments").exec(function(err, foundThread) {
        if (err || !foundThread) {
            console.log(err);
            req.flash("error", "The thread you are looking for is not found");
            return res.redirect("back");
        }
        else {
            res.render("threads/show", { thread: foundThread });
        }
    });
});

// CREATE
router.post("/", middleware.isLoggedIn, function(req, res) {
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



// EDIT
router.get("/:id/edit", middleware.checkThreadOwnership, function(req, res) {
    // if we get to this point, there shouldn't be any err, because we done checking that in the middleware
    Thread.findById(req.params.id, function(err, foundThread) {
        if (err || !foundThread) {
            req.flash("error", "THE THREAD IS NOT FOUND (/threads/:id/edit)");
            return res.redirect("back");
        }
        else {
            res.render("threads/edit", { thread: foundThread });
        }
    });
});



// UPDATE 
router.put("/:id", middleware.checkThreadOwnership, function(req, res) {
    // find and update the correct campground; "req.body.campground" is an obj that contains name, image and description
        var newThread = req.body.thread;
        Thread.findByIdAndUpdate(req.params.id, newThread, function(err, thread) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            }
            else {
                req.flash("success", "Successfully Updated!");
                res.redirect("/threads/" + thread._id);
            }
        });

});

// DESTROY 
router.delete("/:id", middleware.checkThreadOwnership, function(req, res) {
    /**
     * TODO: 
     * If we delete a campground, all the comments should also be deleted!!!
     * But this was not implemented until now! Let's see if Colt will actually do that ... 
     */
     var commentsIds = [];
    Thread.findById(req.params.id, function(err, foundThread) {
       if (err) {
           console.log("Error in routes/thread.js")
       } else {
           commentsIds = foundThread.comments;
       } 
    });
    
    commentsIds.forEach(function(id){
        Comment.findByIdAndRemove(id, function(err){
            if (err)  console.log("Error in routes/thread.js - comments remove");
            else console.log("Deleted comment #" + id);
        });
    });

    Thread.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            req.flash("error", "The thread you are looking for is not found");
            return res.redirect("/");
        }
        else {
            req.flash("success", "Successfully deleted a thread");
            return res.redirect("/");
        }
    });
});

module.exports = router;

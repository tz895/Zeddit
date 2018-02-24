var express = require("express");
var Thread = require("../models/thread");
var Comment = require("../models/comment");
var router  = express.Router({mergeParams: true});

// var middleware = require("../middleware/index");
// if you require the directory, it will require index.js by default; All the npm packages are required in this default way.
var middleware = require("../middleware");

// ====================
// COMMENTS ROUTES
// ====================

// comments new
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // The :id is not making through, so we need merge params, so that the ":id" will be passed through
    Thread.findById(req.params.id, function(err, thread) {
        if (err) {
            req.flash("error", "The thread you are looking for is not found");
            console.log(err);
            return res.redirect("back");
        }
        else {
            res.render("comments/new", { thread: thread });
        }
    });
});

// comments create
router.post("/", middleware.isLoggedIn, function(req, res) {
    
    Thread.findById(req.params.id, function(err, thread) {
        if (err) {
            console.log(err);
            req.flash("error", "The thread you are looking for is not found");
            return res.redirect("/");
        }
        else {
            Comment.create({
                text: req.body.comment.text
            }, function(err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                    return res.redirect("back");
                }
                else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username; // it's not necessary to have this "username", this can be acquired by ".findById()", but this is faster
                    // save comment, if you change the context by assignment, then it's necessary to use ".save()", otherwise, the change will not be saved
                    comment.save();
                    
                    // newer version requires push with ._id
                    thread.comments.push(comment._id);
                    thread.save();
                    req.flash("success", "Successfully created a comment");
                    res.redirect("/threads/" + thread._id);
                }
            });
        }
    })
});

// Show the comment edit form
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            req.flash("error", "Something went wrong");
            return res.redirect("back");
        } else {
            res.render("comments/edit", { thread_id: req.params.id, comment: foundComment });
        }
    });
});

// Update the comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        }
        else {
            req.flash("success", "Successfully updated a comment");
            res.redirect("/threads/" + req.params.id);
        }
    });
});

// Comment Destory
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/threads/" + req.params.id);
       }
    });
});



module.exports = router;
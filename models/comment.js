var mongoose = require("mongoose");

// TODO: Comments should have comments
var commentSchema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" 
        },
        username: String
    }
});

module.exports = mongoose.model("Comment", commentSchema);
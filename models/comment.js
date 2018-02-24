var mongoose = require("mongoose");

// TODO: Comments should have comments
var commentSchema = mongoose.Schema({
    text: String,
    created: {type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" 
        },
        username: String
    },
    thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread' }
});

module.exports = mongoose.model("Comment", commentSchema);
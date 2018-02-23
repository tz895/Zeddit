var mongoose = require("mongoose");

var threadSchema = new mongoose.Schema({
    title: String,
    image: String,
    content: String,
    votes: Number,
    redirect: String,
    adversal: Boolean,
    created: {type: Date, default: Date.now}, 
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    // association; it is an array because ... 
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment" // refering to the "Comment" database
    }]
});

module.exports = mongoose.model("Thread", threadSchema);
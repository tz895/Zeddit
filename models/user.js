var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: String,
    // email: {type: String, unique: true},
    created: {type: Date, default: Date.now},
    isAdmin: { type: Boolean, default: false },
    avatar: {type: String, default: "https://freeiconshop.com/wp-content/uploads/edd/reddit-outline.png"}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
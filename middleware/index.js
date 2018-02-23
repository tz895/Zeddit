// all the middleare goes here
var middlewareObj = {};


// A middleware to check whether a user is logged in, if not, redirect to login; If we want this to be applied to all routes, write app.use(isLoggedIn), but in our case, just apply this to comments routes
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
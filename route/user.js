//for login and register
const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync.js');
router.get("/register", (req, res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res)=>{
    try {
        const {username, email, password} = req.body;
        const user = new User({username, email});//can provide username and email, but password will be provided by passport-local-mongoose
        const registeredUser = await User.register(user, password);//this is a method provided by passport-local-mongoose to register a new user, it will take the user object and the password, it will hash the password and store it in the database, it will return the registered user object.
        req.flash("success", "welcome to wanderlust");
        res.redirect("/login");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
}));



//login route
router.get("/login", (req, res)=>{
    res.render("users/login.ejs");
});
//post request will authenticate that if the user exist or not and if the password is correct or not, if everything is correct then it will redirect to the listings page, otherwise it will redirect back to the login page and show an error message, we can also use flash messages to show the error message on the login page, for that we need to set the failureFlash option to true in the passport.authenticate middleware, and then we can access the error message in the login.ejs template using the error variable that we set in the flash middleware in app.js
router.post("/login", wrapAsync(passport.authenticate("local", {successRedirect: "/listings", failureRedirect: "/login", failureFlash: true})));

router.get("/logout", (req, res, next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "logged out successfully");
        res.redirect("/listings");
    });
});

module.exports = router;
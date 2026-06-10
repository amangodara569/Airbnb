//for login and register
const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync.js');
const {saveRedirectUrl} = require('../middleware.js');

router.get("/register", (req, res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res)=>{
    try {
        const {username, email, password} = req.body;
        const user = new User({username, email});//can provide username and email, but password will be provided by passport-local-mongoose
        const registeredUser = await User.register(user, password);//this is a method provided by passport-local-mongoose to register a new user, it will take the user object and the password, it will hash the password and store it in the database, it will return the registered user object.
       //after registerng the user , the user should automatically be logged in  for that 
       //above line the user has been registered but not logged in, so we need to log in the user after registering, for that we can use the passport.authenticate method, this method will take the strategy name and a callback function, the strategy name is "local" because we are using the local strategy for authentication, and the callback function will be called after the authentication is done, if there is any error during authentication, it will be passed to the callback function as an argument, if there is no error, then the user will be logged in and we can set a flash message and redirect to the listings page.
        req.login(registeredUser, (err)=>{//inbuilt method for login , same as for logout
          if(err){
            return next(err);
          }
                req.flash("success", "welcome to wanderlust");
                res.redirect("/lisitings");
        });

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
router.post("/login",
    saveRedirectUrl,//first save url the authenticate the user and then redirect to the original url that the user was trying to access before logging in, for that we can use the saveRedirectUrl middleware to save the original url in the session, and then we can access that url in the callback function of the passport.authenticate middleware and redirect to that url after logging in, if there is no original url then we can redirect to the listings page, so that after logging in the user will be redirected back to the page that they were trying to access before logging in, so that they can access that page without having to navigate to it again after logging in.
     wrapAsync(passport.authenticate("local", {successRedirect: "/listings", failureRedirect: "/login", failureFlash: true}),

        async(req, res)=>{
            req.flash("success", "welcome back!");
            res.redirect("req.session.redirectUrl || /listings"); //this will redirect to the original url that the user was trying to access before logging in, if there is no original url then it will redirect to the listings page, we can set the original url in the isLoggedIn middleware in middleware.js file, so that when a user tries to access a protected route without logging in, they will be redirected to the login page, and after logging in they will be redirected back to the original url that they were trying to access before logging in, so that they can access the protected route that they were trying to access before logging in.
        }

    ));

router.get("/logout", (req, res, next)=>{
    req.logout((err)=>{ //inbuilt method for logout, it will remove the user from the session and then it will call the callback function, if there is any error while logging out, it will pass the error to the callback function, so we need to handle that error in the callback function, if there is no error then we can set a flash message and redirect to the listings page.
        if(err){
            return next(err);
        }
        req.flash("success", "logged out successfully");
        res.redirect("/listings");
    });
});

module.exports = router;
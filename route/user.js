//for login and register
const express = require('express');
const router = express.Router();

router.get("/register", (req, res)=>{
    res.render("users/signup.ejs");
});
router.post("/signup", async (req, res)=>{
    try {
        const {username, email, password} = req.body;
        const user = new User({username, email});//can provide username and email, but password will be provided by passport-local-mongoose
        const registeredUser = await User.register(user, password);//this is a method provided by passport-local-mongoose to register a new user, it will take the user object and the password, it will hash the password and store it in the database, it will return the registered user object.
        req.flash("success", "welcome to wanderlust");
        res.redirect("/login");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});
module.exports = router;
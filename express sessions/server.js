const express = require("express");
const session = require("express-session");
//npm i express-session
const app = express();

app.use(session({
    secret: "keyboard cat", //used to sign session id
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000
    }
}));

app.get("/", (req, res) => {
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send(`You have visited this page ${req.session.count} times`);
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
const express = require("express");
const session = require("express-session");
//npm i express-session
const app = express();
//write this to remoe warnings
const sesionOptions = {
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: true, //further we can uts edit in this
    cookie: {
        maxAge: 60 * 60 * 1000
    }
}
app.use(session(sesionOptions));

app.get("/register", (req, res)=>{
    let {name = "guest"} = req.query;
    console.log(request.session);
    request.session.name = name;
    //res.send(`Hello ${name}`);
    res.redirect("/greet");
});//if we are sending request on multiple routes , still e have a same session for that user, we can store data in that session and access it on other routes
app.get("/greet", (req, res)=>{
    //let name = req.session.name || "guest";
    res.send(`Hello ${request.sesionOptions.name || "guest"}`);
});

app.get("/", (req, res) => {
    if (req.session.count) {  //if it xists
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send(`You have visited this page ${req.session.count} times`);
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
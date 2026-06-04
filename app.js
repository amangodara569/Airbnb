const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressError = require('./utils/expressError');
const session = require('express-session');
const flash = require('connect-flash');
//requireing router files
const listings = require("./route/listing.js")
const reviews = require("./route/review.js")
const flash = requrire("connect-flash");


//cookies and sessions
const sessionOptions = {
    secret: "mysecretkey",
    resave:false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now()+1000*60*60*24, //this means that the cookie will expire in 24 hours save data for 24 hours, after that it will delete it
        maxAge: 1000*60*60*24, //this means that the cookie will expire in 24 hours
        httpOnly: true, //this means that the cookie cannot be accessed by client side javascript, it can only be accessed by the server, this is a security measure to prevent cross site scripting attacks, if we set it to false, then the cookie can be accessed by client side javascript, which can be a security risk, so we set it to true to prevent that.}
    }
}
app.use(session(sessionOptions));
//using flash after session, because flash uses session to store the messages, so we have to use session before flash
app.use(flash());
//middleware for flash
app.use((req, res, next)=>{
    res.locals.success = req.flash('success'); //this will make the success message available in all the templates, so that we can display it in the index page after creating a new listing, we can also use it to display error messages if there is any error while creating a new listing, for example if there is a validation error, we can set the flash message in the validateListing middleware and then display it in the index route, so that when the user tries to create a new listing with invalid data, they will see an error message on the index page.
    res.locals.error = req.flash('error');
    next();
});//now we need to add this in ejs template to display

//basically we use it for creating boiler plate code for our templates, like header and footer, so we don't have to repeat the same code in every template.
//that can be used again and again
app.engine('ejs',ejsMate);

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));
app.use(express.static(path.join(__dirname, 'public')));

//using the router files
app.use("/listings", listings); //this means that all the routes defined in the listing router file will be prefixed with /listings, so we don't have to write /listings in every route in the listing router file, we can just write / in the listing router file and it will be treated as /listings in the app.js file, this is called mounting the router, and it helps us to keep our code organized and also avoid repetition of code.
app.use("/listings/:id/reviews", reviews);



main()
    .then(()=>{
        console.log("database are up");
    }).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
};

app.listen(3000, ()=>{
      console.log('server is up and running');
});
app.get('/', (req, res)=>{
    res.send("working fine");
});
// app.get('/testListing',async (req, res)=>{
//     const listing = new Listing({
//         title: "my new villa",
//         description: "a beautiful villa with a pool",
//         price: 1000,
//         location: "bali",
//         country: "indonesia",
//     });
//     await listing.save();
//     console.log("test success");
//     res.send('done');
// });




//if users try to access a non existing route
app.all(/(.*)/, (req, res, next)=>{  //if path doesnt mathches with any of the above routes
    next(new expressError(404, "page not found"));
});



//middleware for error handling, using wrap async this will automatically be called
app.use((err, req, res, next)=>{
    let {statusCode= 500, message ="something went wrong"} = err;
    res.render("listings/error.ejs", {message, statusCode});
    //res.status(statusCode).send(message);
});


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressError = require('./utils/expressError');

//requireing router files
const listings = require("./route/listing.js")
const reviews = require("./route/review.js")


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


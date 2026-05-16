const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');// for error handling
const expressError = require('./utils/expressError');
//basically we use it for creating boiler plate code for our templates, like header and footer, so we don't have to repeat the same code in every template.
//that can be used again and again
app.engine('ejs',ejsMate);

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));
app.use(express.static(path.join(__dirname, 'public')));


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

app.get('/listings', wrapAsync(async (req, res)=>{
    const alllistings = await Listing.find({});
    res.render('listings/index.ejs', {listings: alllistings});
}));

//new route
app.get('/listings/new', (req, res)=>{
    res.render('listings/new.ejs');
});
//create route
app.post('/listings', wrapAsync(async (req, res, next)=>{

        let {title, description, price, city, country} = req.body;
            const newListing = new Listing({
            title: title,
            description: description,
            price: price,
            location: city,
            country: country,
        });
        await newListing.save();
        res.redirect('/listings');    
 
}));
//update route
app.get('/listings/:id/edit', wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', {listing});
}));
app.put('/listings/:id', wrapAsync(async (req, res)=>{
    const {id} = req.params;
    if(!req.body.listing){ //multiple errors can occur, like what if they dont send any data 
        throw new expressError(400, "invliad data");
    }
    let {title, description, price, city, country} = req.body;
    await Listing.findByIdAndUpdate(id, {
        title: title,
        description: description,
        price: price,
        location:city,
        country: country,
    });
    res.redirect(`/listings/${id}`);
}));
//delete route
app.delete('/listings/:id', wrapAsync(async (req, res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));
//if users try to access a non existing route
app.all("*", (req, res, next)=>{  //if path doesnt mathches with any of the above routes
    next(new expressError(404, "page not found"));
})
//middleware for error handling, using wrap async this will automatically be called
app.use((err, req, res, next)=>{
    let {statusCode= 500, message ="something went wrong"} = err;
    res.status(statusCode).send(message);
});

//show route, (click on listing title to view more about it)
app.get('/listings/:id' , wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/show.ejs', {listing});
}));;//should be at the end of the file, otherwise it will be treated as a dynamic route and will override the new route.

//when you go for customizing templates, install ejs-mate 
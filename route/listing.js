// past all the listing routes here from app.js and then export the router instance
const express = require('express');

const router = express.Router();  //router instance to define listing related routes
//now we need to require many things from app.js file like listing model, review model, wrapAsync, expressError, validateListing, validateReview, because we will be using them in the listing routes, so we need to require them in this file as well.
const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listing');




//db schema validation, created it into a middleware this can be used as parameter in async routes
const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    } else {
        next();
    }
}





router.get('/', wrapAsync(async (req, res)=>{
    const alllistings = await Listing.find({});
    res.render('listings/index.ejs', {listings: alllistings});
}));

//new route
router.get('/new', (req, res)=>{
    res.render('listings/new.ejs');
});

//create route

router.post('/', validateListing, wrapAsync(async (req, res, next)=>{
        let {title, description, price, city, country} = req.body;
            const newListing = new Listing({
            title: title,
            description: description,
            price: price,
            location: city,
            country: country,
        });
        await newListing.save();
        //use flash to display success message after creating a new listing, we can use flash to display success message after creating a new listing, we can set the flash message in the create route and then display it in the index route, so that when the user creates a new listing, they will see a success message on the index page, we can also use flash to display error messages if there is any error while creating a new listing, for example if there is a validation error, we can set the flash message in the validateListing middleware and then display it in the index route, so that when the user tries to create a new listing with invalid data, they will see an error message on the index page.
        req.flash('success', 'Listing created successfully!');
        res.redirect('/listings');    
}));
//update route
router.get('/:id/edit', wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', {listing});
}));




router.put('/:id', validateListing, wrapAsync(async (req, res)=>{
    const {id} = req.params;
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
router.delete('/:id', wrapAsync(async (req, res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));


//show route, (click on listing title to view more about it)
router.get('/:id' , wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews'); //populate is used to get the review data from the review collection, because in listing schema we have defined reviews as an array of object ids, so we need to populate it to get the actual review data, otherwise we will get only the object ids of the reviews, and we wont be able to show the review data on the show page of the listing, so we need to populate it to get the actual review data, and then we can show it on the show page of the listing.
    res.render('listings/show.ejs', {listing});
}));//should be at the end of the routes, otherwise it will be treated as a dynamic route and will override the new route.

module.exports = router;
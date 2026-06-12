// past all the listing routes here from app.js and then export the router instance
const express = require('express');

const router = express.Router();  //router instance to define listing related routes
//now we need to require many things from app.js file like listing model, review model, wrapAsync, expressError, validateListing, validateReview, because we will be using them in the listing routes, so we need to require them in this file as well.
const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listing');
const {isLoggedIn, isOwner} = require('../middleware');

//after adding flash , create a ejs template for that and add in boilerplate in respected position where we want to show it


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
    //to check if the user is logged in or not, if not then redirect to login page, we can use this middleware in the new route and create route, because only logged in users can create a new listing, so we can use this middleware in the new route and create route, so that if a user tries to access the new route or create route without logging in, they will be redirected to the login page, and after logging in they will be redirected back to the new route or create route, so that they can create a new listing, we can also use this middleware in the edit route and update route, because only logged in users can edit or update a listing, so we can use this middleware in the edit route and update route, so that if a user tries to access the edit route or update route without logging in, they will be redirected to the login page, and after logging in they will be redirected back to the edit route or update route, so that they can edit or update a listing.
    if(req.isAuthenticated()){
        return res.render('listings/new.ejs');
    }//we can transfer this logic to a middleware function and then use that middleware function in the new route and create route, so that we can avoid code duplication and make our code cleaner and more maintainable, we can create a middleware function called isLoggedIn and then use that middleware function in the new route and create route, so that we can avoid code duplication and make our code cleaner and more maintainable.
    req.flash('error', 'You must be logged in to create a new listing!');
    res.redirect('/login');
});

//create route

router.post('/', isLoggedIn, validateListing, wrapAsync(async (req, res, next)=>{
        let {title, description, price, city, country} = req.body;
            const newListing = new Listing({
            title: title,
            description: description,
            price: price,
            location: city,
            country: country,
            owner: req.user._id,
        });
        await newListing.save();
        //use flash to display success message after creating a new listing, we can use flash to display success message after creating a new listing, we can set the flash message in the create route and then display it in the index route, so that when the user creates a new listing, they will see a success message on the index page, we can also use flash to display error messages if there is any error while creating a new listing, for example if there is a validation error, we can set the flash message in the validateListing middleware and then display it in the index route, so that when the user tries to create a new listing with invalid data, they will see an error message on the index page.
        req.flash('success', 'Listing created successfully!');
        res.redirect('/listings');    
}));
//update route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    //if this lisitn doesnt exist
    if(!listing){
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    res.render('listings/edit.ejs', {listing});
}));




router.put('/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res)=>{
    const {id} = req.params;
    let {title, description, price, city, country} = req.body;
    await Listing.findByIdAndUpdate(id, {
        title: title,
        description: description,
        price: price,
        location:city,
        country: country,
    });
    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
}));




//delete route
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    //flash message
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
}));


//show route, (click on listing title to view more about it)
router.get('/:id' , wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: { path: 'author' }  // nested populate: get the User document for each review's author
        })
        .populate('owner');  // also populate the listing owner so we can show listing.owner.username
    if(!listing){
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    res.render('listings/show.ejs', {listing});
}));//should be at the end of the routes, otherwise it will be treated as a dynamic route and will override the new route.

module.exports = router;
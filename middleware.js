module.exports.isLoggedIn = (req, res, next)=>{
    console.log(req.path, "..",req.originalUrl);
    //req.path = the path that we want to access
    //req.originalUrl = the path that we had been on before accessing the path that we want to access, for example if we are on the home page and we want to access the new listing page, then req.path will be /listings/new and req.originalUrl will be /, so we can use req.originalUrl to redirect the user back to the page that they were on before accessing the new listing page, so that after logging in they will be redirected back to the new listing page, and they can create a new listing.
    //how these both can be corelated = lets say you access create lisitng = from there you redirected to login 
    //after login you will be redirected back to home page but that is not what we want 
    //we want to be redirected back to the create listing page after login, so for that we can use req.originalUrl to redirect the user back to the page that they were on before accessing the new listing page, so that after logging in they will be redirected back to the new listing page, and they can create a new listing.
    
    
    req.session.redirectUrl = req.originalUrl; //this will store the original url in the session, so that we can access it after logging in, and then we can redirect the user back to that url after logging in, so that they can access the page that they were trying to access before logging in.
    //some values of req cant be accessed after login because after login the req will be different, so we need to store the original url in the session, so that we can access it after logging in, and then we can redirect the user back to that url after logging in, so that they can access the page that they were trying to access before logging in.
    //we can store them in local and then access them in the login route and then redirect the user back to that url after logging in, so that they can access the page that they were trying to access before logging in.
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You must be logged in to do that!');
    res.redirect('/login'); 
}


module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl; //this will make the redirectUrl variable available in all the templates, so that we can access it in the login route and then redirect the user back to that url after logging in, so that they can access the page that they were trying to access before logging in.
    }
    next();
};

module.exports.isOwner = (req, res, next) => {
    let {id} = req.params;
    const Listing = require('./models/listing');
    Listing.findById(id).then((listing) => {
        if(!listing.owner.equals(req.user._id)){
            req.flash('error', 'You are not the owner of this listing!');
            return res.redirect(`/listings/${id}`);
        }
        next();
    }).catch((err) => {
        req.flash('error', 'Listing not found!');
        res.redirect('/listings');
    });
};
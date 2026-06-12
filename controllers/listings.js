const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');


module.exports.index = wrapAsync(async (req, res)=>{
    const alllistings = await Listing.find({});
    res.render('listings/index.ejs', {listings: alllistings});
};
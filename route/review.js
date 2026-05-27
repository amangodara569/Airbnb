const express = require('express');

const router = express.Router({mergeParams: true}); //router instance to define review related routes, mergeParams is used to access the params from the parent router, in this case we need to access the id of the listing from the parent router, so we need to use mergeParams: true, otherwise we won't be able to access the id of the listing in the review router file.

const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const { reviewSchema } = require('../schema.js');
const Listing = require('../models/listing');
const Review = require('../models/review.js');

const validateReview = (req, res, next) => {
	let { error } = reviewSchema.validate(req.body);
	if (error) {
		let errMsg = error.details.map((el) => el.message).join(",");
		throw new expressError(400, errMsg);
	} else {
		next();
	}
};

router.post('/:id/reviews', validateReview, wrapAsync(async (req, res) => {
	let listing = await Listing.findById(req.params.id);
	const { rating, comment } = req.body.review;
	const review = new Review({
		rating,
		comment,
	});
	listing.reviews.push(review);
	await review.save();
	await listing.save();
	res.redirect(`/listings/${listing._id}`);
}));

router.delete('/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
	const { id, reviewId } = req.params;
	await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	res.redirect(`/listings/${id}`);
}));

module.exports = router;

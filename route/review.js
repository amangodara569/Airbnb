const express = require('express');

const router = express.Router({mergeParams: true}); //router instance to define review related routes, mergeParams is used to access the params from the parent router, in this case we need to access the id of the listing from the parent router, so we need to use mergeParams: true, otherwise we won't be able to access the id of the listing in the review router file.

const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const { reviewSchema } = require('../schema.js');
const Listing = require('../models/listing');
const Review = require('../models/review.js');
const { isLoggedIn } = require('../middleware');

// isReviewAuthor — only the person who wrote the review can delete it
const isReviewAuthor = wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Review not found!');
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to delete this review!');
        return res.redirect(`/listings/${id}`);
    }
    next();
});

const validateReview = (req, res, next) => {
	let { error } = reviewSchema.validate(req.body);
	if (error) {
		let errMsg = error.details.map((el) => el.message).join(",");
		throw new expressError(400, errMsg);
	} else {
		next();
	}
};

router.post('/:id/reviews', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
	let listing = await Listing.findById(req.params.id);
	const { rating, comment } = req.body.review;
	const review = new Review({
		rating,
		comment,
	});
	review.author = req.user._id;  // save who wrote this review
	listing.reviews.push(review);
	await review.save();
	await listing.save();
	req.flash('success', 'Review created successfully!'); //added flash message
	res.redirect(`/listings/${listing._id}`);
}));

router.delete('/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
	const { id, reviewId } = req.params;
	await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	req.flash('success', 'Review deleted successfully!');
	res.redirect(`/listings/${id}`);
}));

module.exports = router;

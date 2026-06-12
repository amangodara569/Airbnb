const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment:{
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // who wrote this review — needed for authorization (only author can delete their review)
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

module.exports = mongoose.model("Review", reviewSchema);
//remember every review will be connected to a particular listing, so we will add a reference to the listing in the review schema, and we will also add a reference to the review in the listing schema, so that we can easily populate the reviews when we get the listing. this is called bidirectional referencing. we will see how to do this in the next video.
//1 x n = relation . one listing , multiple reviews

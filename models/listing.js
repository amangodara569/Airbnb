const mongoose = require('mongoose');
const Review = require('./review.js');

const listingSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
    },
    description:{
        type:String,
    },
    image:{
        filename: String,
        url: {
            type: String,
            default: "https://unsplash.com/photos/drifting-car-emitting-smoke-on-a-city-street-5qg0iENAlpg",
        }
    },
    price:{
        type: Number,
    },
    location:{
        type: String,
    },
    country: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }
    ]   ,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});
//create a  post mongoose middleware to delete all reviews if we delete a paritcular listing
//require review.js
//in routes the delete listing will be called , findoneanddelete will be called and then the post middleware will be called and then we can delete all the reviews associated with that listing, so that we can keep our database clean without any dangling references of reviews which are associated with the deleted listing, because if we dont delete the reviews associated with the deleted listing, then we will have dangling references of reviews in our database which will cause an error when we try to access the review data from the listing document, because the review document will be deleted but the reference will still be there in the listing document, so we need to delete all the reviews associated with the deleted listing, so that we can avoid any errors and also keep our database clean without any dangling references.
listingSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews,
            }
        });
    }
});
const Listing =mongoose.model('Listing', listingSchema);  //in  mongo - listings
module.exports = Listing;
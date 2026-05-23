const mongoose = require('mongoose');

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
    ]   
});

const Listing =mongoose.model('Listing', listingSchema);  //in  mongo - listings
module.exports = Listing;
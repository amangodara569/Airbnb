const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: { //setting a default image
        default:"https://unsplash.com/photos/two-white-buildings-against-a-clear-blue-sky-GDts7JhtWbw", 
        type: String,
        set: (v) => v===" "? "https://unsplash.com/photos/two-white-buildings-against-a-clear-blue-sky-GDts7JhtWbw" : v,
    },  
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
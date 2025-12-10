const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const Listing = require("./models/listing.js");
app.listen(port, ()=>{
    console.log("starting at:",port);
});

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

//calling main function
main().then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
});

//setting up connection
async function main(){
    await mongoose.connect(MONGO_URL);
};

//routes
app.get("/",(req,res)=>{
    res.send("root");
});

app.get("/testListing", async (req,res)=>{
    let sampleListing = new Listing({
        title: "my new villa",
        description: "between the buildings",
        price: 1200,
        location: "Miami",
        county: "United States of America",
    });
    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful testing");
});
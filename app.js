const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
//models
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");

app.set("view engine","ejs");
app.set(("views",path.join(__dirname,"/views")));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"/public")));
app.listen(port, ()=>{
    console.log("starting at:",port);
});

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

//calling main function
main().then(()=>{
    console.log("connection successful for airbnb");
}).catch((err)=>{
    console.log(err);
});

//setting up connection
async function main(){
    await mongoose.connect(MONGO_URL);
};

//routes
app.get("/",(req,res)=>{
    res.send("root is live");
});


//success

// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "my new villa",
//         description: "between the buildings",
//         price: 1200,
//         location: "Miami",
//         county: "United States of America",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

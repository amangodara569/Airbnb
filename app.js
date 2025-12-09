const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
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
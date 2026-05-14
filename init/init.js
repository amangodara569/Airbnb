//do all the initilization part in init
//setup our database from here only
const mongoose = require('mongoose');
const sampleData = require('./data.js');
//lisitng also required
const listing = require('../models/listing.js');
//listing ke format me hi to data dalega
main()
    .then(()=>{
        console.log("database are up");
    }).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
};
//can also run this function in.then of main function
const initdb = async ()=>{
    //clean existing data if any
    await listing.deleteMany({});
    await listing.insertMany(sampleData.data);
    console.log("database has been initialized with sample data");
}

initdb()
    .then(()=>{
        console.log("success in db");
    }).catch(err => console.log("mkc"+err)); 
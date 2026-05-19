const mongoose = require('mongoose');

main().then(()=>{
    console.log('database connected');
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/relationships');
}


//one to few implementation, 
const userSchema = new mongoose.Schema({
    name: String,
    addresses: [
        {
            location: String,
            city: String,
        }
    ],

    
});;
const user = mongoose.model("user", userSchema);


const addUser = async() =>{
    let u1 = new user({
        name: "raj",
        addresses: [
            {
                location: "street-delhi",
                city: "Delhi",
            },
            {
                location: "street-Mumbai",
                city: "Mumbai",
            }
        ],
    });
//can also add location like
    u1.addresses.push({
        location: "street-kolkata",
        city: "Kolkata",
    });
    await u1.save();
}   

addUser();
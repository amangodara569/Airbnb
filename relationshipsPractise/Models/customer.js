//one to many implementation
const mongoose = require('mongoose');

main().then(()=>{
    console.log('database connected');
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/relationships');
}


const orderSchema = new mongoose.Schema({
    type: String,
    qty: Number,
    price: Number,
});


const customerSchema = new mongoose.Schema({
    name: String,
    orders: [
        orderSchema,
    ],
});

const customer = mongoose.model("customer", customerSchema);
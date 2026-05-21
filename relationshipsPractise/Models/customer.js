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
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
        },
    ],
});
const order = mongoose.model("order", orderSchema);
const customer = mongoose.model("customer", customerSchema);


const addCustomer = async()=>{
    let cust = new customer({
        name: "raj",
        orders: [],
    });

    let order1 = new order({
        type: "pizza",
        qty: 1,
        price: 200,
    });
    let order2 = new order({
        type: "burger",
        qty: 2,
        price: 300,
    });

    cust.orders.push(order1);
    cust.orders.push(order2);

    await cust.save();
    await order1.save();
    await order2.save();
}

// addCustomer();   // uncomment to add a new customer with orders


// ---- .populate() example ----
// Without populate: orders array will show only ObjectIds
// With populate: orders array will show the full order documents

const findCustomer = async () => {

    // ❌ Without .populate() — returns raw ObjectIds
    let resultWithoutPopulate = await customer.findOne({ name: "raj" });
    console.log("WITHOUT populate:");
    console.log(resultWithoutPopulate);
    // Output: { name: 'raj', orders: [ ObjectId('...'), ObjectId('...') ] }

    console.log("\n--- --- ---\n");

    // ✅ With .populate() — replaces ObjectIds with actual order documents
    let resultWithPopulate = await customer.findOne({ name: "raj" }).populate("orders");
    console.log("WITH populate:");
    console.log(resultWithPopulate);
    // Output: { name: 'raj', orders: [ { type: 'pizza', qty: 1, price: 200 }, { type: 'burger', qty: 2, price: 300 } ] }
};

findCustomer();
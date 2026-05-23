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
        { //customer ke andar orders ka array hoga, jisme har order ka reference hoga
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
        },
    ],
});


//write all mongoose middleware before creating the models, because if we create the models before writing the middleware, then the middleware will not work. because mongoose will not be able to find the model when it is trying to execute the middleware. so we have to write all the middleware before creating the models.
//for pre

// customerSchema.pre("findOneAndDelete", async function(next){});

//for post
//to delete all orders after deletion of customer
customerSchema.post("findOneAndDelete", async function(customerData, next){
    //find orders and delete them
    //also can use a condition
    if(customerData.orders.length > 0){ //like if order exist , be aware of these situations
        await order.deleteMany({ _id: { $in: customerData.orders } });
    }
    next();
});



const order = mongoose.model("order", orderSchema);
const customer = mongoose.model("customer", customerSchema);


const addCustomer = async () => {
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
};

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



//mongoose middleware , what are they? they are functions that are executed before or after certain events occur in the database. they are used to perform certain actions before or after certain events occur in the database. for example, we can use mongoose middleware to perform certain actions before or after saving a document in the database. we can also use mongoose middleware to perform certain actions before or after updating a document in the database. we can also use mongoose middleware to perform certain actions before or after deleting a document in the database.

// there are two types of mongoose middleware: pre and post. pre middleware is executed before the event occurs, while post middleware is executed after the event occurs. we can use pre middleware to perform certain actions before saving a document in the database, while we can use post middleware to perform certain actions after saving a document in the database. we can also use pre middleware to perform certain actions before updating a document in the database, while we can use post middleware to perform certain actions after updating a document in the database. we can also use pre middleware to perform certain actions before deleting a document in the database, while we can use post middleware to perform certain actions after deleting a document in the database.

// example of pre middleware

//add a customer in database
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
//delete customer and it order ,if we do normal deletion with findbyIdAndDelete then only customer will be deleted but orders will remain in the database, to delete orders as well we can use pre middleware
//these are mongoose middleware functions that will run before the findByIdAndDelete method is executed on the customer model. in this middleware, we will find the customer by id and then delete all the orders that are associated with that customer.
//pre = run before the query is executed
//post = run after the query is executed

//according to mongoose, if we call findByIdAndDelete on the customer model, it will trigger the pre middleware or findbyidanddeleteone
// function that we have defined for the 'findOneAndDelete' event. in this middleware function, we will find the customer by id and then delete all the orders that are associated with that customer. this way, when we delete a customer, all the orders that are associated with that customer will also be deleted from the database.

//function chain - findbyidanddelte --> findoneanddelte ---> moongose middleware(that we will define) --> delete orders
const express = require('express');
const app = express();
const ExpressError = require('./expressError'); //importing custom error class

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
app.get('/', (req, res) => { //work only for / route
    res.send('Hello, World!');
});
//structure of middleware
app.use((req, res, next) => { //if path not specified, it will run for all routes
    console.log('Middleware 1: Request received');
    next(); //if middleware works is not properly defined then you wont be able  to get response from server, because next() is not called and request will be stuck in middleware(loading on website)
});


//creating a utility middleware
//logger = prints useful info on console about incoming request (its like log data, everything is stored here that we do)

app.use((req, res, next)=>{
    //do console.log(req); to know more about loggers
    req.time = new Date().toLocaleTimeString(); //we are adding a new property to req object, so that we can use it in our routes
    console.log(req.method, req.hostname, req.path, req.time);

});

//to render page not found when , user try to access anonymous route that doesnt exiist
app.use((req, res)=>{
    //res.status(404).send('Page Not Found');\
    //throw error from error class
    throw new ExpressError('Page Not Found', 404); //parameteres already defined in error file
});
//find difference between above code and below code
app.use((err, req, res, next)=>{
    const {statusCode = 500, message = 'Something went wrong'} = err; //if status code is not defined in error file then it will be 500 and if message is not defined then it will be 'Something went wrong'
    //setting default status code value is important because if we dont set it then it will be undefined and we wont be able to send response to client
    res.status(statusCode).send(message);
});

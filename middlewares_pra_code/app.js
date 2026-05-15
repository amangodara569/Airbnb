const express = require('express');
const app = express();

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


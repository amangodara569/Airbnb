//with express.router we will resturcture the code , less bloated
const express = require('express');
const app = express();
const port = 3000;

//requireing file
const uesrRoutes = require('./uesr');  //importing user routes
const postRoutes = require('./post');  //importing post routes

//now we need to use them 
app.use('/users', uesrRoutes);  //all user related routes will be prefixed with /users
app.use('/posts', postRoutes);  //all post related routes will be prefixed with /posts

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//current 
    //app.js = users route + posts route 
//after restructuring
    //write both routes in separate files and import them here in main app.js
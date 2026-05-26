//do just same like users.js but for posts
const express = require('express');

const router = express.Router();  //router instance to define post related routes
//we have to remove the common part like /posts from all routes
//get all posts
router.get('/', (req, res) => {
    res.send('Get all posts');
});

//get a post by id
router.get('/:id', (req, res) => {
    const postId = req.params.id;
    res.send(`Get post with id ${postId}`);
});
 //create a new post
router.post('/', (req, res) => {
    res.send('Create a new post');
});

//update a post by id
router.put('/:id', (req, res) => {
    const postId = req.params.id;
    res.send(`Update post with id ${postId}`);
});
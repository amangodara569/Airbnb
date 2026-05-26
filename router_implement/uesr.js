//all the user related api
const expres = require('express');

const router = express.Router();  //router instance to define user related routes
//we have to remove the common part like /uesrs from all routes
//get all users
router.get('/', (req, res) => {
    res.send('Get all users');
});

//get a user by id
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`Get user with id ${userId}`);
});
 //create a new user
router.post('/', (req, res) => {
    res.send('Create a new user');
});

//update a user by id
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`Update user with id ${userId}`);
});

//delete a user by id
router.delete('/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`Delete user with id ${userId}`);
});

module.exports = router;

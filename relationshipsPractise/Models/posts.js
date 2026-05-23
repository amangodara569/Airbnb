//approach 3 one to squillion relationship
//har child ke andar parent ka reference hoga
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const userSchema = new Schema({
    name: String,
    email: String
});
const postSchema = new Schema({
    title: String,
    content: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
    //what is type:Schema.Types.ObjectId? it is a special type in mongoose that is used to store the reference of another document. 
    // it is used to create a relationship between two documents. 
    // in this case, we are storing the reference of the user document in the post document.
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

module.exports = { User, Post };

const addData = async () => {
    const user = new User({
        name: 'John Doe',
        email: 'john@example.com'
    });
    await user.save();

    const post = new Post({
        title: 'My First Post',
        content: 'This is the content of my first post.',
        author: user._id
    });
    await post.save();
};
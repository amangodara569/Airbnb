const app = express();
const cookieParser = require('cookie-parser');
const port = 3000;

// Use cookie parser middleware
app.use(cookieParser("this_is_a_secret_key")); //define a secret key for signed cookies, you can replace 'your_secret_key' with any string you like

// Route to set a cookie
app.get('/setcookie', (req, res) => {
    res.cookie('username', 'JohnDoe', { maxAge: 900000, httpOnly: true });
    res.send('Cookie has been set');
});

// Route to get the cookie
app.get('/getcookie', (req, res) => {
    const username = req.cookies.username;  //accessing the cookie named 'username'
    if (username) {
        res.send(`Username from cookie: ${username}`);
    } else {
        res.send('No username cookie found');
    }
});

// Route to clear the cookie
app.get('/clearcookie', (req, res) => {
    res.clearCookie('username');
    res.send('Cookie has been cleared');
});



//signed cookkie example
app.get('/setsignedcookie', (req, res) => {
    res.cookie('signedUsername', 'JohnDoe', { maxAge: 900000, httpOnly: true, signed: true });
    res.send('Signed cookie has been set');
});

app.get('/getsignedcookie', (req, res) => {
    const signedUsername = req.signedCookies.signedUsername;  //accessing the signed cookie
    if (signedUsername) {
        res.send(`Signed Username from cookie: ${signedUsername}`);
    } else {
        res.send('No signed username cookie found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
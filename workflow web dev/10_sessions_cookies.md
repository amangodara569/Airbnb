# 🍪 COOKIES & SESSIONS - Complete Guide
> How the web remembers who you are across requests
> Theory + working code with express-session and cookie-parser
> Based on your practice in `learnCOOKIE.js` and `express sessions/server.js`

---

## 📋 TABLE OF CONTENTS
1. [The Stateless Problem](#the-stateless-problem)
2. [What are Cookies?](#what-are-cookies)
3. [Cookie Options Explained](#cookie-options-explained)
4. [Signed Cookies](#signed-cookies)
5. [What are Sessions?](#what-are-sessions)
6. [Cookies vs Sessions — When to Use Which?](#cookies-vs-sessions--when-to-use-which)
7. [express-session Setup & Usage](#express-session-setup--usage)
8. [connect-mongo — Store Sessions in MongoDB](#connect-mongo--store-sessions-in-mongodb)
9. [connect-flash — Flash Messages](#connect-flash--flash-messages)
10. [Sessions in Your Wanderlust Project (Future)](#sessions-in-your-wanderlust-project-future)
11. [Security Best Practices](#security-best-practices)
12. [References & Further Reading](#references--further-reading)

---

## THE STATELESS PROBLEM

### HTTP is stateless — it has zero memory

Every HTTP request is **completely independent**. The server forgets you the moment it sends a response.

```
Request 1: "Hi, I'm Aman, please log me in"
  → Server: "OK, logged in" ← forgets everything

Request 2: "Hi, show me my profile"
  → Server: "Who are you?? I don't know you"
```

This is a problem because:
- You'd have to log in on every single page
- Shopping carts would reset on every click
- "Remember me" would be impossible

### The solution: Cookies + Sessions

```
Browser                              Server
  │                                    │
  │  POST /login (username, password)  │
  │ ──────────────────────────────────>│
  │                                    │  Verify credentials ✅
  │  Set-Cookie: session=abc123        │
  │ <──────────────────────────────────│
  │                                    │
  │  GET /profile (Cookie: session=abc123) │
  │ ──────────────────────────────────>│
  │                                    │  "session abc123 = Aman" ✅
  │  Here's Aman's profile             │
  │ <──────────────────────────────────│
```

The cookie is stored **in the browser** and sent **automatically** with every request.

---

## WHAT ARE COOKIES?

A cookie is a **small piece of data** stored in the browser that gets sent back to the server with every request to that domain.

### Setting a cookie (server → browser):
```js
// Install: npm install cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Set a cookie
app.get('/setcookie', (req, res) => {
    res.cookie('username', 'Aman', {
        maxAge: 24 * 60 * 60 * 1000,  // 1 day in milliseconds
        httpOnly: true                  // Can't be read by browser JS (security!)
    });
    res.send('Cookie set!');
});
```

### Reading a cookie (from browser → server):
```js
app.get('/getcookie', (req, res) => {
    // req.cookies is populated by cookie-parser middleware
    const username = req.cookies.username;
    res.send(`Hello, ${username}!`);
});
```

### Clearing a cookie:
```js
app.get('/logout', (req, res) => {
    res.clearCookie('username');
    res.send('Logged out!');
});
```

### How it looks in the browser:
```
Chrome DevTools → Application → Cookies → localhost

Name        Value    Domain     Path  Expires            HttpOnly
username    Aman     localhost  /     2025-01-15 10:30   ✓
```

---

## COOKIE OPTIONS EXPLAINED

```js
res.cookie('name', 'value', {
    maxAge:   24 * 60 * 60 * 1000,  // How long the cookie lives (in ms)
                                      // Without maxAge: deleted when browser closes (session cookie)

    expires:  new Date('2025-12-31'),// Alternative to maxAge — set exact expiry date
                                      // Use maxAge instead (simpler)

    httpOnly: true,                  // ⭐ IMPORTANT SECURITY OPTION
                                      // true  = cookie can ONLY be sent via HTTP (not readable by JS)
                                      // false = browser JS can access it with document.cookie
                                      // Always set this true to prevent XSS attacks!

    secure:   true,                  // Cookie only sent over HTTPS (not plain HTTP)
                                      // Always set this true in production!
                                      // In development (localhost): set to false

    sameSite: 'strict',              // Protection against CSRF attacks
                                      // 'strict' = cookie only sent for same-site requests
                                      // 'lax'    = sent for same-site + top-level navigations
                                      // 'none'   = sent for all (requires secure: true)

    signed:   true,                  // Use HMAC signature to detect tampering
                                      // Requires secret key passed to cookieParser()
                                      // See "Signed Cookies" section below

    path:     '/',                   // Which URL paths can access the cookie
                                      // '/' = accessible from all paths (default)
                                      // '/admin' = only accessible from /admin routes

    domain:   'example.com'          // Which domain can access the cookie
                                      // Default: the domain that set it
});
```

### Example: Secure cookie for production login:
```js
res.cookie('sessionId', 'abc123', {
    httpOnly: true,    // JS can't steal it
    secure: true,      // Only over HTTPS
    sameSite: 'strict', // No CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

---

## SIGNED COOKIES

### The Problem with Regular Cookies:
```
Server sends: username=Aman
User edits it in browser DevTools to: username=Admin
Server reads: username=Admin → 😱 they faked it!
```

### Signed Cookies — The Solution:
Signed cookies include a **cryptographic signature** (HMAC). If the value is changed, the signature won't match and the cookie is rejected.

```js
// Pass a secret key to cookie-parser
app.use(cookieParser("my_super_secret_key_change_this"));
//                    ↑ This key is used to sign the cookie value

// Set a signed cookie
app.get('/setsigned', (req, res) => {
    res.cookie('username', 'Aman', {
        signed: true,        // ← This is the key option
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    });
    res.send('Signed cookie set!');
});

// Read a signed cookie (use req.signedCookies, NOT req.cookies!)
app.get('/getsigned', (req, res) => {
    const username = req.signedCookies.username;
    //                   ↑ signed cookies are here (not req.cookies)
    if (username) {
        res.send(`Hello ${username} (verified!)`);
    } else {
        res.send('Invalid or missing cookie');
    }
});
```

### What happens behind the scenes:
```
Cookie stored in browser:
  username = s%3AAman.HMAC_SIGNATURE_HERE
  
When read back:
  cookie-parser verifies: does HMAC match?
    ✅ Yes → returns 'Aman'
    ❌ No  → returns false (cookie was tampered with!)
```

---

## WHAT ARE SESSIONS?

A session is a **server-side storage** mechanism where user data is stored on the server, and only a **session ID** is stored in a cookie.

### Cookie approach (data in cookie):
```
Cookie stored in browser: { username: "Aman", role: "admin", cart: [...100 items...] }
Problems:
  - Cookie size limit is 4KB
  - Anyone can read the cookie (even if signed, they can see it)
  - Sensitive data (like user role) exposed in browser
```

### Session approach (data on server):
```
Cookie stored in browser: { sessionId: "abc123def456" }  ← Just a random ID!
Server-side storage:
  sessions["abc123def456"] = {
    username: "Aman",
    role: "admin",
    cart: [...100 items...],
    loginTime: "2025-01-15"
  }

Benefits:
  - Cookie is tiny (just an ID)
  - Sensitive data stays on server
  - Data can be any size
  - Easy to invalidate (just delete the session on logout)
```

### The session flow:
```
1. User logs in
2. Server creates a session: sessions["xyzabc"] = { userId: 123 }
3. Server sends cookie: Set-Cookie: sessionId=xyzabc
4. Browser stores the cookie

Next request:
5. Browser sends: Cookie: sessionId=xyzabc
6. Server looks up: sessions["xyzabc"] → { userId: 123 }
7. Server knows who the user is!
```

---

## COOKIES VS SESSIONS — WHEN TO USE WHICH?

| Feature | Cookies | Sessions |
|---------|---------|---------|
| **Where data lives** | Browser (client) | Server (or database) |
| **Data size limit** | 4KB max | Unlimited |
| **Data visible to user** | Yes (can see in DevTools) | No (only session ID visible) |
| **Sensitive data** | ❌ Avoid (exposed) | ✅ Safe (on server) |
| **Speed** | ✅ Fast (no server lookup) | Slightly slower (lookup needed) |
| **Good for** | Preferences (theme, language) | Login state, shopping cart |
| **Scales across servers** | ✅ (cookie travels with user) | ❌ Needs shared storage (MongoDB) |

### Use cookies directly when:
- Storing non-sensitive preferences (dark/light mode, language)
- Simple "remember me" with JWT tokens
- Data that must survive across different servers

### Use sessions when:
- Storing login state
- Shopping cart data
- Any sensitive information
- Flash messages (success/error after redirect)

---

## EXPRESS-SESSION SETUP & USAGE

### Install:
```bash
npm install express-session
```

### Basic setup (from your practice file):
```js
const express = require('express');
const session = require('express-session');
const app = express();

app.use(session({
    secret: 'keyboard cat',     // Secret key used to sign the session ID cookie
                                 // Use a long random string in production!
                                 // NEVER hardcode in code — use .env file

    resave: false,               // Don't save session if nothing changed
                                 // false = better performance (recommended)

    saveUninitialized: false,    // Don't create empty sessions for unauthenticated users
                                 // false = GDPR compliant (recommended)
                                 // Your practice used true — both work for learning

    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 1 week
        httpOnly: true,          // Can't be stolen by JS
        secure: false,           // false for development (no HTTPS)
                                 // true for production!
    }
}));
```

### Using the session to store data:
```js
// Store data in session
app.get('/login', (req, res) => {
    // After verifying user credentials:
    req.session.userId = 'abc123';       // Store user ID
    req.session.username = 'Aman';       // Store username
    req.session.isLoggedIn = true;       // Store login state
    res.redirect('/dashboard');
});

// Read data from session
app.get('/dashboard', (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.send(`Welcome ${req.session.username}!`);
});

// Count page visits (from your practice):
app.get('/', (req, res) => {
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send(`You have visited this page ${req.session.count} times`);
});

// Destroy session (logout)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.send('Error logging out');
        res.clearCookie('connect.sid');  // 'connect.sid' = default session cookie name
        res.redirect('/login');
    });
});
```

### The complete working session example:
```js
const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'use_env_variable_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000, httpOnly: true } // 1 hour
}));

// Fake user for demo
const fakeUser = { username: 'aman', password: '1234' };

// Login page
app.get('/login', (req, res) => {
    res.send(`
        <form method="POST" action="/login">
            <input name="username" placeholder="Username">
            <input name="password" type="password" placeholder="Password">
            <button>Login</button>
        </form>
    `);
});

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === fakeUser.username && password === fakeUser.password) {
        req.session.username = username;     // Store in session
        req.session.isLoggedIn = true;
        res.redirect('/dashboard');
    } else {
        res.send('Invalid credentials! <a href="/login">Try again</a>');
    }
});

// Protected route
app.get('/dashboard', (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');  // Not logged in? Go to login
    }
    res.send(`
        <h1>Welcome, ${req.session.username}!</h1>
        <a href="/logout">Logout</a>
    `);
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## CONNECT-MONGO — STORE SESSIONS IN MONGODB

### Why you need this:
By default, `express-session` stores sessions **in memory** (RAM):
```
Problem 1: Server restart → ALL sessions lost → everyone logged out!
Problem 2: If you have multiple servers, sessions don't share
Problem 3: RAM fills up with sessions over time
```

### Solution: Store sessions in MongoDB:
```bash
npm install connect-mongo
```

```js
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/wanderlust',
        //         ↑ Same database your app uses
        collectionName: 'sessions',  // Sessions stored here in MongoDB
        ttl: 7 * 24 * 60 * 60,       // Session expires after 7 days (in seconds)
    }),
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days (in ms) — match ttl
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // true in production
    }
}));
```

### Now sessions are saved in MongoDB:
```
mongosh
use wanderlust
db.sessions.find()
// Shows: { _id: 'abc123', session: '{"userId":"..."}', expires: Date }
```

---

 ## CONNECT-FLASH — FLASH MESSAGES

### What are flash messages?
A flash message is a **one-time message** shown after a redirect.

```
User creates a listing
    ↓
POST /listings → creates listing → redirect to /listings
    ↓
User sees: "✅ Listing created successfully!"
    ↓
User refreshes page → message is GONE (shown only once)
```

### Why sessions are needed for flash:
Flash messages are stored in the **session** between the redirect and the next request. That's why you need sessions set up BEFORE flash.

### Install:
```bash
npm install connect-flash
```

### Setup (must be AFTER session setup):
```js
const flash = require('connect-flash');

// Session MUST come before flash!
app.use(session({ secret: '...', resave: false, saveUninitialized: false }));
app.use(flash());
// Flash is now available as req.flash() in all routes
```

### Using flash in routes:
```js
// Set a flash message
app.post('/listings', async (req, res) => {
    // ... create listing ...
    req.flash('success', 'Listing created successfully!');
    //         ↑ type       ↑ message
    res.redirect('/listings');
});

// Show the flash message
app.get('/listings', async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', {
        listings: allListings,
        messages: req.flash()
        // req.flash() returns: { success: ['Listing created!'], error: [] }
        // After this call, messages are DELETED from session (shown only once!)
    });
});
```

### In EJS template:
```html
<!-- In your boilerplate.ejs, add this: -->
<% if (messages.success && messages.success.length > 0) { %>
    <div class="alert alert-success">
        <%= messages.success[0] %>
    </div>
<% } %>

<% if (messages.error && messages.error.length > 0) { %>
    <div class="alert alert-danger">
        <%= messages.error[0] %>
    </div>
<% } %>
```

### Better approach — use res.locals to make messages available everywhere:
```js
// Add this middleware AFTER flash setup
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    // res.locals = variables automatically available in ALL EJS templates
    // No need to pass them manually in every res.render()!
    next();
});
```

```html
<!-- In boilerplate.ejs — messages are available everywhere now! -->
<% if (success && success.length > 0) { %>
    <div class="alert alert-success alert-dismissible fade show">
        <%= success[0] %>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
<% } %>
```

### Flash message types:
```js
req.flash('success', 'Listing created!');      // Green ✅
req.flash('error', 'Something went wrong!');   // Red ❌
req.flash('warning', 'Please complete form');  // Yellow ⚠️
req.flash('info', 'Note: Prices may vary');    // Blue ℹ️
```

---

## SESSIONS IN YOUR WANDERLUST PROJECT (FUTURE)

> 📝 Sessions are not yet implemented in your main project. This is what the setup will look like when you add authentication!

### Full app.js setup with sessions + flash:
```js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressError = require('./utils/expressError');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// Routers
const listings = require('./route/listing.js');
const reviews = require('./route/review.js');

// Middleware
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));

// ============================================================
//                  SESSION CONFIGURATION
// ============================================================
const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/wanderlust',
        touchAfter: 24 * 3600,  // Only update session once per 24 hours (performance)
    }),
    secret: process.env.SECRET || 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        name: 'wanderlust.session',     // Custom cookie name
        httpOnly: true,
        // secure: true,                // Uncomment in production (HTTPS)
        maxAge: 7 * 24 * 60 * 60 * 1000  // 1 week
    }
};

app.use(session(sessionConfig));
app.use(flash());

// ============================================================
//              MAKE FLASH AVAILABLE IN ALL TEMPLATES
// ============================================================
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;  // Set by passport (future)
    next();
});

// Routes
app.use('/listings', listings);
app.use('/listings/:id/reviews', reviews);

// ... DB connection, app.listen, 404, error handler ...
```

### How flash messages will work in listing routes:
```js
// In route/listing.js — after session + flash is set up:

// CREATE — show success message
router.post('/', validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing({ ...req.body });
    await newListing.save();
    req.flash('success', '✅ New listing created!');  // ← Add this
    res.redirect('/listings');
}));

// DELETE — show success message
router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', '🗑️ Listing deleted!');  // ← Add this
    res.redirect('/listings');
}));

// UPDATE — show success message
router.put('/:id', validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body);
    req.flash('success', '✏️ Listing updated!');  // ← Add this
    res.redirect(`/listings/${id}`);
}));
```

---

## SECURITY BEST PRACTICES

### 1. Never hardcode secrets — use .env:
```bash
# .env file (add to .gitignore!)
SESSION_SECRET=use_a_long_random_string_like_this_one_abc123xyz789
```

```js
require('dotenv').config();
app.use(session({
    secret: process.env.SESSION_SECRET,
    // ...
}));
```

### 2. Always use httpOnly: true
```js
// Prevents JavaScript from reading the session cookie
// Protects against XSS (Cross-Site Scripting) attacks
cookie: { httpOnly: true }
```

### 3. Use secure: true in production
```js
cookie: {
    secure: process.env.NODE_ENV === 'production'
    // HTTPS only in production, HTTP allowed in development
}
```

### 4. Regenerate session after login (prevents session fixation):
```js
app.post('/login', (req, res) => {
    // After verifying credentials:
    req.session.regenerate((err) => {
        // New session ID generated — old one is gone
        req.session.userId = user._id;
        res.redirect('/dashboard');
    });
});
```

### 5. Use strong, random secrets:
```bash
# Generate a random secret in Node.js:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## REFERENCES & FURTHER READING

### Official Docs:
- 📖 [express-session (npm)](https://www.npmjs.com/package/express-session) — Full options reference
- 📖 [cookie-parser (npm)](https://www.npmjs.com/package/cookie-parser) — Signed cookies, options
- 📖 [connect-mongo (npm)](https://www.npmjs.com/package/connect-mongo) — Store sessions in MongoDB
- 📖 [connect-flash (npm)](https://www.npmjs.com/package/connect-flash) — Flash messages
- 📖 [MDN — HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) — Deep dive into cookies from browser perspective

### Great Tutorials:
- 🎥 [The Odin Project — Sessions & Cookies](https://www.theodinproject.com/lessons/nodejs-sessions-and-cookies) — Beginner-friendly explanation
- 📚 [Express.js Guide — session middleware](https://expressjs.com/en/resources/middleware/session.html) — Official Express docs
- 🎥 [Colt Steele — Web Dev Bootcamp (Sessions section)](https://www.udemy.com/course/the-web-developer-bootcamp/) — Video walkthrough
- 📚 [PortSwigger — Web Security (Cookies)](https://portswigger.net/web-security/csrf) — Security focused (CSRF, XSS)

### Key npm packages with links:
```
npm install express-session     → https://npmjs.com/package/express-session
npm install cookie-parser       → https://npmjs.com/package/cookie-parser
npm install connect-mongo       → https://npmjs.com/package/connect-mongo
npm install connect-flash       → https://npmjs.com/package/connect-flash
npm install dotenv              → https://npmjs.com/package/dotenv
```

---

> 📝 **Next step:** Once you add Passport.js for authentication, come back here and update this file with auth-specific session patterns (req.user, passport.serializeUser, etc.)

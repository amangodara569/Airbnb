# 📦 REQ OBJECT & MERN PACKAGES — Reference Guide
> All properties, data types, and most-used MERN packages explained
> Based on YOUR Wanderlust (Airbnb Clone) project

---

## 📋 TABLE OF CONTENTS
1. [The req Object — What Is It?](#the-req-object)
2. [req Properties — Complete List](#req-properties)
3. [req.body — Form & JSON Data](#reqbody)
4. [req.params — URL Parameters](#reqparams)
5. [req.query — Query Strings](#reqquery)
6. [req.session — Session Data](#reqsession)
7. [req.user — Passport User](#requser)
8. [req.flash — Flash Messages](#reqflash)
9. [req.cookies — Cookie Data](#reqcookies)
10. [req.headers — Request Headers](#reqheaders)
11. [req Methods (isAuthenticated, logout)](#req-methods)
12. [MERN Packages — Core](#mern-packages-core)
13. [MERN Packages — Auth](#mern-packages-auth)
14. [MERN Packages — Files & Images](#mern-packages-files)
15. [MERN Packages — Security](#mern-packages-security)
16. [MERN Packages — Maps & Email](#mern-packages-maps-email)
17. [Quick Install Commands](#quick-install-commands)

---

## THE REQ OBJECT — WHAT IS IT?

`req` = **Request Object**

Every time someone visits a URL or submits a form, Express creates a `req` object.
It holds ALL information about that incoming request — who sent it, what they sent, where they came from.

```
Browser sends: GET /listings?sort=price
                  ↓
Express creates: req object
  req.method  = "GET"
  req.path    = "/listings"
  req.query   = { sort: "price" }
  req.headers = { ... browser info ... }
```

Think of `req` as a **package delivered to your door** — it contains everything the client sent.

---

## REQ PROPERTIES — COMPLETE LIST

| Property | Type | What it holds | Requires middleware? |
|----------|------|---------------|---------------------|
| `req.body` | Object | Form/JSON data from POST/PUT | ✅ `express.urlencoded()` |
| `req.params` | Object | URL route parameters (`:id`) | ❌ Built-in |
| `req.query` | Object | URL query string (`?key=val`) | ❌ Built-in |
| `req.session` | Object | Session data (login state, flash) | ✅ `express-session` |
| `req.user` | Object | Logged-in user from Passport | ✅ `passport.session()` |
| `req.flash` | Function | Read flash messages | ✅ `connect-flash` |
| `req.cookies` | Object | Cookie values from browser | ✅ `cookie-parser` |
| `req.headers` | Object | HTTP headers from browser | ❌ Built-in |
| `req.method` | String | HTTP method (GET, POST, etc.) | ❌ Built-in |
| `req.path` | String | URL path only (`/listings/new`) | ❌ Built-in |
| `req.originalUrl` | String | Full URL with query string | ❌ Built-in |
| `req.hostname` | String | Domain name (`localhost`) | ❌ Built-in |
| `req.ip` | String | Client IP address | ❌ Built-in |
| `req.protocol` | String | `http` or `https` | ❌ Built-in |
| `req.secure` | Boolean | `true` if https | ❌ Built-in |
| `req.xhr` | Boolean | `true` if AJAX request | ❌ Built-in |
| `req.files` | Object | Uploaded files | ✅ `multer` |

---

## REQ.BODY — FORM & JSON DATA

**What it holds:** Data sent by the user — from HTML forms or JSON APIs.

```js
// ===== SETUP (required in app.js) =====
// Without this line, req.body is UNDEFINED!
app.use(express.urlencoded({ extended: true }));
// extended: true = allows nested objects like { listing: { title: "...", price: 100 } }
// extended: false = only flat objects like { title: "...", price: "100" }

// Also add this for JSON APIs (React frontend, Postman, etc.)
app.use(express.json());

// ===== HOW IT WORKS =====
// HTML form field:  <input name="title" value="Beach House">
// req.body becomes: { title: "Beach House" }

// HTML form with namespace: <input name="listing[title]" value="Beach House">
// req.body becomes: { listing: { title: "Beach House" } }

// ===== YOUR USAGE IN ROUTES =====
router.post('/listings', (req, res) => {
    console.log(req.body);
    // { title: "Beach House", price: "2000", city: "Bali", country: "Indonesia" }
    // NOTE: price is a STRING even if type="number" in HTML — forms always send strings!

    // Destructure what you need:
    let { title, description, price, city, country } = req.body;

    // Or access directly:
    const title = req.body.title;
    const price = req.body.price;   // "2000" — string, not number!
});

// ===== NESTED DATA (review form) =====
// <input name="review[rating]" value="4">
// <textarea name="review[comment]">Great place!</textarea>
// req.body = { review: { rating: "4", comment: "Great place!" } }

const { rating, comment } = req.body.review;
// rating = "4" (string), comment = "Great place!"
```

**Common mistakes:**
```js
// ❌ Missing middleware — req.body is undefined
const title = req.body.title;  // TypeError: Cannot read properties of undefined

// ✅ Fix: Make sure app.js has BOTH lines:
app.use(express.urlencoded({ extended: true }));  // for HTML forms
app.use(express.json());                           // for JSON/API calls

// ❌ Wrong: expecting number from form
if (req.body.price > 0) { ... }   // "2000" > 0 = might work (JS coercion) but unsafe

// ✅ Safe: convert to number first
const price = Number(req.body.price);  // or parseInt(), parseFloat()
```

---

## REQ.PARAMS — URL PARAMETERS

**What it holds:** Dynamic segments of the URL path (defined with `:` in routes).

```js
// Route definition uses :  to mark dynamic parts
router.get('/listings/:id', (req, res) => {
    console.log(req.params);
    // URL: /listings/64a7b8c9d0e1f2a3b4c5d6e7
    // req.params = { id: '64a7b8c9d0e1f2a3b4c5d6e7' }
});

// Multiple params:
router.get('/listings/:listingId/reviews/:reviewId', (req, res) => {
    console.log(req.params);
    // URL: /listings/abc123/reviews/xyz789
    // req.params = { listingId: 'abc123', reviewId: 'xyz789' }

    const { listingId, reviewId } = req.params;  // destructure
});

// YOUR USAGE in project:
router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;       // Get the listing ID
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));
```

**Important:** `req.params` values are always **strings**, not numbers!

---

## REQ.QUERY — QUERY STRINGS

**What it holds:** Data from the URL after the `?` symbol.

```js
// URL: /listings?sort=price&category=beach&page=2
router.get('/listings', (req, res) => {
    console.log(req.query);
    // { sort: 'price', category: 'beach', page: '2' }

    const sort    = req.query.sort;      // 'price'
    const page    = req.query.page;      // '2' (string!)
    const pageNum = Number(req.query.page); // 2 (number)
});

// URL with no query: /listings
// req.query = {}  (empty object, never undefined)

// YOUR USAGE (method-override uses query params):
// <form action="/listings/abc?_method=DELETE" method="POST">
// req.query = { _method: 'DELETE' }
// method-override middleware reads this and changes req.method to 'DELETE'
```

---

## REQ.SESSION — SESSION DATA

**What it holds:** Server-side data stored per user across requests (login state, redirects, etc.).

```js
// ===== SETUP =====
const session = require('express-session');
app.use(session({
    secret: 'yourSecret',
    resave: false,
    saveUninitialized: false,
}));

// ===== READING SESSION DATA =====
router.get('/dashboard', (req, res) => {
    console.log(req.session);
    // {
    //   cookie: { originalMaxAge: 86400000, ... },
    //   passport: { user: '64a7b8c9...' },  ← set by Passport
    //   redirectUrl: '/listings/new',         ← set by your isLoggedIn middleware
    //   flash: { success: ['Listing created!'] }  ← set by connect-flash
    // }
});

// ===== WRITING TO SESSION =====
req.session.redirectUrl = req.originalUrl;
// You do this in isLoggedIn middleware to save where user was trying to go

// ===== READING FROM SESSION =====
const savedUrl = req.session.redirectUrl;

// ===== DESTROYING SESSION (logout) =====
req.session.destroy();  // Clears all session data

// ===== YOUR USAGE =====
// isLoggedIn middleware:
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;  // ← Save intended URL
        return res.redirect('/login');
    }
    next();
};
```

---

## REQ.USER — PASSPORT USER

**What it holds:** The full user object of the currently logged-in user (set by Passport via `deserializeUser`).

```js
// req.user is set AUTOMATICALLY by Passport on every request
// It's the result of: User.findById(sessionUserId)  ← runs on every request!

// ===== WHEN LOGGED IN =====
console.log(req.user);
// {
//   _id: ObjectId('64a7b8c9d0e1f2a3b4c5d6e7'),
//   username: 'aman',
//   email: 'aman@example.com',
//   hash: '...hashed password...',  ← stored by passport-local-mongoose
//   salt: '...salt...',
//   __v: 0
// }

// ===== WHEN NOT LOGGED IN =====
console.log(req.user);
// undefined

// ===== YOUR USAGE =====
// 1. Save listing owner:
newListing.owner = req.user._id;

// 2. Show logged-in user in templates (via res.locals):
app.use((req, res, next) => {
    res.locals.currentUser = req.user;  // undefined if not logged in
    next();
});

// 3. After login, welcome message:
req.flash('success', `Welcome back, ${req.user.username}!`);

// 4. Check ownership:
if (!listing.owner.equals(req.user._id)) {
    // not the owner!
}
```

---

## REQ.FLASH — FLASH MESSAGES

**What it holds:** Temporary one-time messages (success/error) stored in session.

```js
// ===== SETUP =====
const flash = require('connect-flash');
app.use(flash());  // Must come AFTER session middleware

// ===== SETTING A FLASH MESSAGE =====
req.flash('success', 'Listing created successfully!');
req.flash('error', 'You must be logged in!');
// First arg = type (can be any string: 'success', 'error', 'info', 'warning')
// Second arg = the message text

// ===== READING FLASH MESSAGES =====
const messages = req.flash('success');
// Returns an ARRAY: ['Listing created successfully!']
// After reading, the message is DELETED (one-time use!)
// If no messages: returns []

// ===== YOUR USAGE in app.js =====
app.use((req, res, next) => {
    res.locals.success = req.flash('success');  // Read and pass to all templates
    res.locals.error   = req.flash('error');
    next();
});

// ===== IN EJS TEMPLATES =====
// <% if (success.length > 0) { %>
//   <div class="alert alert-success"><%= success %></div>
// <% } %>
```

---

## REQ.COOKIES — COOKIE DATA

**What it holds:** All cookies sent by the browser.

```js
// ===== SETUP (optional — express-session auto-handles session cookies) =====
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// OR for signed cookies:
app.use(cookieParser('yourSecretKey'));

// ===== READING COOKIES =====
router.get('/', (req, res) => {
    console.log(req.cookies);
    // { 'connect.sid': 's%3AaBcD...' }  ← session cookie set by express-session

    const sessionCookie = req.cookies['connect.sid'];
});

// Reading SIGNED cookies (tamper-proof):
const value = req.signedCookies['myCookie'];

// ===== SETTING COOKIES IN RESPONSE =====
res.cookie('name', 'value', {
    maxAge: 1000 * 60 * 60,  // 1 hour
    httpOnly: true,           // Not accessible via JavaScript
    secure: true,             // HTTPS only
});

// ===== YOUR USAGE =====
// You mostly don't use req.cookies directly —
// express-session handles session cookies automatically.
// The session cookie ('connect.sid') is set/read automatically.
```

---

## REQ.HEADERS — REQUEST HEADERS

**What it holds:** HTTP headers sent by the browser (user agent, content type, authorization, etc.).

```js
router.get('/', (req, res) => {
    console.log(req.headers);
    // {
    //   host: 'localhost:3000',
    //   'user-agent': 'Mozilla/5.0 ...',
    //   accept: 'text/html,application/xhtml+xml...',
    //   'accept-language': 'en-US,en;q=0.9',
    //   cookie: 'connect.sid=s%3AaBcD...',
    //   connection: 'keep-alive'
    // }

    // Access specific header:
    const userAgent = req.headers['user-agent'];
    const contentType = req.headers['content-type'];

    // Shortcut method:
    const host = req.get('host');           // 'localhost:3000'
    const auth = req.get('Authorization'); // 'Bearer token123' (for APIs)
});
```

---

## REQ METHODS (BUILT-IN FUNCTIONS)

These are **functions** on the req object, not just properties.

```js
// ===== req.isAuthenticated() — FROM PASSPORT =====
// Returns true if user is logged in (Passport sets this)
if (req.isAuthenticated()) {
    // User is logged in
}
// Used in your isLoggedIn middleware:
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect('/login');
    next();
};

// ===== req.logout() — FROM PASSPORT =====
// Clears req.user and destroys session
router.get('/logout', (req, res, next) => {
    req.logout((err) => {           // In newer Passport: requires a callback!
        if (err) return next(err);
        req.flash('success', 'Logged out!');
        res.redirect('/listings');
    });
});

// ===== req.login() — FROM PASSPORT =====
// Manually log in a user (called after signup to auto-login)
req.login(registeredUser, (err) => {
    if (err) return next(err);
    req.flash('success', 'Welcome!');
    res.redirect('/listings');
});

// ===== req.get(headerName) =====
// Shortcut to read a specific request header
const contentType = req.get('Content-Type');
const accept = req.get('Accept');
```

---

## MERN PACKAGES — CORE

These are the **foundation packages** every MERN project needs.

---

### 1. `express` — Web Framework
**Install:** `npm install express`
**Docs:** https://expressjs.com/

```js
const express = require('express');
const app = express();

// What it gives you:
app.get('/path', handler);          // Route handling
app.use(middleware);                // Middleware support
app.listen(3000, callback);         // Start server
app.set('view engine', 'ejs');      // Template engine config

// YOUR USAGE: The entire app.js is built on Express
```

---

### 2. `mongoose` — MongoDB ODM
**Install:** `npm install mongoose`
**Docs:** https://mongoosejs.com/

```js
const mongoose = require('mongoose');

// Connect to database:
await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

// Create a Schema (structure/rules for your data):
const listingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, min: 0 }
});

// Create a Model (class that talks to MongoDB):
const Listing = mongoose.model('Listing', listingSchema);

// CRUD operations your project uses:
Listing.find({})                    // Get ALL listings
Listing.findById(id)                // Get ONE by ID
Listing.findByIdAndUpdate(id, data) // Update one
Listing.findByIdAndDelete(id)       // Delete one
new Listing({ ... }).save()         // Create new
listing.populate('reviews')         // Join related data

// Mongoose also gives you:
// - Schema validation (required, min, max, enum)
// - Middleware (pre/post hooks)
// - Virtual properties
// - ObjectId type for relationships
```

---

### 3. `ejs` — Template Engine
**Install:** `npm install ejs`
**Docs:** https://ejs.co/

```js
// Setup in app.js:
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In routes:
res.render('listings/index.ejs', { listings: allListings });

// In .ejs files:
// <%= variable %>       Output escaped HTML
// <%- rawHTML %>        Output unescaped HTML (for layout includes)
// <% code %>            Run JS without output
// <% if (x) { %>        Conditionals
// <% for (let x of arr) { %>  Loops
```

---

### 4. `ejs-mate` — Layout Support for EJS
**Install:** `npm install ejs-mate`
**Docs:** https://github.com/JacksonTian/ejs-mate

```js
// Setup in app.js:
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);   // Override default EJS with ejs-mate

// In your views — use layout:
<%- layout('layouts/boilerplate') %>
// This wraps your page content inside the boilerplate layout

// In boilerplate.ejs:
<%- body %>  // ← Your page content goes here
```

---

### 5. `method-override` — PUT/DELETE from HTML Forms
**Install:** `npm install method-override`
**Docs:** https://github.com/expressjs/method-override

```js
// Setup in app.js:
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
// Reads ?_method=PUT or ?_method=DELETE from URL

// In forms:
// <form action="/listings/123?_method=PUT" method="POST">
// <form action="/listings/123?_method=DELETE" method="POST">

// Why needed?
// HTML only supports GET and POST in forms
// methodOverride tricks Express into treating it as PUT/DELETE
```

---

### 6. `dotenv` — Environment Variables
**Install:** `npm install dotenv`
**Docs:** https://github.com/motdotla/dotenv

```js
// Setup (FIRST LINE of app.js, before anything else):
require('dotenv').config();

// Create .env file in project root:
// MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/wanderlust
// SECRET=mysupersecretkey123
// CLOUDINARY_CLOUD_NAME=mycloud
// PORT=3000

// Access in code:
const dbUrl = process.env.MONGO_URL;
const secret = process.env.SECRET;
const port = process.env.PORT || 3000;

// IMPORTANT: Always add .env to .gitignore!
// Never push API keys to GitHub!
```

---

### 7. `path` — File Path Utilities (Node.js Built-in)
**No install needed** — comes with Node.js

```js
const path = require('path');

// YOUR USAGE:
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// What path.join does:
path.join(__dirname, 'views')
// __dirname = current file's directory: /home/user/project
// Result:    /home/user/project/views

// Other useful path methods:
path.basename('/foo/bar/file.txt')  // 'file.txt'
path.extname('file.txt')            // '.txt'
path.dirname('/foo/bar/file.txt')   // '/foo/bar'
```

---

## MERN PACKAGES — AUTH

Packages for login, signup, sessions, and flash messages.

---

### 8. `express-session` — Session Management
**Install:** `npm install express-session`
**Docs:** https://github.com/expressjs/session

```js
const session = require('express-session');

app.use(session({
    secret: process.env.SECRET,  // Key to sign the session cookie
    resave: false,               // Don't save session if nothing changed
    saveUninitialized: false,    // Don't create empty sessions
    cookie: {
        httpOnly: true,          // Cookie not accessible via JS (security)
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: false,           // Set true in production (HTTPS only)
    }
}));

// What it does:
// 1. Creates a unique session ID for each visitor
// 2. Stores session data SERVER-SIDE (not in cookie)
// 3. Sends a session cookie to browser (just the ID, not the data)
// 4. On each request: reads cookie → looks up session data on server

// req.session — the session object you can read/write:
req.session.userId = '123';      // Store anything
req.session.cart = ['item1'];
req.session.destroy();           // End session (logout)
```

---

### 9. `connect-mongo` — Store Sessions in MongoDB
**Install:** `npm install connect-mongo`
**Docs:** https://github.com/jdesboeufs/connect-mongo

```js
const MongoStore = require('connect-mongo');

// Use instead of default memory store (required for production):
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        // Sessions are now stored in MongoDB 'sessions' collection
        // Survives server restarts (unlike default memory store)
        touchAfter: 24 * 3600,  // Update session only once per 24 hours
    }),
    cookie: { ... }
}));

// Why needed?
// Default: sessions stored IN MEMORY → lost on server restart!
// connect-mongo: sessions stored in MongoDB → persist forever
```

---

### 10. `connect-flash` — Flash Messages
**Install:** `npm install connect-flash`
**Docs:** https://github.com/jaredhanson/connect-flash

```js
const flash = require('connect-flash');
app.use(flash());  // Must be AFTER session middleware

// Set flash (in routes):
req.flash('success', 'Listing created!');
req.flash('error', 'You must be logged in!');

// Read flash (in middleware, before routes):
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error   = req.flash('error');
    next();
});
// Flash messages auto-delete after being read (one-time use!)

// Display in EJS template:
// <% if (success.length > 0) { %>
//   <div class="alert alert-success"><%= success[0] %></div>
// <% } %>
```

---

### 11. `passport` — Authentication Framework
**Install:** `npm install passport`
**Docs:** https://www.passportjs.org/

```js
const passport = require('passport');

// Must come AFTER session:
app.use(passport.initialize());  // Start passport
app.use(passport.session());     // Connect passport to session

// What passport gives you on req:
req.user            // Logged-in user object (from deserializeUser)
req.isAuthenticated() // Returns true/false
req.login(user, cb) // Manually log in a user
req.logout(cb)      // Log out (clear session)

// Passport is just a framework — you need a STRATEGY too (see below)
```

---

### 12. `passport-local` — Username/Password Strategy
**Install:** `npm install passport-local`
**Docs:** https://github.com/jaredhanson/passport-local

```js
const LocalStrategy = require('passport-local');

// Tell Passport HOW to verify username + password:
passport.use(new LocalStrategy(User.authenticate()));
// User.authenticate() is provided by passport-local-mongoose
// It looks up username in DB, verifies the hashed password

// Use in login route:
router.post('/login',
    passport.authenticate('local', {
        failureFlash: true,          // Auto flash error on fail
        failureRedirect: '/login',   // Go back to login on fail
    }),
    (req, res) => {
        // Only runs if login SUCCEEDED
        res.redirect('/listings');
    }
);
```

---

### 13. `passport-local-mongoose` — Passport + Mongoose Integration
**Install:** `npm install passport-local-mongoose`
**Docs:** https://github.com/saintedlama/passport-local-mongoose

```js
const passportLocalMongoose = require('passport-local-mongoose');

// Add to your User schema (ONE line does everything!):
userSchema.plugin(passportLocalMongoose);

// What this plugin automatically adds:
// ✅ username field (unique, indexed)
// ✅ hash field (hashed password using PBKDF2)
// ✅ salt field (random value for extra security)
// ✅ User.register(user, password) — saves with hashed password
// ✅ User.authenticate() — verifies credentials for passport
// ✅ User.serializeUser() — stores user ID in session
// ✅ User.deserializeUser() — loads user from DB using session ID

// Usage in auth routes:
const newUser = new User({ email, username });
await User.register(newUser, password);  // Handles hashing!

// Serialize/deserialize (in app.js):
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
```

---

### 14. `bcrypt` — Password Hashing (Manual Alternative)
**Install:** `npm install bcrypt`
**Docs:** https://github.com/kelektiv/node.bcrypt.js

```js
// NOTE: If you use passport-local-mongoose, you DON'T need bcrypt directly.
// passport-local-mongoose uses PBKDF2 (more secure than bcrypt).
// Use bcrypt only if you're doing auth MANUALLY without passport.

const bcrypt = require('bcrypt');

// Hash a password:
const saltRounds = 10;  // Higher = more secure but slower (10 is standard)
const hashedPassword = await bcrypt.hash('userPassword', saltRounds);
// Store hashedPassword in DB, never the plain text!

// Verify password at login:
const isMatch = await bcrypt.compare('userPassword', hashedPassword);
// Returns true if match, false if not

// Reference:
// passport-local-mongoose uses PBKDF2 (built into Node.js crypto module)
// bcrypt is also widely used and trusted in the community
```

---

## MERN PACKAGES — FILES & IMAGES

---

### 15. `multer` — File Upload Handling
**Install:** `npm install multer`
**Docs:** https://github.com/expressjs/multer

```js
const multer = require('multer');

// Basic setup — store files in memory (for Cloudinary upload):
const upload = multer({ storage: multer.memoryStorage() });

// OR store locally:
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Use as middleware on routes:
router.post('/listings', upload.single('image'), wrapAsync(async (req, res) => {
    // upload.single('image') = expect ONE file with input name="image"
    // upload.array('images', 5) = expect up to 5 files with name="images"

    console.log(req.file);   // The uploaded file info
    // {
    //   fieldname: 'image',
    //   originalname: 'photo.jpg',
    //   mimetype: 'image/jpeg',
    //   size: 204800,
    //   buffer: <Buffer ...>  // file data (if memoryStorage)
    //   path: './uploads/...' // file path (if diskStorage)
    // }

    console.log(req.files);  // For upload.array() — array of files
}));

// HTML form must have enctype="multipart/form-data":
// <form action="/listings" method="POST" enctype="multipart/form-data">
//   <input type="file" name="image">
// </form>
```

---

### 16. `cloudinary` — Cloud Image Storage
**Install:** `npm install cloudinary`
**Docs:** https://cloudinary.com/documentation/node_integration

```js
const cloudinary = require('cloudinary').v2;

// Configure (use .env for keys!):
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file:
const result = await cloudinary.uploader.upload(filePath, {
    folder: 'wanderlust'  // Organize in folders
});
console.log(result.secure_url);  // https://res.cloudinary.com/...
console.log(result.public_id);   // wanderlust/abc123 (for deletion)

// Delete a file:
await cloudinary.uploader.destroy(publicId);

// .env file:
// CLOUDINARY_CLOUD_NAME=your_cloud_name
// CLOUDINARY_API_KEY=123456789012345
// CLOUDINARY_API_SECRET=abcdefghijklmnop
```

---

### 17. `multer-storage-cloudinary` — Connect Multer to Cloudinary
**Install:** `npm install multer-storage-cloudinary`
**Docs:** https://github.com/affanshahid/multer-storage-cloudinary

```js
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Setup storage (files go directly to Cloudinary, skip local disk):
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderlust',        // Cloudinary folder
        allowedFormats: ['jpg', 'jpeg', 'png'],
    }
});

const upload = multer({ storage });

// Use in routes:
router.post('/listings', upload.single('image'), wrapAsync(async (req, res) => {
    // req.file.path = Cloudinary URL (e.g., https://res.cloudinary.com/...)
    // req.file.filename = public_id (e.g., wanderlust/abc123)

    const newListing = new Listing({
        ...req.body.listing,
        image: { url: req.file.path, filename: req.file.filename }
    });
    await newListing.save();
}));
```

---

## MERN PACKAGES — SECURITY

---

### 18. `helmet` — Security HTTP Headers
**Install:** `npm install helmet`
**Docs:** https://helmetjs.github.io/

```js
const helmet = require('helmet');

// Add to app.js (use in production):
app.use(helmet());
// Sets ~15 security-related HTTP headers automatically:
// - X-Content-Type-Options: nosniff  (prevents MIME sniffing)
// - X-Frame-Options: SAMEORIGIN      (prevents clickjacking)
// - X-XSS-Protection: 1; mode=block (basic XSS protection)
// - Strict-Transport-Security        (enforce HTTPS)
// - Content-Security-Policy          (restrict resource loading)
// etc.

// Configure to allow specific sources (needed for Bootstrap CDN, etc.):
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "cdn.jsdelivr.net"],
            styleSrc: ["'self'", "cdn.jsdelivr.net"],
            imgSrc: ["'self'", "res.cloudinary.com"],
        }
    }
}));
```

---

### 19. `express-mongo-sanitize` — Prevent NoSQL Injection
**Install:** `npm install express-mongo-sanitize`
**Docs:** https://github.com/fiznool/express-mongo-sanitize

```js
const mongoSanitize = require('express-mongo-sanitize');

// Add to app.js:
app.use(mongoSanitize());
// Removes $ and . from user input — prevents MongoDB injection attacks

// Without this, an attacker could send:
// { "username": { "$gt": "" } }  ← finds ALL users!

// With sanitize, the $ is stripped before it reaches MongoDB
```

---

## MERN PACKAGES — MAPS & EMAIL

---

### 20. `@mapbox/mapbox-sdk` — Maps & Geocoding
**Install:** `npm install @mapbox/mapbox-sdk`
**Docs:** https://github.com/mapbox/mapbox-sdk-js

```js
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

// Convert an address to coordinates (geocoding):
const response = await geocoder.forwardGeocode({
    query: 'Bali, Indonesia',
    limit: 1
}).send();

const coordinates = response.body.features[0].geometry.coordinates;
// [longitude, latitude] → e.g., [115.1889, -8.4095]

// Save coordinates to listing:
newListing.geometry = response.body.features[0].geometry;
// geometry = { type: 'Point', coordinates: [115.1889, -8.4095] }

// .env:
// MAP_TOKEN=pk.eyJ1IjoiYW1hbiIs...
```

---

### 21. `joi` — Data Validation Library
**Install:** `npm install joi`
**Docs:** https://joi.dev/

```js
const Joi = require('joi');

// Define a validation schema:
const listingSchema = Joi.object({
    title:       Joi.string().required().min(3).max(100),
    description: Joi.string().required(),
    price:       Joi.number().required().min(0),
    location:    Joi.string().required(),
    country:     Joi.string().required(),
    image:       Joi.string().allow('', null),  // optional
});

// Validate data:
const { error, value } = listingSchema.validate(req.body);
if (error) {
    // error.details = array of error objects
    // error.details[0].message = '"title" is required'
    const errMsg = error.details.map(el => el.message).join(', ');
    throw new expressError(400, errMsg);
}

// Common Joi validators:
// .string()       → must be a string
// .number()       → must be a number
// .required()     → field must exist
// .min(n)         → minimum value/length
// .max(n)         → maximum value/length
// .email()        → valid email format
// .uri()          → valid URL
// .allow('', null)→ allow empty/null
// .trim()         → strip whitespace
```

---

## QUICK INSTALL COMMANDS

```bash
# ===== PHASE 1: Basic Setup =====
npm install express mongoose ejs ejs-mate method-override

# ===== PHASE 2: Validation =====
npm install joi

# ===== PHASE 3: Sessions + Flash + Auth =====
npm install express-session connect-mongo connect-flash passport passport-local passport-local-mongoose

# ===== PHASE 4: Image Upload =====
npm install multer cloudinary multer-storage-cloudinary

# ===== PHASE 5: Maps =====
npm install @mapbox/mapbox-sdk

# ===== PHASE 6: Security (Production) =====
npm install helmet express-mongo-sanitize dotenv

# ===== DEV TOOLS =====
npm install -g nodemon  # Auto-restart server on file changes

# ===== ALL AT ONCE (full project) =====
npm install express mongoose ejs ejs-mate method-override joi express-session connect-mongo connect-flash passport passport-local passport-local-mongoose multer cloudinary multer-storage-cloudinary @mapbox/mapbox-sdk helmet express-mongo-sanitize dotenv
```

---

## PACKAGE SUMMARY TABLE

| Package | Category | What it does | Your Project |
|---------|----------|-------------|-------------|
| `express` | Core | Web framework — routes, middleware | ✅ Used |
| `mongoose` | Core | MongoDB ODM — models, queries | ✅ Used |
| `ejs` | Core | Template engine | ✅ Used |
| `ejs-mate` | Core | Layout support for EJS | ✅ Used |
| `method-override` | Core | PUT/DELETE from HTML forms | ✅ Used |
| `joi` | Validation | Schema validation for req.body | ✅ Used |
| `express-session` | Auth | Server-side sessions | ✅ Used |
| `connect-mongo` | Auth | Store sessions in MongoDB | ✅ Used |
| `connect-flash` | Auth | One-time flash messages | ✅ Used |
| `passport` | Auth | Authentication framework | ✅ Used |
| `passport-local` | Auth | Username/password strategy | ✅ Used |
| `passport-local-mongoose` | Auth | Auto hash/salt + model methods | ✅ Used |
| `dotenv` | Config | Load .env variables | ✅ Used |
| `multer` | Files | Handle file uploads | 🔜 Next |
| `cloudinary` | Files | Cloud image storage | 🔜 Next |
| `multer-storage-cloudinary` | Files | Multer → Cloudinary pipeline | 🔜 Next |
| `@mapbox/mapbox-sdk` | Maps | Geocoding + map display | 🔜 Future |
| `helmet` | Security | Set security HTTP headers | 🔜 Production |
| `express-mongo-sanitize` | Security | Prevent NoSQL injection | 🔜 Production |
| `bcrypt` | Auth | Manual password hashing (not needed with PLM) | Optional |

---

## REFERENCES

- **Express.js official docs:** https://expressjs.com/en/api.html#req
- **Mongoose docs:** https://mongoosejs.com/docs/
- **Passport.js docs:** https://www.passportjs.org/docs/
- **Joi docs:** https://joi.dev/api/
- **express-session docs:** https://github.com/expressjs/session
- **connect-flash docs:** https://github.com/jaredhanson/connect-flash
- **Cloudinary Node SDK:** https://cloudinary.com/documentation/node_integration
- **Multer docs:** https://github.com/expressjs/multer
- **Helmet docs:** https://helmetjs.github.io/
- **Mapbox SDK docs:** https://github.com/mapbox/mapbox-sdk-js
- **npm registry:** https://www.npmjs.com/ (search any package)

---

> 📝 **This file covers all packages and req properties you'll use in MERN.**
> Update this file as you add new packages (image upload, maps, deploy)!

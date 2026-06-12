# 🔐 AUTHENTICATION — Complete Guide
> How users sign up, log in, and stay logged in across requests
> Theory + working code with Passport.js + passport-local-mongoose
> Phase 13 of your Wanderlust (Airbnb Clone) project

---

## 📋 TABLE OF CONTENTS
1. [What is Authentication?](#what-is-authentication)
2. [Authentication vs Authorization](#authentication-vs-authorization)
3. [How Passport.js Works](#how-passportjs-works)
4. [Packages to Install](#packages-to-install)
5. [Step 1 — User Model](#step-1--user-model-modelsuserjs)
6. [Step 2 — Configure Passport in app.js](#step-2--configure-passport-in-appjs)
7. [Step 3 — Auth Routes (route/auth.js)](#step-3--auth-routes-routeauthjs)
8. [Step 4 — Auth Views (EJS Templates)](#step-4--auth-views-ejs-templates)
9. [Step 5 — Update Navbar](#step-5--update-navbar)
10. [Step 6 — Connect Auth to app.js](#step-6--connect-auth-to-appjs)
11. [How serializeUser & deserializeUser Work](#how-serializeuser--deserializeuser-work)
12. [The Full Login Flow Explained](#the-full-login-flow-explained)
13. [Common Mistakes & Fixes](#common-mistakes--fixes)
14. [Quick Reference](#quick-reference)

---

## WHAT IS AUTHENTICATION?

Authentication = **"Who are you?"**

It is the process of verifying a user's identity — usually with a username and password.

```
Without auth:
  Anyone can create, edit, or delete ANY listing — even someone else's!
  No concept of "my listings" exists

With auth:
  Users register with username + password
  Users log in → server recognizes them
  Users stay logged in across requests (via sessions)
  Users can only edit/delete their OWN listings (authorization — next phase)
```

### The 3 actions of Authentication:
| Action | Route | What happens |
|--------|-------|-------------|
| **Sign Up** | `POST /signup` | Create new user with hashed password |
| **Log In** | `POST /login` | Verify credentials → create session |
| **Log Out** | `GET /logout` | Destroy session → user is forgotten |

---

## AUTHENTICATION VS AUTHORIZATION

These two words are often confused — they mean different things:

```
Authentication = Who are you?
  → "I am Aman. Here's my password."
  → Server checks: does this user EXIST? Is the password CORRECT?

Authorization = What are you allowed to do?
  → "Can Aman delete this listing?"
  → Server checks: does Aman OWN this listing?
```

| | Authentication | Authorization |
|--|---------------|--------------|
| **Question** | Who are you? | What can you do? |
| **Happens** | Login / Signup | Every protected action |
| **Middleware** | `passport.authenticate()` | `isLoggedIn`, `isOwner` |
| **Covered in** | This file (13) | Next file (14) |

---

## HOW PASSPORT.JS WORKS
install - npm i passport
            npm i passport-local
            npm i passport-local-mongoose

Passport.js is the industry-standard auth library for Express. It handles:
- Verifying username/password
- Serializing/deserializing user into the session
- Providing `req.user` on every request (if logged in)

### The packages you need:
```
passport                → Core library (handles session integration)
passport-local          → Strategy for username+password login
passport-local-mongoose → Mongoose plugin (adds hash+salt to User model automatically)
```

### What passport-local-mongoose does automatically:
```js
// WITHOUT passport-local-mongoose — you'd have to do ALL of this manually:
const bcrypt = require('bcrypt');
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
// store hash+salt, compare on login, etc.

// WITH passport-local-mongoose — ONE LINE handles everything:
UserSchema.plugin(passportLocalMongoose);
// ✅ Adds username field (indexed, unique)
// ✅ Adds password field (hashed with PBKDF2 + salt — more secure than bcrypt)
// ✅ Adds .register(user, password) method — saves user with hashed password
// ✅ Adds .authenticate() static method — used by Passport strategy
// ✅ Adds .serializeUser() and .deserializeUser() — for session management
```

---

## PACKAGES TO INSTALL

```bash
npm install passport passport-local passport-local-mongoose
```

What each does:
| Package | Purpose |
|---------|---------|
| `passport` | Core auth framework, integrates with express-session |
| `passport-local` | Strategy: verify user with username + password |
| `passport-local-mongoose` | Mongoose plugin: auto hash/salt, adds register(), authenticate() |

> **Note:** You already have `express-session` and `connect-flash` from Phase 12 — they're required for Passport to work.

---

## STEP 1 — USER MODEL (`models/user.js`)

```js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,   // Each email can only be used once
    }
    // NOTE: Do NOT add username or password fields manually!
    // passport-local-mongoose adds them automatically when you call:
    // userSchema.plugin(passportLocalMongoose)
    //
    // It adds:
    //   username: String (unique, indexed)
    //   hash: String     (the hashed password — never stored as plain text!)
    //   salt: String     (random value used in hashing for extra security)
});

// This ONE LINE does all the password hashing magic
userSchema.plugin(passportLocalMongoose);
// Now User has:
//   User.register(newUser, password)   → saves user with hashed password
//   User.authenticate()                → verifies credentials (used by passport)
//   User.serializeUser()               → stores user ID in session
//   User.deserializeUser()             → fetches user from DB using session ID

const User = mongoose.model('User', userSchema);
module.exports = User;
```
= salting = password salting is a technique to protect passwords stored in databases 
    by adding a string     of 32 or more characters and then hashing them
### Why we don't store password directly:
```
User enters: password = "mypassword123"

What happens inside passport-local-mongoose:
  1. Generate random salt: "a8f3k2..."
  2. Hash: PBKDF2("mypassword123" + "a8f3k2...") = "hashed_gibberish_xyz..."
  3. Store in DB: { hash: "hashed_gibberish_xyz...", salt: "a8f3k2..." }

When user logs in:
  1. Get salt from DB: "a8f3k2..."
  2. Hash what user typed: PBKDF2("mypassword123" + "a8f3k2...") = "hashed_gibberish_xyz..."
  3. Compare with stored hash → match! ✅ → Login success

If DB is hacked:
  Hacker gets: { hash: "hashed_gibberish_xyz...", salt: "a8f3k2..." }
  → Useless without original password (can't reverse a hash)
  → User's actual password is NEVER stored anywhere!
```

---

## STEP 2 — CONFIGURE PASSPORT IN `app.js`

This is the **order-sensitive** part. Passport setup MUST happen in this exact order:

```js
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// ============================================================
//   1. SESSION — Must come BEFORE passport (passport uses session)
// ============================================================
const sessionOptions = {
    secret: 'mysecretkey',          // Change this! Use .env in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24,  // 24 hours
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
    }
};
app.use(session(sessionOptions));
app.use(flash());

// ============================================================
//   2. PASSPORT INITIALIZATION — Must come AFTER session
// ============================================================
app.use(passport.initialize());
// Tells passport to start working with Express

app.use(passport.session());
// Tells passport to use express-session for persistent login
// (stores user ID in session between requests)

// ============================================================
//   3. STRATEGY — Tell passport HOW to verify username+password
// ============================================================
passport.use(new LocalStrategy(User.authenticate()));
// User.authenticate() is provided by passport-local-mongoose
// It looks up the username in MongoDB, verifies the hashed password

// ============================================================
//   4. SERIALIZE / DESERIALIZE — How to store/retrieve user in session
// ============================================================
passport.serializeUser(User.serializeUser());
// Converts user object → user ID (stored in session cookie)
// Example: { _id: 'abc123', username: 'aman' } → 'abc123'

passport.deserializeUser(User.deserializeUser());
// Converts user ID → full user object (looked up from DB on each request)
// Example: 'abc123' → { _id: 'abc123', username: 'aman', email: '...' }

// ============================================================
//   5. MAKE currentUser AVAILABLE IN ALL TEMPLATES
// ============================================================
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    // req.user = the logged-in user object (set by passport.deserializeUser)
    // req.user = undefined when NOT logged in
    // Now EVERY EJS template can access `currentUser` without extra code!
    next();
});

// ============================================================
//   6. MOUNT ROUTES — Must come AFTER all middleware above
// ============================================================
const authRouter = require('./route/auth');
app.use('/', authRouter);
// Auth routes: /signup, /login, /logout (no prefix — they're at root level)
```

### THE ORDER MATTERS — ALWAYS:
```
1. express-session       ← Passport needs this to store session data
2. connect-flash         ← Flash needs session to work
3. passport.initialize() ← Start passport
4. passport.session()    ← Connect passport to express-session
5. Set up strategy       ← Tell passport HOW to verify users
6. serializeUser         ← How to store user in session
7. deserializeUser       ← How to retrieve user from session
8. res.locals middleware ← Make currentUser available in templates
9. Mount routes          ← Last step
```

---

## STEP 3 — AUTH ROUTES (`route/auth.js`)

Create a new file: `route/auth.js`

```js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const User = require('../models/user');

// ============================================================
//   SIGNUP ROUTES
// ============================================================

// GET /signup — show the signup form
router.get('/signup', (req, res) => {
    res.render('auth/signup.ejs');
});

// POST /signup — handle the signup form submission
router.post('/signup', wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Create a new user object (WITHOUT password — that's handled by .register())
        const newUser = new User({ email, username });

        // .register() hashes the password and saves the user to the DB
        // It's provided by passport-local-mongoose
        // If username already exists → throws an error (caught by try/catch)
        const registeredUser = await User.register(newUser, password);

        // After signup, log the user in automatically (no need to go to login page)
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', `Welcome to Wanderlust, ${username}!`);
            res.redirect('/listings');
        });

    } catch (e) {
        // passport-local-mongoose throws error if username is already taken
        req.flash('error', e.message);
        res.redirect('/signup');
    }
}));

// ============================================================
//   LOGIN ROUTES
// ============================================================

// GET /login — show the login form
router.get('/login', (req, res) => {
    res.render('auth/login.ejs');
});

// POST /login — handle the login form submission using passport
router.post('/login',
    // passport.authenticate() is a middleware that:
    //   1. Reads username + password from req.body
    //   2. Runs User.authenticate() to verify them
    //   3. On SUCCESS → calls next() and sets req.user
    //   4. On FAILURE → redirects to failureRedirect with flash message
    passport.authenticate('local', {
        failureFlash: true,             // Auto-sets req.flash('error', 'Invalid username/password')
        failureRedirect: '/login',      // Go back to login form if credentials are wrong
    }),
    (req, res) => {
        // Only runs if passport.authenticate() SUCCEEDS (credentials correct)
        req.flash('success', `Welcome back, ${req.user.username}!`);
        // Redirect to where the user was trying to go (if saved), otherwise /listings
        const redirectUrl = res.locals.redirectUrl || '/listings';
        res.redirect(redirectUrl);
    }
);

// ============================================================
//   LOGOUT ROUTE
// ============================================================

// GET /logout — log the user out
router.get('/logout', (req, res, next) => {
    // req.logout() is added by Passport — clears req.user and the session
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'You have been logged out!');
        res.redirect('/listings');
    });
});

module.exports = router;
```

### What `passport.authenticate('local', {...})` does step by step:
```
User submits login form: { username: 'aman', password: 'mypass' }
    ↓
passport.authenticate('local') runs:
    ↓
Looks up user in DB: User.findOne({ username: 'aman' })
    ↓
User found → compares password:
    PBKDF2('mypass' + stored_salt) === stored_hash?
    ↓
✅ MATCH → calls next() → req.user = found user object
❌ NO MATCH → redirects to /login with error flash message
```

---

## STEP 4 — AUTH VIEWS (EJS TEMPLATES)

Create a new folder: `views/auth/`

### `views/auth/signup.ejs`
```html
<%- layout('layouts/boilerplate') %>

<div class="auth-container">
    <div class="auth-card">
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Join Wanderlust today</p>

        <form action="/signup" method="POST" class="needs-validation" novalidate>

            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    class="form-control"
                    placeholder="Choose a username"
                    required>
                <div class="invalid-feedback">Username is required.</div>
            </div>

            <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    class="form-control"
                    placeholder="you@example.com"
                    required>
                <div class="invalid-feedback">Please enter a valid email.</div>
            </div>

            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    class="form-control"
                    placeholder="Create a password"
                    required>
                <div class="invalid-feedback">Password is required.</div>
            </div>

            <button type="submit" class="btn btn-primary w-100">Sign Up</button>
        </form>

        <p class="auth-switch">
            Already have an account? <a href="/login">Log in</a>
        </p>
    </div>
</div>
```

### `views/auth/login.ejs`
```html
<%- layout('layouts/boilerplate') %>

<div class="auth-container">
    <div class="auth-card">
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Log in to your account</p>

        <form action="/login" method="POST" class="needs-validation" novalidate>

            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    class="form-control"
                    placeholder="Your username"
                    required>
                <div class="invalid-feedback">Username is required.</div>
            </div>

            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    class="form-control"
                    placeholder="Your password"
                    required>
                <div class="invalid-feedback">Password is required.</div>
            </div>

            <button type="submit" class="btn btn-primary w-100">Log In</button>
        </form>

        <p class="auth-switch">
            Don't have an account? <a href="/signup">Sign up</a>
        </p>
    </div>
</div>
```

### Form field naming — why `name="username"` and `name="password"`:
```
passport-local reads these EXACT field names by default:
  name="username"  → req.body.username
  name="password"  → req.body.password

If you use different names (e.g. name="user" or name="email"):
  → Passport won't find them → login will always fail!
  → Fix: pass { usernameField: 'email' } to LocalStrategy if you want to use email
```

---

## STEP 5 — UPDATE NAVBAR

In `views/includes/navbar.ejs`, add login/logout/signup links:

```html
<nav class="navbar navbar-expand-md">
    <div class="container-fluid">

        <!-- Brand logo -->
        <a class="navbar-brand" href="/listings">
            <i class="fa-solid fa-compass"></i> Wanderlust
        </a>

        <!-- Hamburger for mobile -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">

                <!-- Always visible -->
                <li class="nav-item">
                    <a class="nav-link" href="/listings">Explore</a>
                </li>

                <!-- Only show when NOT logged in -->
                <% if (!currentUser) { %>
                    <li class="nav-item">
                        <a class="nav-link" href="/signup">Sign Up</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/login">Log In</a>
                    </li>

                <!-- Only show when logged in -->
                <% } else { %>
                    <li class="nav-item">
                        <a class="nav-link" href="/listings/new">
                            <i class="fa-solid fa-plus"></i> Add Listing
                        </a>
                    </li>
                    <li class="nav-item">
                        <span class="nav-link">Hello, <%= currentUser.username %>!</span>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/logout">Log Out</a>
                    </li>
                <% } %>

            </ul>
        </div>
    </div>
</nav>
```

### Why `currentUser` is available in the navbar:
```js
// In app.js — this middleware runs on EVERY request:
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    // req.user = the logged-in user (set by passport.deserializeUser)
    // res.locals = variables available in ALL EJS templates
    // So currentUser is available everywhere — including navbar.ejs!
    next();
});
```

---

## STEP 6 — CONNECT AUTH TO `app.js`

Here is the **complete updated `app.js`** with auth added:

```js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressError = require('./utils/expressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// Routers
const listings = require('./route/listing.js');
const reviews = require('./route/review.js');
const authRouter = require('./route/auth.js');    // ← ADD THIS

// Middleware setup
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));

// Session
const sessionOptions = {
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
    }
};
app.use(session(sessionOptions));
app.use(flash());

// Passport — MUST come after session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make flash + currentUser available in all templates
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;   // ← ADD THIS
    next();
});

// Mount routers
app.use('/', authRouter);               // ← ADD THIS (auth routes at root level)
app.use('/listings', listings);
app.use('/listings/:id/reviews', reviews);

// Database
main().then(() => console.log('database are up')).catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.listen(3000, () => console.log('server is up and running'));

// 404 handler
app.all(/(.*)/, (req, res, next) => {
    next(new expressError(404, 'page not found'));
});

// Error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'something went wrong' } = err;
    res.render('listings/error.ejs', { message, statusCode });
});
```

---

## HOW SERIALIZEUSER & DESERIALIZEUSER WORK

This is the most confusing part of Passport — here's a plain-English breakdown:

```
SERIALIZE = "What do we save in the session cookie?"

passport.serializeUser(User.serializeUser());
  → When user logs in: take their full user object
  → Extract just the _id (e.g., "abc123")
  → Store that _id in the session cookie (not the full user object!)
  → Why just the ID? Cookies have a 4KB size limit. An ID is tiny.

DESERIALIZE = "On each request, who does this session belong to?"

passport.deserializeUser(User.deserializeUser());
  → On every request: read the _id from the session cookie ("abc123")
  → Run: User.findById("abc123") in MongoDB
  → Set req.user = the found user object
  → Now req.user is available in ALL your routes and middleware!
```

```
LOGIN REQUEST:
  User submits form → passport verifies password ✅
  → serializeUser: stores user._id in session cookie → "abc123"
  → Browser gets cookie: { sessionId: "cookie_containing_abc123" }

NEXT REQUEST (e.g., GET /listings):
  Browser sends cookie with every request
  → express-session reads cookie → finds "abc123"
  → deserializeUser: User.findById("abc123") → req.user = { _id: "abc123", username: "aman" }
  → req.user is now available everywhere in this request
  → res.locals.currentUser = req.user → available in templates
```

---

## THE FULL LOGIN FLOW EXPLAINED

```
1. User visits /login
   → GET /login → res.render('auth/login.ejs')

2. User fills in username="aman", password="mypass" and submits
   → POST /login

3. passport.authenticate('local') runs:
   → Reads req.body.username = "aman"
   → Reads req.body.password = "mypass"
   → Runs User.authenticate() (from passport-local-mongoose)
   → Queries: User.findOne({ username: "aman" })
   → Found user with hash + salt stored in DB
   → Hashes "mypass" + salt → compares with stored hash

4a. If match ✅:
   → serializeUser: stores user._id in session
   → req.user = found user object
   → next() is called
   → Route handler runs: req.flash('success', 'Welcome back!')
   → res.redirect('/listings')

4b. If no match ❌:
   → failureFlash: auto sets req.flash('error', 'Invalid username or password')
   → failureRedirect: sends user back to /login
   → Login form shows error message

5. On subsequent requests to /listings:
   → deserializeUser: reads session → User.findById(id) → req.user = user
   → res.locals.currentUser = req.user → navbar shows "Hello, aman!"
```

---

## COMMON MISTAKES & FIXES

| Mistake | What happens | Fix |
|---------|-------------|-----|
| Passport setup BEFORE session | Session not initialized → passport can't store login state | Always put `app.use(session(...))` before `passport.initialize()` |
| Form uses `name="email"` for login | Passport looks for `name="username"` by default → always fails | Use `name="username"` or configure `{ usernameField: 'email' }` in LocalStrategy |
| Forgot `passport.session()` | User logged in but req.user is undefined on next request | Add `app.use(passport.session())` after `passport.initialize()` |
| Forgot `res.locals.currentUser = req.user` | `currentUser` undefined in templates → navbar always shows "Sign Up" | Add it to the flash middleware in app.js |
| Using `req.logout()` without callback | In newer Passport versions, `req.logout()` requires a callback | Always use `req.logout((err) => { ... })` |
| Adding username/password fields to User schema | Conflicts with passport-local-mongoose which adds them | Only add fields YOU need (like email) — let the plugin handle username/password |
| Forgot `try/catch` in signup route | If username is taken, unhandled error crashes server | Wrap `User.register()` in try/catch and redirect with flash on error |

---

## 🧠 QUICK REFERENCE

### Route table for auth:
| Method | Path | What it does |
|--------|------|-------------|
| `GET` | `/signup` | Show signup form |
| `POST` | `/signup` | Create new user, auto-login, redirect |
| `GET` | `/login` | Show login form |
| `POST` | `/login` | Verify credentials, create session |
| `GET` | `/logout` | Destroy session, redirect |

### Files created/modified for Authentication:
| File | Change |
|------|--------|
| `models/user.js` | **Created** — User model with passport-local-mongoose plugin |
| `route/auth.js` | **Created** — Signup, Login, Logout routes |
| `views/auth/signup.ejs` | **Created** — Signup form template |
| `views/auth/login.ejs` | **Created** — Login form template |
| `views/includes/navbar.ejs` | **Updated** — Show login/logout based on `currentUser` |
| `app.js` | **Updated** — Passport setup + `res.locals.currentUser` + auth router mounted |

### Install command:
```bash
npm install passport passport-local passport-local-mongoose
```

### The 4 key Passport lines (copy these every project):
```js
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
```

---

> 📝 **Next step:** After authentication works, add Authorization (`14_authorization.md`) — `isLoggedIn` middleware to protect routes, `isOwner` middleware to restrict edit/delete to listing owners only.

---

## YOUR ACTUAL IMPLEMENTATION (What you built)

> This section shows the EXACT code you wrote — differences from the "ideal" guide above are noted.

### Key differences in YOUR project:

| Topic | Guide says | Your actual code |
|-------|-----------|-----------------|
| Route file name | `route/auth.js` | `route/user.js` |
| Signup page route | `GET /signup` | `GET /register` |
| Signup POST | `POST /signup` | `POST /signup` |
| Middleware location | Inside route file | Separate `middleware.js` file |
| PLM import | `passportLocalMongoose` | `passportLocalMongoose.default` |
| Router mounted at | `/` (auth) | `/` (userRoutes) |

---

### YOUR `models/user.js` (Actual):

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    // IMP: username and password are added AUTOMATICALLY by passport-local-mongoose
    // We only add extra fields we need (like email)
    email: {
        type: String,
        required: true,
        unique: true
    },
});

// NOTE: You used .default here — this is because of how the package exports
// in some versions. passportLocalMongoose.default === passportLocalMongoose
UserSchema.plugin(passportLocalMongoose.default);
// This ONE line does:
// ✅ Adds username field (unique, indexed)
// ✅ Adds hash + salt fields (password stored hashed, never plain text)
// ✅ Adds User.register(user, password) method
// ✅ Adds User.authenticate() method (used by passport strategy)
// ✅ Adds User.serializeUser() and User.deserializeUser()

const User = mongoose.model('User', UserSchema);
module.exports = User;
```

---

### YOUR `middleware.js` (Actual — separate file at project root):

```js
// isLoggedIn — protects routes that need login
module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.path, "..", req.originalUrl);
    // req.path = the current path (e.g. /new)
    // req.originalUrl = full URL with prefix (e.g. /listings/new)
    // We log both for debugging — to see exactly where user was trying to go

    // Save the URL the user was trying to reach, BEFORE redirecting to login
    req.session.redirectUrl = req.originalUrl;
    // After login, we'll redirect them back here

    if (req.isAuthenticated()) {
        return next();  // ✅ Logged in → continue to route
    }
    req.flash('error', 'You must be logged in to do that!');
    res.redirect('/login');
};

// saveRedirectUrl — copies redirectUrl from session to res.locals
// Called in POST /login BEFORE passport.authenticate()
// Why? Because passport.authenticate() can reset/clear the session,
// which would destroy our saved redirectUrl!
// By copying to res.locals, we preserve it through the login process.
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
```

---

### YOUR `route/user.js` (Actual):

```js
const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync.js');
const { saveRedirectUrl } = require('../middleware.js');
// Note: isLoggedIn is imported in listing.js, not here

// ── SIGNUP ──────────────────────────────────────────────────
// GET /register — Show signup form
// Note: your register PAGE is at /register (not /signup)
router.get("/register", (req, res) => {
    res.render("users/signup.ejs");
});

// POST /signup — Handle signup form submission
router.post("/signup", wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Create user WITHOUT password (PLM handles password separately)
        const user = new User({ username, email });

        // User.register() hashes the password and saves to DB
        const registeredUser = await User.register(user, password);

        // Auto-login after signup using req.login()
        // (built-in passport method, same family as req.logout)
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err); // Note: 'next' not in scope — bug to fix!
            }
            req.flash("success", "welcome to wanderlust");
            res.redirect("/listings"); // Note: typo '/lisitings' in original
        });

    } catch (e) {
        // If username already taken, passport-local-mongoose throws an error
        req.flash("error", e.message);
        res.redirect("/register");
    }
}));

// ── LOGIN ────────────────────────────────────────────────────
// GET /login — Show login form
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// POST /login — Authenticate user with passport
router.post("/login",
    // Step 1: Save the intended URL (must run BEFORE passport clears session)
    saveRedirectUrl,

    // Step 2: passport.authenticate() verifies username + password
    // successRedirect: where to go on success (overridden by redirectUrl if set)
    // failureRedirect: where to go if login fails
    // failureFlash: auto-sets error flash message on failure
    wrapAsync(passport.authenticate("local", {
        successRedirect: "/listings",
        failureRedirect: "/login",
        failureFlash: true
    }),
        async (req, res) => {
            // This callback runs on SUCCESS
            req.flash("success", "welcome back!");
            // Redirect to saved URL, or /listings as fallback
            res.redirect(res.locals.redirectUrl || "/listings");
        }
    )
);

// ── LOGOUT ───────────────────────────────────────────────────
// GET /logout — Log user out
router.get("/logout", (req, res, next) => {
    // req.logout() is provided by Passport
    // In newer versions of Passport (0.6+), it requires a callback
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "logged out successfully");
        res.redirect("/listings");
    });
});

module.exports = router;
```

---

### YOUR `app.js` — Auth setup section (Actual):

```js
// ── IMPORTS ──────────────────────────────────────────────────
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRoutes = require('./route/user.js');

// ── SESSION (must come BEFORE passport) ──────────────────────
const sessionOptions = {
    secret: "mysecretkey",      // ⚠️ Use .env in production!
    resave: false,
    saveUninitialized: true,    // Creates session even for unauthenticated users
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24,  // 24 hours from NOW
        maxAge: 1000 * 60 * 60 * 24,                  // 24 hours duration
        httpOnly: true,  // Cookie not readable by browser JS (security)
    }
};
app.use(session(sessionOptions));
app.use(flash());               // Flash needs session — must come after

// ── PASSPORT SETUP (must come AFTER session) ──────────────────
app.use(passport.initialize()); // Start passport
app.use(passport.session());    // Connect passport to express-session

// Tell passport HOW to verify username+password:
passport.use(new LocalStrategy(User.authenticate()));

// How to store user in session (just saves the user ID):
passport.serializeUser(User.serializeUser());

// How to load user from session (runs User.findById on each request):
passport.deserializeUser(User.deserializeUser());

// ── MAKE currentUser AVAILABLE IN ALL TEMPLATES ───────────────
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error   = req.flash('error');
    res.locals.currentUser = req.user;
    // req.user = undefined if not logged in
    // req.user = full user object if logged in (set by deserializeUser)
    next();
});

// ── MOUNT AUTH ROUTER ─────────────────────────────────────────
app.use("/", userRoutes);
// Auth routes: /register, /signup, /login, /logout
// Mounted at root "/" — no prefix
```

---

### Files created for YOUR authentication:

| File | Status | Notes |
|------|--------|-------|
| `models/user.js` | ✅ Created | UserSchema + PLM plugin |
| `route/user.js` | ✅ Created | /register, /signup, /login, /logout |
| `middleware.js` | ✅ Created | isLoggedIn + saveRedirectUrl |
| `views/users/signup.ejs` | ✅ Created | Signup form |
| `views/users/login.ejs` | ✅ Created | Login form |
| `app.js` | ✅ Updated | Passport setup + currentUser + userRoutes |

---

### Known bugs / things to improve in YOUR code:

| Issue | Location | Fix |
|-------|----------|-----|
| `next` not in scope in signup | `route/user.js` line 22 | Add `next` to the outer `wrapAsync` callback params |
| Typo `/lisitings` | `route/user.js` line 25 | Change to `/listings` |
| `successRedirect` in authenticate + manual redirect causes conflict | `route/user.js` POST /login | Either use `successRedirect` OR the callback — not both |
| `saveUninitialized: true` | `app.js` | Should be `false` for security (don't create sessions for anonymous users) |
| Secret hardcoded | `app.js` | Move to `.env`: `secret: process.env.SECRET` |

---

> 📝 **Authentication is complete!** Your next step (Authorization) restricts what logged-in users can do — only owners can edit/delete their own listings. See `14_authorization.md`.

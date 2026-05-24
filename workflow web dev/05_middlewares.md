# 🔧 MIDDLEWARES - Complete Guide
> Everything about Express middleware — what, why, how, error handling
> All examples from YOUR Wanderlust project

---

## 📋 TABLE OF CONTENTS
1. [What is Middleware?](#what-is-middleware)
2. [How Middleware Works](#how-middleware-works---the-conveyor-belt)
3. [Types of Middleware](#types-of-middleware)
4. [Built-in Middleware (app.use)](#built-in-middleware-you-use)
5. [Custom Middleware](#custom-middleware)
6. [Validation Middleware](#validation-middleware)
7. [Error Handling Middleware](#error-handling-middleware)
8. [wrapAsync — The Async Error Catcher](#wrapasync--the-async-error-catcher)
9. [Custom Error Class](#custom-error-class)
10. [The Complete Error Handling Flow](#the-complete-error-handling-flow)
11. [Middleware You'll Add Next](#middleware-youll-add-next)

---

## WHAT IS MIDDLEWARE?

**In simple words:** A middleware is a **function** that runs BETWEEN the request and the response. 

Think of it like a **security checkpoint** at an airport:
```
Passenger (Request) → Security Check (Middleware) → Gate (Route Handler) → Flight (Response)
```

Every middleware has access to:
- `req` — the request object
- `res` — the response object  
- `next` — a function to move to the next middleware

```js
// Basic middleware structure
(req, res, next) => {
    // Do something with req or res
    next();  // Move to the next middleware or route
}
```

### ⚠️ THE GOLDEN RULE:
**If a middleware doesn't call `next()`, the request gets stuck and the user sees infinite loading.**

---

## HOW MIDDLEWARE WORKS - THE CONVEYOR BELT

```
Request comes in
    ↓
app.use(express.urlencoded())    ← Middleware 1: Parse form data
    ↓ next()
app.use(methodOverride())       ← Middleware 2: Handle PUT/DELETE
    ↓ next()
app.use(express.static())      ← Middleware 3: Serve static files
    ↓ next()
validateListing                 ← Middleware 4: Check data with Joi (only on specific routes)
    ↓ next()
Route Handler                  ← Your actual route code
    ↓
res.render() / res.redirect()  ← Response sent to user
```

If ANY middleware throws an error:
```
    ↓ Error thrown or next(error) called
    ↓ SKIPS all remaining middleware/routes
    ↓ Goes directly to ERROR HANDLING middleware
app.use((err, req, res, next) => { ... })  ← Error handler (4 params!)
```

---

## TYPES OF MIDDLEWARE

### 1. Application-Level Middleware (`app.use`)
Runs for EVERY request:
```js
app.use(express.urlencoded({ extended: true }));  // Runs on every request
```

### 2. Route-Level Middleware
Runs only for specific routes:
```js
// validateListing runs ONLY for these routes, not all routes
app.post('/listings', validateListing, wrapAsync(async (req, res) => { ... }));
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => { ... }));
```

### 3. Error-Handling Middleware (4 params)
Catches errors:
```js
app.use((err, req, res, next) => {  // ← 4 params means error handler!
    // Handle the error
});
```

### 4. Third-Party Middleware
From npm packages:
```js
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
```

---

## BUILT-IN MIDDLEWARE YOU USE

### 1. `express.urlencoded()` — Parse form data
```js
app.use(express.urlencoded({ extended: true }));
```
**What it does:** When a form is submitted, the data comes as a raw string like `title=Villa&price=2000`. This middleware converts it into a JavaScript object: `{ title: "Villa", price: "2000" }` so you can access `req.body.title`.

**Without it:** `req.body` would be `undefined`.

### 2. `express.static()` — Serve CSS, JS, images
```js
app.use(express.static(path.join(__dirname, 'public')));
```
**What it does:** Makes files in the `public/` folder accessible via URL. 
- `public/css/style.css` → browser accesses via `/css/style.css`

### 3. `methodOverride()` — Support PUT/DELETE from forms
```js
app.use(methodOverride('_method'));
```
**What it does:** HTML forms only support GET and POST. This middleware reads `?_method=PUT` from the URL and changes the request method to PUT.

### 4. `ejsMate` — Layout support for EJS
```js
app.engine('ejs', ejsMate);
```
**What it does:** Adds layout support to EJS so you can use `<%- layout('layouts/boilerplate') %>` in your templates.

---

## CUSTOM MIDDLEWARE

### From your middleware practice (`middlewares_pra_code/app.js`):

#### Logger middleware — Log info about every request:
```js
app.use((req, res, next) => {
    req.time = new Date().toLocaleTimeString();  // Add custom property to req
    console.log(req.method, req.hostname, req.path, req.time);
    // Output: GET localhost /listings 10:30:00 AM
    next();  // MUST call next() or request gets stuck!
});
```

#### 404 handler — Catch unknown routes:
```js
// Your version (in main app.js):
app.all(/(.*)/, (req, res, next) => {
    next(new expressError(404, "page not found"));
});
// app.all = any HTTP method
// /(.*)/  = any URL path
// Throws a custom error → caught by error handler
```

#### Practice version with custom error class:
```js
app.use((req, res) => {
    throw new ExpressError('Page Not Found', 404);
});
```

---

## VALIDATION MIDDLEWARE

### What is validation middleware?
A middleware function that checks if the incoming data (from a form) is valid BEFORE the route handler runs. If data is invalid, it throws an error immediately and the database is never touched.

### Your `validateListing` middleware (in app.js):
```js
const { listingSchema } = require('./schema.js');

const validateListing = (req, res, next) => {
    // Step 1: Run Joi validation on the request body
    let { error } = listingSchema.validate(req.body);
    // listingSchema.validate(req.body) returns an object: { error, value }
    // - error: contains details about what's wrong (undefined if all good)
    // - value: the validated (and possibly type-converted) data
    
    // Step 2: If validation fails, create error message and throw
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        // error.details = array of all validation errors (can be multiple!)
        // Example: [ { message: '"title" is required', type: 'any.required', ... } ]
        // .map((el) => el.message) = [ '"title" is required' ]
        // .join(",") = '"title" is required' (if only 1 error)
        //           = '"title" is required,"price" must be a number' (if 2 errors)
        throw new expressError(400, errMsg);
    } else {
        // Step 3: If validation passes, move to the next handler
        next();
    }
}
```

### Deep Dive: What Joi validates
```js
// Your schema (schema.js):
module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),    // Must exist AND must be a non-empty string
    description: Joi.string().required(),
    price: Joi.number().required().min(0), // Must be a number, >= 0
    city: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow("", null)   // Optional — can be missing, empty, or null
});

// What Joi checks for each field:
// title: Joi.string().required()
//   - Is it present in req.body?   (required)
//   - Is it a string?               (string)
//   - Is it non-empty?              (implicit — '' fails .required())

// price: Joi.number().required().min(0)
//   - Is it present?               (required)
//   - Is it a number (or numeric string)? (number — Joi auto-converts '100' to 100)
//   - Is it >= 0?                  (min(0))

// image: Joi.string().allow("", null)
//   - Can be absent, empty string, or null — all OK
//   - If present and non-empty, must be a string
```

### Why Joi sometimes rejects valid-looking data:
```
Problem: Your form sends { title: "...", price: "100" }
                                                  ↑ a string! (forms always send strings)

Joi.number() — does it accept strings?
  YES — Joi auto-converts numeric strings like "100" to numbers (100)
  NO  — if you have abortEarly: false and strict mode

Solution: Joi's default is to coerce types (convert string to number)
So "100" becomes 100 automatically — no problem for price fields
```

### Your `validateReview` middleware (in app.js):
```js
const { listingSchema, reviewSchema } = require('./schema.js');
//                      ↑ Import reviewSchema too!

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    } else {
        next();
    }
}
```

### Review Joi Schema (schema.js):
```js
module.exports.reviewSchema = Joi.object({
    review: Joi.object({        // 'review' = wrapper key from the HTML form
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
    // The form must send: { review: { rating: 4, comment: "Great!" } }
    // NOT: { rating: 4, comment: "Great!" }  ← This would fail!
});
```

### Why the `review` wrapper key?
```html
<!-- In your form, fields are named like: -->
<input type="number" name="rating">    ← sends { rating: 4 }

<!-- OR with a wrapper namespace: -->
<input type="number" name="review[rating]">  ← sends { review: { rating: 4 } }

<!-- The second format keeps review data cleanly separated from other form data -->
<!-- It matches: Joi.object({ review: Joi.object({ rating: ... }) }) -->
```

### How it's used (as route-level middleware):
```js
//                     ↓ Runs BEFORE the async handler
app.post('/listings', validateListing, wrapAsync(async (req, res) => {
    // Only reaches here if validation PASSED
}));

app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req, res) => {
    // Only reaches here if review validation PASSED
}));
```

### Flow when validation FAILS:
```
User submits form with empty title
    ↓
validateListing runs
    ↓
Joi says: "title" is required
    ↓
throw new expressError(400, '"title" is required')
    ↓
SKIPS the route handler entirely
    ↓
Error handler catches it → shows error page
```

### Flow when validation PASSES:
```
User submits form with all fields filled
    ↓
validateListing runs
    ↓
Joi says: all good!
    ↓
next() is called
    ↓
Route handler runs → saves to database → redirects
```

---

## ERROR HANDLING MIDDLEWARE

### Your error handler (last thing in app.js):
```js
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    //    ↑ destructure with default values
    //    If err.statusCode doesn't exist → use 500
    //    If err.message doesn't exist → use "something went wrong"
    
    res.render("listings/error.ejs", { message, statusCode });
});
```

### ⚠️ THE 4-PARAMETER RULE:
```js
// Normal middleware — 3 params
app.use((req, res, next) => { ... });

// Error handling middleware — 4 params (err comes first!)
app.use((err, req, res, next) => { ... });
//        ↑ THIS is what makes Express recognize it as an error handler
```

Express ONLY sends errors to middleware with **exactly 4 parameters**. If you write 3 params, Express won't recognize it as an error handler.

### Your error template (`views/listings/error.ejs`):
```html
<% layout('./layouts/boilerplate') %>
<div class="alert alert-danger" role="alert">
    <h4 class="alert-heading"><%= message %></h4>
    <p><%= statusCode %></p>
</div>
<button class="btn btn-primary" onclick="window.history.back()">Back</button>
```

---

## WRAPASYNC — THE ASYNC ERROR CATCHER

### The Problem:
```js
// Without wrapAsync — errors in async code are NOT caught!
app.get('/listings', async (req, res) => {
    const listing = await Listing.findById("invalid_id");
    // If this fails → UNCAUGHT ERROR → server crashes!
});
```

### The Solution — Your `wrapAsync` (`utils/wrapAsync.js`):
```js
function wrapAsync(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
        // fn() returns a Promise (because it's async)
        // .catch(next) = if Promise rejects, call next(error)
        // next(error) = send error to error handling middleware
    };
}

module.exports = wrapAsync;
```

### How it works:
```js
// This:
app.get('/listings', wrapAsync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render('listings/index.ejs', { listings: alllistings });
}));

// Is equivalent to:
app.get('/listings', async (req, res, next) => {
    try {
        const alllistings = await Listing.find({});
        res.render('listings/index.ejs', { listings: alllistings });
    } catch(error) {
        next(error);  // Send to error handler
    }
});

// wrapAsync saves you from writing try-catch in EVERY route!
```

### Visual flow:
```
wrapAsync wraps your async function
    ↓
If function runs successfully → response sent normally
    ↓
If function throws an error → .catch(next) catches it → error handler runs
```

---

## CUSTOM ERROR CLASS

### Your `expressError` (`utils/expressError.js`):
```js
class expressError extends Error {
    constructor(statusCode, message) {
        super();                    // Call parent (Error) constructor
        this.statusCode = statusCode; // Add custom property
        this.message = message;       // Override default message
    }
}

module.exports = expressError;
```

### Why extend Error?
- JavaScript's built-in `Error` class only has `message`
- You need `statusCode` too (400, 404, 500, etc.)
- By extending `Error`, your custom error works with all error handling tools

### How you use it:
```js
// Throw a 404 error
throw new expressError(404, "page not found");

// Throw a 400 error (bad request — validation failed)
throw new expressError(400, "title is required, price must be positive");

// Throw a 500 error (server error)
throw new expressError(500, "database connection failed");
```

### Common status codes:
| Code | Meaning | When to use |
|------|---------|-------------|
| 200 | OK | Everything worked (default) |
| 201 | Created | New resource created successfully |
| 400 | Bad Request | Invalid data (validation error) |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Logged in but not allowed |
| 404 | Not Found | Page/resource doesn't exist |
| 500 | Internal Server Error | Something broke on the server |

---

## THE COMPLETE ERROR HANDLING FLOW

### Putting it all together — what happens when something goes wrong:

### Scenario 1: User visits a non-existing route
```
User visits /random-page
    ↓
Express checks ALL routes — no match found
    ↓
Falls through to catch-all route:
    app.all(/(.*)/, (req, res, next) => {
        next(new expressError(404, "page not found"));
    });
    ↓
next(error) sends it to error handler:
    app.use((err, req, res, next) => {
        let { statusCode = 500, message = "..." } = err;
        // statusCode = 404, message = "page not found"
        res.render("listings/error.ejs", { message, statusCode });
    });
    ↓
User sees: error.ejs with "page not found" and status 404
```

### Scenario 2: Database operation fails (e.g., invalid ID)
```
User visits /listings/invalid-id-here
    ↓
Route handler (inside wrapAsync):
    const listing = await Listing.findById("invalid-id-here");
    // MongoDB throws CastError!
    ↓
wrapAsync catches it:
    fn(req, res, next).catch(next);
    // .catch(next) → calls next(error)
    ↓
Error handler:
    app.use((err, req, res, next) => {
        // statusCode = 500 (default), message = CastError details
        res.render("listings/error.ejs", { message, statusCode });
    });
```

### Scenario 3: Validation fails (Joi)
```
User submits form without filling title
    ↓
validateListing middleware runs:
    let { error } = listingSchema.validate(req.body);
    // error exists! title is required
    throw new expressError(400, '"title" is required');
    ↓
wrapAsync catches the thrown error:
    .catch(next) → next(error)
    ↓
Error handler:
    // statusCode = 400, message = '"title" is required'
    res.render("listings/error.ejs", { message, statusCode });
```

### The complete middleware chain in your app:
```
Request → urlencoded → methodOverride → static → [validateListing] → Route Handler
                                                                          ↓
                                                    If error anywhere → Error Handler → error.ejs
```

---

## MIDDLEWARE YOU'LL ADD NEXT

### 1. `isLoggedIn` — Check if user is logged in
```js
// Future middleware:
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // req.isAuthenticated() comes from passport.js
        return res.redirect('/login');
    }
    next();
};

// Usage:
app.post('/listings', isLoggedIn, validateListing, wrapAsync(async (req, res) => { ... }));
```

### 2. `isOwner` — Check if user owns the listing
```js
// Future middleware:
const isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing.owner.equals(req.user._id)) {
        return res.redirect(`/listings/${id}`);
    }
    next();
};
```

### 3. `express-session` — Session management
```js
// Future:
const session = require('express-session');
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));
```

### 4. `connect-flash` — Flash messages
```js
// Future:
const flash = require('connect-flash');
app.use(flash());

// In routes:
req.flash('success', 'Listing created successfully!');

// In templates:
<%= messages.success %>
```

---

## 🧠 MIDDLEWARE CHEATSHEET

### Order of middleware in your app.js:
```
1. app.engine('ejs', ejsMate)                    ← Template engine
2. app.use(express.urlencoded({extended: true}))  ← Parse form data
3. app.use(methodOverride('_method'))             ← PUT/DELETE support
4. app.use(express.static('public'))              ← Serve CSS/JS/images
5. app.set('view engine', 'ejs')                  ← View engine
6. app.set('views', path)                         ← Views directory

ROUTES:
7. app.get/post/put/delete (with validateListing, wrapAsync)

CATCH-ALL & ERROR:
8. app.all(/(.*)/) → 404 handler                  ← Catch unknown routes
9. app.use((err, req, res, next)) → Error handler ← Handle all errors
```

### Common mistakes:
| Mistake | Fix |
|---------|-----|
| Forgot `next()` in middleware | Request hangs (infinite loading). Always call `next()` |
| Error handler has 3 params | Must have exactly 4 params: `(err, req, res, next)` |
| Error handler is above routes | Must be at the BOTTOM of app.js |
| `app.use(express.urlencoded())` missing | `req.body` is `undefined` |
| Not using `wrapAsync` | Async errors crash the server instead of showing error page |

---

> 📝 **This file will be updated when you add auth middleware, sessions, flash, etc.!**

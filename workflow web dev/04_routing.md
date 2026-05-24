# 🛣️ EXPRESS ROUTING - Complete Guide
> Everything about Express routes — RESTful design, params, query, static files
> All examples from YOUR Wanderlust project

---

## 📋 TABLE OF CONTENTS
1. [What is a Route?](#what-is-a-route)
2. [HTTP Methods](#http-methods)
3. [RESTful Routes Pattern](#restful-routes-pattern)
4. [Route Parameters (:id)](#route-parameters-id)
5. [Request Object (req)](#request-object-req)
6. [Response Object (res)](#response-object-res)
7. [Route Order Matters!](#route-order-matters)
8. [Serving Static Files](#serving-static-files)
9. [Express Router (Coming Next)](#express-router-coming-next)

---

## WHAT IS A ROUTE?

A route is a **path** (URL) + **HTTP method** combination that tells Express what to do when someone visits that URL.

```js
// When someone visits localhost:3000/ with a GET request → run this function
app.get('/', (req, res) => {
    res.send("working fine");
});
```

### Breaking it down:
```js
app.get('/listings', handler)
│    │      │         │
│    │      │         └── Function that runs (request handler)
│    │      └── URL path (what appears in browser address bar)
│    └── HTTP method (GET, POST, PUT, DELETE)
└── Express app instance
```

---

## HTTP METHODS

| Method | Purpose | HTML Form Support | Example |
|--------|---------|-------------------|---------|
| `GET` | Read/retrieve data | ✅ Yes | Viewing a page, getting listings |
| `POST` | Create new data | ✅ Yes | Submitting a form to create listing |
| `PUT` | Update/replace existing data | ❌ No (need method-override) | Editing a listing |
| `PATCH` | Partially update data | ❌ No | Updating just the price |
| `DELETE` | Remove data | ❌ No (need method-override) | Deleting a listing |

### In your project:
```js
app.get(...)     // Used for viewing pages
app.post(...)    // Used for creating new listings
app.put(...)     // Used for updating listings (via method-override)
app.delete(...)  // Used for deleting listings (via method-override)
```

---

## RESTFUL ROUTES PATTERN

### What is REST?
- REST = **RE**presentational **S**tate **T**ransfer
- A convention for structuring your URLs and HTTP methods
- Makes your API predictable and organized

### The 7 RESTful Routes (your project follows this):

| # | Name | Method | Path | Purpose | Your Code |
|---|------|--------|------|---------|-----------|
| 1 | INDEX | GET | `/listings` | Show all listings | ✅ Done |
| 2 | NEW | GET | `/listings/new` | Show create form | ✅ Done |
| 3 | CREATE | POST | `/listings` | Save new listing | ✅ Done |
| 4 | SHOW | GET | `/listings/:id` | Show one listing | ✅ Done |
| 5 | EDIT | GET | `/listings/:id/edit` | Show edit form | ✅ Done |
| 6 | UPDATE | PUT | `/listings/:id` | Update listing | ✅ Done |
| 7 | DELETE | DELETE | `/listings/:id` | Delete listing | ✅ Done |

### Complete routes in your app.js:
```js
// 1. INDEX — Show all
app.get('/listings', wrapAsync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render('listings/index.ejs', { listings: alllistings });
}));

// 2. NEW — Show create form (MUST be before :id routes!)
app.get('/listings/new', (req, res) => {
    res.render('listings/new.ejs');
});

// 3. CREATE — Save new
app.post('/listings', validateListing, wrapAsync(async (req, res, next) => {
    let { title, description, price, city, country } = req.body;
    const newListing = new Listing({ title, description, price, location: city, country });
    await newListing.save();
    res.redirect('/listings');
}));

// 4. EDIT — Show edit form
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', { listing });
}));

// 5. UPDATE — Save changes
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    let { title, description, price, city, country } = req.body;
    await Listing.findByIdAndUpdate(id, { title, description, price, location: city, country });
    res.redirect(`/listings/${id}`);
}));

// 6. DELETE
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

// 7. SHOW — Show one (MUST be LAST among :id routes!)
app.get('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/show.ejs', { listing });
}));
```

---

## ROUTE PARAMETERS (:id)

### What are params?
- Dynamic parts of the URL
- Marked with `:` in the route definition
- Accessed via `req.params`

```js
// Route definition
app.get('/listings/:id', (req, res) => {
    console.log(req.params);
    // If URL is /listings/abc123
    // req.params = { id: 'abc123' }
});
```

### Destructuring params (YOUR WAY — cleaner):
```js
app.get('/listings/:id', (req, res) => {
    const { id } = req.params;  // Same as: const id = req.params.id
    // Now use 'id' directly
});
```

### Multiple params:
```js
// Not in your project yet, but possible:
app.get('/listings/:id/reviews/:reviewId', (req, res) => {
    const { id, reviewId } = req.params;
    // id = listing ID
    // reviewId = review ID
});
```

---

## REQUEST OBJECT (req)

### Where data comes from:

#### `req.body` — Data from form submissions (POST/PUT)
```js
// When form is submitted with: name="title", name="price"
app.post('/listings', (req, res) => {
    console.log(req.body);
    // { title: "Beautiful Villa", price: "2000", city: "Bali", ... }
    
    let { title, description, price, city, country } = req.body;
});
```
**⚠️ Requires:** `app.use(express.urlencoded({ extended: true }))` in app.js

#### `req.params` — Data from URL path (`:id`)
```js
// URL: /listings/abc123
app.get('/listings/:id', (req, res) => {
    console.log(req.params);
    // { id: 'abc123' }
});
```

#### `req.query` — Data from URL query string (`?key=value`)
```js
// URL: /listings?search=beach&sort=price
app.get('/listings', (req, res) => {
    console.log(req.query);
    // { search: 'beach', sort: 'price' }
});
```
> You're not using this yet, but will need it for search/filter features.

### Quick comparison:
| Source | How data gets there | Example URL | Access |
|--------|-------------------|-------------|--------|
| `req.body` | Form submission | N/A (POST data) | `req.body.title` |
| `req.params` | URL path | `/listings/abc123` | `req.params.id` |
| `req.query` | URL query string | `/listings?search=beach` | `req.query.search` |

---

## RESPONSE OBJECT (res)

### Methods you use:

#### `res.render()` — Show a template (YOUR MAIN METHOD)
```js
res.render('listings/index.ejs', { listings: alllistings });
//          ↑ template path        ↑ data to pass
```

#### `res.redirect()` — Send to different URL
```js
res.redirect('/listings');        // After creating/deleting
res.redirect(`/listings/${id}`);  // After updating (go to show page)
```

#### `res.send()` — Send plain text or HTML
```js
res.send("working fine");  // Your root route
res.send("<h1>Hello</h1>");
```

#### Other methods (not used by you yet):
```js
res.json({ key: "value" });  // Send JSON (for APIs)
res.status(404).send("Not found");  // Set status code
res.download('/path/to/file');  // Download a file
```

---

## ROUTE ORDER MATTERS!

### ⚠️ THE MOST IMPORTANT RULE:

```js
// ❌ WRONG ORDER — /listings/new will NEVER work!
app.get('/listings/:id', handler);   // This catches /listings/ANYTHING
app.get('/listings/new', handler);   // Never reached! 'new' is treated as :id

// ✅ CORRECT ORDER
app.get('/listings/new', handler);   // Specific route FIRST
app.get('/listings/:id', handler);   // Dynamic route LAST
```

### Your correct order:
```
1. GET  /listings           ← No :id, safe anywhere
2. GET  /listings/new       ← MUST be before :id routes!
3. POST /listings           ← Different method (POST), no conflict
4. GET  /listings/:id/edit  ← More specific path, safe before :id
5. PUT  /listings/:id       ← Different method (PUT), no conflict
6. DELETE /listings/:id     ← Different method (DELETE), no conflict
7. GET  /listings/:id       ← MUST BE LAST (catches everything)
```

### Why does this happen?
```
Express checks routes top-to-bottom.
When you visit /listings/new:
  - Express sees /listings/:id → "new" matches :id → STOPS HERE
  - It never reaches /listings/new

Fix: Put specific routes (like /new) ABOVE dynamic routes (like /:id)
```

### The 404 catch-all route (YOUR CODE):
```js
// This catches ALL remaining routes that don't match anything above
app.all(/(.*)/, (req, res, next) => {
    next(new expressError(404, "page not found"));
});
// app.all = matches any HTTP method
// /(.*)/  = matches any path
// MUST be at the very bottom (before error handler)
```

---

## SERVING STATIC FILES

### What are static files?
- Files that don't change: CSS, JavaScript, images
- Served directly to the browser without processing

### Your setup:
```js
app.use(express.static(path.join(__dirname, 'public')));
```

### What this does:
```
public/
├── css/
│   ├── style.css          → accessible at: /css/style.css
│   ├── animations.css     → accessible at: /css/animations.css
│   └── listings-index.css → accessible at: /css/listings-index.css
└── js/
    └── script.js          → accessible at: /js/script.js
```

### Using in templates:
```html
<!-- In boilerplate.ejs -->
<link rel="stylesheet" href="/css/style.css">
<script src="/js/script.js"></script>
<!-- The '/' refers to the 'public' folder -->
```

---

## EXPRESS ROUTER — CODE ORGANIZATION

### The Problem:
- All your routes are in `app.js` — it's getting long!
- As you add reviews, auth, etc. it'll become 500+ lines
- Hard to find, read, and maintain

### The Solution — Express Router:
- Split routes into **separate files** by feature
- Each file handles one resource (listings, reviews, users)
- `app.js` becomes clean and short

### New folder structure:
```
project_1/
├── app.js              ← Clean, short — just setup and imports
└── routes/
    ├── listing.js      ← All /listings routes
    └── review.js       ← All /listings/:id/reviews routes
```

### Step 1: Create `routes/listing.js`
```js
const express = require('express');
const router = express.Router();          // Create a mini-app / sub-router

// Import what the routes need
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const { listingSchema } = require('../schema.js');

// Validation middleware (moved here from app.js)
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    } else {
        next();
    }
};

// ROUTES — use router.get instead of app.get
// Notice: paths are now relative to /listings (no need to write /listings)
router.get('/', wrapAsync(async (req, res) => {          // GET /listings
    const alllistings = await Listing.find({});
    res.render('listings/index.ejs', { listings: alllistings });
}));

router.get('/new', (req, res) => {                       // GET /listings/new
    res.render('listings/new.ejs');
});

router.post('/', validateListing, wrapAsync(async (req, res) => { // POST /listings
    let { title, description, price, city, country } = req.body;
    const newListing = new Listing({ title, description, price, location: city, country });
    await newListing.save();
    res.redirect('/listings');
}));

router.get('/:id/edit', wrapAsync(async (req, res) => {  // GET /listings/:id/edit
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', { listing });
}));

router.put('/:id', validateListing, wrapAsync(async (req, res) => { // PUT /listings/:id
    const { id } = req.params;
    let { title, description, price, city, country } = req.body;
    await Listing.findByIdAndUpdate(id, { title, description, price, location: city, country });
    res.redirect(`/listings/${id}`);
}));

router.delete('/:id', wrapAsync(async (req, res) => {    // DELETE /listings/:id
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

router.get('/:id', wrapAsync(async (req, res) => {       // GET /listings/:id
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    res.render('listings/show.ejs', { listing });
}));

module.exports = router;  // Export the router
```

### Step 2: Create `routes/review.js`
```js
const express = require('express');
const router = express.Router({ mergeParams: true });
//                              ↑ IMPORTANT!
// mergeParams: true = allow this router to access :id from the parent router
// Without it, req.params.id would be undefined in review routes!

const Listing = require('../models/listing');
const Review = require('../models/review');
const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const { reviewSchema } = require('../schema.js');

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    } else {
        next();
    }
};

// POST /listings/:id/reviews
// (In this file, just write '/' because the prefix /listings/:id/reviews is set in app.js)
router.post('/', validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    //                                          ↑ Works because of mergeParams: true!
    const review = new Review({
        rating: req.body.rating,
        comment: req.body.comment,
    });
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

module.exports = router;
```

### Step 3: Update `app.js` to use the routers
```js
// app.js — import the routers
const listingRouter = require('./routes/listing');
const reviewRouter = require('./routes/review');

// ... all middleware setup stays the same ...

// Mount the routers (instead of individual app.get/post/put/delete calls)
app.use('/listings', listingRouter);
//      ↑ All routes in listing.js are now prefixed with /listings

app.use('/listings/:id/reviews', reviewRouter);
//      ↑ All routes in review.js are prefixed with /listings/:id/reviews

// 404 and error handler stay at the bottom of app.js
```

### Why `mergeParams: true` matters:
```
Without mergeParams:
  Parent route: /listings/:id/reviews
  Inside review.js router: req.params = {}  ← EMPTY! Can't find :id!

With mergeParams: true:
  Parent route: /listings/:id/reviews
  Inside review.js router: req.params = { id: 'abc123' }  ← Works!
```

### How app.js looks AFTER using Router:
```js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressError = require('./utils/expressError');

// Import routers
const listingRouter = require('./routes/listing');
const reviewRouter = require('./routes/review');

// Middleware setup
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));

// Database connection
main().then(() => console.log('database up')).catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.listen(3000, () => console.log('server running'));

// Routes — clean! Only 2 lines instead of 50+
app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);

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

> 📝 You'll implement Express Router in the next phase!

---

## 🧠 QUICK REFERENCE

### Express Methods Cheatsheet:
```js
app.get(path, handler)      // Handle GET requests
app.post(path, handler)     // Handle POST requests
app.put(path, handler)      // Handle PUT requests
app.delete(path, handler)   // Handle DELETE requests
app.all(path, handler)      // Handle ALL methods
app.use(middleware)          // Use middleware for ALL routes
app.use(path, middleware)    // Use middleware for specific path
```

### Destructuring Patterns (you use these):
```js
const { id } = req.params;                              // Get :id from URL
const { title, description, price } = req.body;         // Get form data
const { error } = listingSchema.validate(req.body);      // Get Joi validation result
let { statusCode = 500, message = "error" } = err;       // Destructure with defaults
```

---

> 📝 **This file will be updated when you add Express Router, auth routes, etc.!**

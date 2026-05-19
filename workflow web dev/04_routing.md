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

## EXPRESS ROUTER (COMING NEXT)

### The Problem:
- All your routes are in `app.js` — it's getting long!
- As you add reviews, auth, etc. it'll become 500+ lines

### The Solution — Express Router:
- Split routes into separate files
- Group related routes together

### How it will look (future structure):
```
routes/
├── listing.js    ← All /listings routes
├── review.js     ← All /listings/:id/reviews routes (future)
└── user.js       ← All /signup, /login routes (future)
```

### Preview of how Express Router works:
```js
// routes/listing.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => { ... });        // /listings
router.get('/new', (req, res) => { ... });            // /listings/new
router.post('/', async (req, res) => { ... });        // POST /listings
router.get('/:id', async (req, res) => { ... });      // /listings/:id

module.exports = router;

// app.js
const listingRouter = require('./routes/listing');
app.use('/listings', listingRouter);  // All routes in listing.js start with /listings
```

> 📝 You'll implement this when the project grows bigger!

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

# 📚 COMPLETE CODE REFERENCE
> Every important code snippet from YOUR project in one place
> Copy-paste ready — organized by file

---

## 📋 TABLE OF CONTENTS
1. [app.js — Main Server File](#appjs--main-server-file-clean-version-with-routers)
2. [route/listing.js — Listing Routes](#routelistingjs--listing-routes)
3. [route/review.js — Review Routes](#routereviewjs--review-routes)
4. [models/listing.js — Mongoose Model](#modelslistingjs--mongoose-model)
5. [models/review.js — Review Model](#modelsreviewjs--review-model)
6. [schema.js — Joi Validation](#schemajs--joi-validation)
7. [utils/expressError.js — Custom Error](#utilsexpresserrorjs--custom-error)
8. [utils/wrapAsync.js — Async Wrapper](#utilswrapasyncjs--async-wrapper)
9. [init/init.js — Database Seeder](#initinitjs--database-seeder)
10. [views/layouts/boilerplate.ejs](#viewslayoutsboilerplateejs)
11. [views/includes/navbar.ejs](#viewsincludesnavbarejs)
12. [views/includes/flash.ejs](#viewsincludesflashejs)
13. [views/includes/footer.ejs](#viewsincludesfooterejs)
14. [views/listings/ — All Templates](#viewslistings--all-templates)
15. [public/js/script.js — Client Validation](#publicjsscriptjs--client-validation)

---

## APP.JS — MAIN SERVER FILE (CLEAN VERSION WITH ROUTERS)

```js
// ============================================================
//                     REQUIRE PACKAGES
// ============================================================
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressError = require('./utils/expressError');

// ← Sessions & Flash packages
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

// ← Require router files (routes moved out of app.js)
const listings = require('./route/listing.js');
const reviews = require('./route/review.js');

// ============================================================
//                    MIDDLEWARE SETUP
// ============================================================
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ← SESSIONS & FLASH SETUP
const sessionOptions = {
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24,  // 24 hours
        maxAge: 1000 * 60 * 60 * 24,                 // 24 hours  
        httpOnly: true                               // Secure: no client-side JS access
    }
};

app.use(session(sessionOptions));
app.use(flash());

// ← Make flash messages available in all templates (as res.locals)
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ============================================================
//                   VIEW ENGINE SETUP
// ============================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));

// ============================================================
//                   DATABASE CONNECTION
// ============================================================
main()
    .then(() => {
        console.log("database are up");
    }).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

// ============================================================
//                      START SERVER
// ============================================================
app.listen(3000, () => {
    console.log('server is up and running');
});

// ============================================================
//                      MOUNT ROUTERS
// ============================================================
// All listing routes (INDEX, NEW, CREATE, EDIT, UPDATE, DELETE, SHOW)
app.use('/listings', listings);

// All review routes (CREATE, DELETE) 
app.use('/listings/:id/reviews', reviews);

// ============================================================
//                        ROOT ROUTE
// ============================================================
app.get('/', (req, res) => {
    res.send('working fine');
});

// ============================================================
//                   404 CATCH-ALL ROUTE
// ============================================================
app.all(/(.*)/, (req, res, next) => {
    next(new expressError(404, "page not found"));
});

// ============================================================
//                  ERROR HANDLING MIDDLEWARE
// ============================================================
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    res.render("listings/error.ejs", { message, statusCode });
});
```

---

## ROUTE/LISTING.JS — LISTING ROUTES

```js
const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listing');

// ============================================================
//                   VALIDATION MIDDLEWARE
// ============================================================
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    } else {
        next();
    }
}

// ============================================================
//                    LISTING ROUTES
// ============================================================

// 1. INDEX — Show all listings
router.get('/', wrapAsync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render('listings/index.ejs', { listings: alllistings });
}));

// 2. NEW — Show create form (MUST be before :id routes!)
router.get('/new', (req, res) => {
    res.render('listings/new.ejs');
});

// 3. CREATE — Save new listing
router.post('/', validateListing, wrapAsync(async (req, res, next) => {
    let { title, description, price, city, country } = req.body;
    const newListing = new Listing({
        title: title,
        description: description,
        price: price,
        location: city,
        country: country,
    });
    await newListing.save();
    req.flash('success', 'Listing created successfully!');  // ← Flash message
    res.redirect('/listings');
}));

// 4. EDIT — Show edit form
router.get('/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', { listing });
}));

// 5. UPDATE — Save changes
router.put('/:id', validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    let { title, description, price, city, country } = req.body;
    await Listing.findByIdAndUpdate(id, {
        title: title,
        description: description,
        price: price,
        location: city,
        country: country,
    });
    req.flash('success', 'Listing updated successfully!');  // ← Flash message
    res.redirect(`/listings/${id}`);
}));

// 6. DELETE — Delete listing (cascade delete reviews via post middleware)
router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');  // ← Flash message
    res.redirect('/listings');
}));

// 7. SHOW — Show single listing (MUST be at the end!)
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    res.render('listings/show.ejs', { listing });
}));

module.exports = router;
```

---

## ROUTE/REVIEW.JS — REVIEW ROUTES

```js
const express = require('express');
const router = express.Router({ mergeParams: true });  // ← mergeParams to access parent :id
const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const { reviewSchema } = require('../schema.js');
const Listing = require('../models/listing');
const Review = require('../models/review.js');

// ============================================================
//                   VALIDATION MIDDLEWARE
// ============================================================
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    } else {
        next();
    }
};

// ============================================================
//                    REVIEW ROUTES
// ============================================================

// CREATE REVIEW
router.post('/:id/reviews', validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    const { rating, comment } = req.body.review;
    const review = new Review({
        rating,
        comment,
    });
    listing.reviews.push(review);  // Add review ID to listing's reviews array
    await review.save();
    await listing.save();
    req.flash('success', 'Review created successfully!');
    res.redirect(`/listings/${listing._id}`);
}));

// DELETE REVIEW  
router.delete('/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });  // Remove from array
    await Review.findByIdAndDelete(reviewId);  // Delete the review document
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
```

---


## MODELS/LISTING.JS — MONGOOSE MODEL

```js
const mongoose = require('mongoose');
const Review = require('./review.js');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://unsplash.com/photos/default-image",
        }
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
    },
    country: String,
    reviews: [                           // ← Array of references to Review documents
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',               // ← Which model to look up when using populate()
        }
    ]
});

// ← MONGOOSE MIDDLEWARE: Cascade delete reviews when a listing is deleted
// This runs AFTER a listing is deleted using findOneAndDelete()
listingSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        // Delete all reviews whose _id is in the doc.reviews array
        await Review.deleteMany({
            _id: {
                $in: doc.reviews,  // $in: delete all reviews in this array
            }
        });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
```

**Why the post middleware?**
- When you delete a listing, its reviews are still in the database (orphaned)
- This middleware automatically cleans them up
- `$in` operator: "match all documents whose _id is IN this array"
- `doc.reviews` is the array of review IDs stored in the listing

---

## MODELS/REVIEW.JS — REVIEW MODEL

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now    // Automatically set to current date/time when created
    }
});

module.exports = mongoose.model('Review', reviewSchema);
// Creates a 'reviews' collection in MongoDB
```

---

## SCHEMA.JS — JOI VALIDATION

> ⚠️ **IMPORTANT BUG IN YOUR CURRENT schema.js:** `listingSchema` is exported TWICE—the second export overwrites the first. The fix is to use a DIFFERENT name for the second export: `reviewSchema`.

```js
const Joi = require('joi');

// Schema for validating listing form data
module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    city: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow("", null)
});

// Schema for validating review form data
// NOTE: This must be 'reviewSchema', NOT 'listingSchema' — otherwise it overwrites the one above!
module.exports.reviewSchema = Joi.object({
    review: Joi.object({         // 'review' = wrapper key from the form (name="review[rating]")
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
});
```

---

## UTILS/EXPRESSERROR.JS — CUSTOM ERROR

```js
class expressError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = expressError;
```

---

## UTILS/WRAPASYNC.JS — ASYNC WRAPPER

```js
function wrapAsync(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}

module.exports = wrapAsync;
```

> ⚠️ Note: There's a typo in your actual file — `fb` should be `fn`.
> Your file has: `fb(req, res, next).catch(next);`
> It should be: `fn(req, res, next).catch(next);`

---

## INIT/INIT.JS — DATABASE SEEDER

```js
const mongoose = require('mongoose');
const sampleData = require('./data.js');
const listing = require('../models/listing.js');

main()
    .then(() => {
        console.log("database are up");
    }).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initdb = async () => {
    await listing.deleteMany({});
    await listing.insertMany(sampleData.data);
    console.log("database has been initialized with sample data");
}

initdb()
    .then(() => {
        console.log("success in db");
    }).catch(err => console.log(err));
```

---

## VIEWS/LAYOUTS/BOILERPLATE.EJS

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wanderlust</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/animations.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
</head>
<body style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); min-height: 100vh;">
    <%- include("../includes/navbar.ejs") %>
    
    <!-- ← Flash messages for success/error alerts -->
    <%- include("../includes/flash.ejs") %>
    
    <div class="container-fluid" style="padding: 0; margin: 0;">
        <%- body %>
    </div>
    <%- include("../includes/footer.ejs") %>
    <div class="wave-container">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/js/script.js"></script>
</body>
</html>
```

---

## VIEWS/INCLUDES/NAVBAR.EJS

```html
<nav class="navbar navbar-expand-md navbar-dark sticky-top" 
     style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(10px); 
            border-bottom: 1px solid rgba(255, 255, 255, 0.2); 
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);">
    <a class="navbar-brand" href="/" style="color: #FFFFFF; font-weight: bold;">
        <i class="fa-brands fa-accusoft"></i> WANDERLUST
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" 
            data-target="#navbarNavAltMarkup">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav" style="margin-left: auto;">
            <a class="nav-item nav-link" href="/">Home</a>
            <a class="nav-item nav-link" href="/listings">All Listings</a>
            <a class="nav-item nav-link" href="/listings/new">Create Listing</a>
        </div>
    </div>
</nav>
```

---

## VIEWS/INCLUDES/FLASH.EJS

```html
<!-- Flash messages for success (green) and error (red) alerts -->
<!-- These messages come from res.locals.success and res.locals.error (set in app.js middleware) -->
<!-- Flash messages are one-time only — they disappear after the next request -->

<% if(res.locals.success) { %>
    <div class="alert alert-success alert-dismissible fade show col-6 offset-3" role="alert">
        <%= res.locals.success %>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
<% } %>

<% if(res.locals.error) { %>
    <div class="alert alert-danger alert-dismissible fade show col-6 offset-3" role="alert">
        <%= res.locals.error %>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
<% } %>
```

**How flash messages work:**
1. In your routes, after an action: `req.flash('success', 'Listing created!')`
2. The message is stored in `req.session`
3. Express middleware (in app.js) exposes it as `res.locals.success`
4. This template displays it in a Bootstrap alert
5. After the page renders, the message is deleted (one-time use)

---

## VIEWS/INCLUDES/FOOTER.EJS

```html
<footer style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); 
               border-top: 1px solid rgba(255, 255, 255, 0.2); margin-top: 3rem;">
    <div class="f-info" style="padding: 2rem; text-align: center;">
        <div class="f-info-socials" style="margin-bottom: 1.5rem;">
            <i class="fa-brands fa-fort-awesome" style="color: rgba(255, 255, 255, 0.8);"></i>
            <i class="fa-brands fa-fedora" style="color: rgba(255, 255, 255, 0.8);"></i>
            <i class="fa-brands fa-galactic-republic" style="color: rgba(255, 255, 255, 0.8);"></i>
        </div>
        <div class="f-info-brand" style="color: #FFFFFF; font-weight: bold;">
            WANDERLUST PRIVATE LIMITED
        </div>
        <div class="f-info-links" style="display: flex; justify-content: center; gap: 2rem;">
            <a href="#" style="color: rgba(255, 255, 255, 0.7);">Contact Us</a>
            <a href="/terms" style="color: rgba(255, 255, 255, 0.7);">Terms and Conditions</a>
            <a href="/privacy" style="color: rgba(255, 255, 255, 0.7);">Privacy Policy</a>
        </div>
    </div>
</footer>
```

---

## VIEWS/LISTINGS — ALL TEMPLATES

### index.ejs (All listings page):
```html
<%- layout('layouts/boilerplate') %>
<link rel="stylesheet" href="/css/listings-index.css">

<div class="listings-container">
    <h1 class="listings-title">All Listings</h1>
    <% if(listings.length > 0) { %>
        <div class="listings-grid">
            <% for(let listing of listings){ %>
                <div class="listing-card">
                    <img class="card-image" src="<%= listing.image.url %>" alt="<%= listing.title %>">
                    <div class="card-overlay">
                        <div class="overlay-location">
                            <i class="fas fa-map-marker-alt"></i> <%= listing.location %>
                        </div>
                        <div class="overlay-country"><%= listing.country %></div>
                        <div class="overlay-price">₹<%= listing.price %>/night</div>
                    </div>
                    <div class="card-content">
                        <h5 class="card-title"><%= listing.title %></h5>
                        <p class="card-description"><%= listing.description %></p>
                        <div class="card-info">
                            <div class="info-row">
                                <span class="info-label">Price:</span>
                                <span class="info-value">₹<%= listing.price %></span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Location:</span>
                                <span class="info-value"><%= listing.location %>, <%= listing.country %></span>
                            </div>
                        </div>
                        <a href="/listings/<%= listing._id %>" class="card-button">View Listing</a>
                    </div>
                </div>
            <% } %>
        </div>
    <% } else { %>
        <p>No listings available.</p>
    <% } %>
</div>
```

### show.ejs (Single listing detail):
```html
<%- layout('layouts/boilerplate') %>
<link rel="stylesheet" href="/css/listings-show.css">

<div class="listing-image-hero" style="background-image: url('<%= listing.image.url %>');">
    <div class="listing-image-overlay"></div>
</div>

<div class="listing-container">
    <div class="listing-hero">
        <h1 class="listing-title"><%= listing.title %></h1>
        <div class="listing-location">📍 <%= listing.location %>, <%= listing.country %></div>
        <div class="listing-price">
            <div class="price-label">Price per night</div>
            <div class="price-value">₹<%= listing.price.toLocaleString('en-IN') %></div>
        </div>
    </div>

    <div class="listing-description">
        <div class="description-label">About this listing</div>
        <div class="description-text"><%= listing.description %></div>
    </div>

    <div class="listing-details">
        <div class="detail-card">
            <div class="detail-label">📍 Location</div>
            <div class="detail-value"><%= listing.location %></div>
        </div>
        <div class="detail-card">
            <div class="detail-label">🌍 Country</div>
            <div class="detail-value"><%= listing.country %></div>
        </div>
    </div>

    <div class="action-buttons">
        <a href="/listings/<%= listing._id %>/edit" class="btn-action btn-edit">✏️ Edit Listing</a>
        <form action="/listings/<%= listing._id %>?_method=DELETE" method="POST">
            <button type="submit" class="btn-action btn-delete">🗑️ Delete Listing</button>
        </form>
    </div>
</div>
```

### new.ejs (Create form):
```html
<%- layout('layouts/boilerplate') %>
<link rel="stylesheet" href="/css/listings-new.css">

<div class="form-container">
    <h1 class="form-title">Create New Listing</h1>
    <form method="POST" action="/listings" novalidate class="needs-validation">
        <div class="form-group">
            <label for="title" class="form-label">Title</label>
            <input type="text" id="title" name="title" class="form-input" required>
            <div class="valid-feedback">looks good!</div>
            <div class="invalid-feedback">Please fill out this field.</div>
        </div>
        <div class="form-group">
            <label for="description" class="form-label">Description</label>
            <textarea id="description" name="description" class="form-textarea" required></textarea>
        </div>
        <div class="form-group">
            <label for="price" class="form-label">Price (per night)</label>
            <input type="number" id="price" name="price" class="form-input" step="0.01" required>
            <div class="valid-feedback">looks good!</div>
            <div class="invalid-feedback">Please fill out this field.</div>
        </div>
        <div class="form-group">
            <label for="city" class="form-label">Location</label>
            <input type="text" id="city" name="city" class="form-input" required>
        </div>
        <div class="form-group">
            <label for="country" class="form-label">Country</label>
            <input type="text" id="country" name="country" class="form-input" required>
            <div class="valid-feedback">please enter a valid country name</div>
            <div class="invalid-feedback">Please fill out this field.</div>
        </div>
        <button type="submit" class="form-button">Create Listing</button>
    </form>
</div>
```

### edit.ejs (Edit form):
```html
<%- layout('layouts/boilerplate') %>
<link rel="stylesheet" href="/css/listings-edit.css">

<div class="form-container">
    <h1 class="form-title">Edit Listing</h1>
    <form action="/listings/<%= listing._id %>?_method=PUT" method="POST">
        <div class="form-group">
            <label for="title" class="form-label">Title</label>
            <input type="text" id="title" name="title" class="form-input" value="<%= listing.title %>" required>
        </div>
        <div class="form-group">
            <label for="description" class="form-label">Description</label>
            <textarea id="description" name="description" class="form-textarea" required><%= listing.description %></textarea>
        </div>
        <div class="form-group">
            <label for="price" class="form-label">Price (per night)</label>
            <input type="number" id="price" name="price" class="form-input" value="<%= listing.price %>" required>
        </div>
        <div class="form-group">
            <label for="city" class="form-label">Location</label>
            <input type="text" id="city" name="city" class="form-input" value="<%= listing.location %>" required>
        </div>
        <div class="form-group">
            <label for="country" class="form-label">Country</label>
            <input type="text" id="country" name="country" class="form-input" value="<%= listing.country %>" required>
        </div>
        <div class="button-group">
            <button type="submit" class="form-button">Update Listing</button>
            <a href="/listings/<%= listing._id %>" class="form-button btn-cancel">Cancel</a>
        </div>
    </form>
</div>
```

### error.ejs (Error page):
```html
<% layout('./layouts/boilerplate') %>
<div class="alert alert-danger" role="alert">
    <h4 class="alert-heading"><%= message %></h4>
    <p><%= statusCode %></p>
</div>
<button class="btn btn-primary" onclick="window.history.back()">Back</button>
```

---

## PUBLIC/JS/SCRIPT.JS — CLIENT VALIDATION

```js
// Bootstrap form validation
(() => {
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
        }, false)
    })
})()
```

---

## 🐛 KNOWN BUG IN YOUR CODE

### In `utils/wrapAsync.js`:
```js
// CURRENT (has typo):
function wrapAsync(fn) {
    return (req, res, next) => {
        fb(req, res, next).catch(next);  // ❌ 'fb' should be 'fn'
    };
}

// FIXED:
function wrapAsync(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);  // ✅ 'fn' — matches the parameter name
    };
}
```

---

> 📝 **This file contains your complete codebase snapshot. Update it as you add features!**

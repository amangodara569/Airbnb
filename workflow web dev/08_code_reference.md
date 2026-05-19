# 📚 COMPLETE CODE REFERENCE
> Every important code snippet from YOUR project in one place
> Copy-paste ready — organized by file

---

## 📋 TABLE OF CONTENTS
1. [app.js — Main Server File](#appjs--main-server-file)
2. [models/listing.js — Mongoose Model](#modelslistingjs--mongoose-model)
3. [schema.js — Joi Validation](#schemajs--joi-validation)
4. [utils/expressError.js — Custom Error](#utilsexpresserrorjs--custom-error)
5. [utils/wrapAsync.js — Async Wrapper](#utilswrapasyncjs--async-wrapper)
6. [init/init.js — Database Seeder](#initinitjs--database-seeder)
7. [views/layouts/boilerplate.ejs](#viewslayoutsboilerplateejs)
8. [views/includes/navbar.ejs](#viewsincludesnavbarejs)
9. [views/includes/footer.ejs](#viewsincludesfooterejs)
10. [views/listings/ — All Templates](#viewslistings--all-templates)
11. [public/js/script.js — Client Validation](#publicjsscriptjs--client-validation)

---

## APP.JS — MAIN SERVER FILE

```js
// ============================================================
//                     REQUIRE PACKAGES
// ============================================================
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const expressError = require('./utils/expressError');
const { listingSchema } = require('./schema.js');

// ============================================================
//                   VALIDATION MIDDLEWARE
// ============================================================
const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    } else {
        next();
    }
}

// ============================================================
//                    MIDDLEWARE SETUP
// ============================================================
app.engine('ejs', ejsMate);
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
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
//                        ROUTES
// ============================================================

// ROOT
app.get('/', (req, res) => {
    res.send("working fine");
});

// INDEX — Show all listings
app.get('/listings', wrapAsync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render('listings/index.ejs', {listings: alllistings});
}));

// NEW — Show create form
app.get('/listings/new', (req, res) => {
    res.render('listings/new.ejs');
});

// CREATE — Save new listing
app.post('/listings', validateListing, wrapAsync(async (req, res, next) => {
    let {title, description, price, city, country} = req.body;
    const newListing = new Listing({
        title: title,
        description: description,
        price: price,
        location: city,
        country: country,
    });
    await newListing.save();
    res.redirect('/listings');
}));

// EDIT — Show edit form
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', {listing});
}));

// UPDATE — Save changes
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
    const {id} = req.params;
    let {title, description, price, city, country} = req.body;
    await Listing.findByIdAndUpdate(id, {
        title: title,
        description: description,
        price: price,
        location: city,
        country: country,
    });
    res.redirect(`/listings/${id}`);
}));

// DELETE
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

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
    let {statusCode = 500, message = "something went wrong"} = err;
    res.render("listings/error.ejs", {message, statusCode});
});

// ============================================================
//              SHOW — Must be at the end!
// ============================================================
app.get('/listings/:id', wrapAsync(async (req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/show.ejs', {listing});
}));
```

---

## MODELS/LISTING.JS — MONGOOSE MODEL

```js
const mongoose = require('mongoose');

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
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
```

---

## SCHEMA.JS — JOI VALIDATION

```js
const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    city: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow("", null)
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

# 🔥 FULL STACK MERN PROJECT WORKFLOW
> Complete step-by-step workflow for building a full-stack project (backend-focused with EJS)
> All examples are from YOUR Wanderlust (Airbnb Clone) project

---

## 📋 TABLE OF CONTENTS
1. [Phase 1 - Project Setup](#phase-1---project-setup)
2. [Phase 2 - Database Setup](#phase-2---database-setup)
3. [Phase 3 - Create Models](#phase-3---create-models)
4. [Phase 4 - Build Routes (CRUD)](#phase-4---build-routes-crud)
5. [Phase 5 - Create Views (EJS Templates)](#phase-5---create-views-ejs-templates)
6. [Phase 6 - Error Handling](#phase-6---error-handling)
7. [Phase 7 - Validation](#phase-7---validation)
8. [Phase 8 - Seed Data (Init)](#phase-8---seed-data-init)
9. [Phase 9 - Reviews Feature](#phase-9---reviews-feature-completed)
10. [Phase 10 - Delete Reviews](#phase-10---delete-reviews-completed)
11. [Phase 11 - Express Router](#phase-11---express-router-completed)
12. [What Comes Next (Not done yet)](#whats-next---future-phases)

---

## PHASE 1 - PROJECT SETUP

### Step 1: Create project folder and initialize
```bash
mkdir project_1
cd project_1
npm init -y           # creates package.json
```

### Step 2: Install required packages
```bash
npm install express mongoose ejs ejs-mate method-override joi
```

**What each package does:**
| Package | Purpose | Where you use it |
|---------|---------|-----------------|
| `express` | Web framework - handles routes, requests, responses | `app.js` (entire server) |
| `mongoose` | Talks to MongoDB - create models, query data | `models/listing.js`, `app.js` |
| `ejs` | Template engine - write HTML with JavaScript | `views/` folder |
| `ejs-mate` | Layout support for EJS - create boilerplate template | `views/layouts/boilerplate.ejs` |
| `method-override` | Allows PUT & DELETE from HTML forms (forms only support GET/POST) | `app.js` |
| `joi` | Server-side validation - check if data is correct before saving | `schema.js` |

### Step 3: Create folder structure
```
project_1/
├── app.js                  ← Main server file (entry point)
├── package.json            ← Dependencies list
├── schema.js               ← Joi validation schemas
│
├── models/                 ← Database models (Mongoose schemas)
│   └── listing.js
│
├── init/                   ← Database seeding (sample data)
│   ├── init.js
│   └── data.js
│
├── utils/                  ← Helper/utility functions
│   ├── expressError.js     ← Custom error class
│   └── wrapAsync.js        ← Async error wrapper
│
├── public/                 ← Static files (CSS, JS, images)
│   ├── css/
│   │   ├── style.css
│   │   ├── animations.css
│   │   ├── listings-index.css
│   │   ├── listings-show.css
│   │   ├── listings-new.css
│   │   └── listings-edit.css
│   └── js/
│       └── script.js       ← Client-side validation
│
└── views/                  ← EJS templates
    ├── layouts/
    │   └── boilerplate.ejs ← Main layout (header + footer wrapper)
    ├── includes/
    │   ├── navbar.ejs      ← Navbar partial
    │   └── footer.ejs      ← Footer partial
    └── listings/
        ├── index.ejs       ← All listings page
        ├── show.ejs        ← Single listing detail page
        ├── new.ejs         ← Create listing form
        ├── edit.ejs        ← Edit listing form
        └── error.ejs       ← Error page
```

### Step 4: Setup `app.js` (the brain of your project)
```js
// ===== 1. REQUIRE ALL PACKAGES =====
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

// ===== 2. REQUIRE YOUR OWN FILES =====
const Listing = require('./models/listing');
const wrapAsync = require('./utils/wrapAsync');
const expressError = require('./utils/expressError');
const { listingSchema } = require('./schema.js');

// ===== 3. SETUP MIDDLEWARE =====
app.engine('ejs', ejsMate);                          // Use ejs-mate for layouts
app.use(express.urlencoded({ extended: true }));      // Parse form data
app.use(methodOverride('_method'));                   // Support PUT/DELETE in forms
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// ===== 4. SETUP VIEW ENGINE =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));

// ===== 5. CONNECT TO DATABASE =====
main().then(() => {
    console.log("database are up");
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

// ===== 6. START SERVER =====
app.listen(3000, () => {
    console.log('server is up and running');
});

// ===== 7. ALL YOUR ROUTES GO HERE =====
// ... (see Phase 4)

// ===== 8. 404 HANDLER (at the bottom) =====
// ... (see Phase 6)

// ===== 9. ERROR HANDLER (very last) =====
// ... (see Phase 6)
```

**THE ORDER MATTERS! Always follow this order in app.js:**
1. Require packages
2. Require your own files
3. Setup middleware (app.use)
4. Setup view engine
5. Connect to database
6. Start server
7. Routes
8. 404 catch-all route
9. Error handling middleware

---

## PHASE 2 - DATABASE SETUP

### Step 1: Make sure MongoDB is running
```bash
# Start MongoDB service
sudo systemctl start mongod

# Check if it's running
sudo systemctl status mongod

# Open MongoDB shell (optional, to check data)
mongosh
```

### Step 2: Connect from app.js
```js
// YOUR ACTUAL CODE:
main()
    .then(() => {
        console.log("database are up");
    }).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
    // 'wanderlust' is your database name
    // MongoDB creates it automatically when you first save data
}
```

**Key things to remember:**
- `mongodb://127.0.0.1:27017/` → this is the default MongoDB address
- `wanderlust` → your database name (can be anything)
- The database is created automatically when first data is inserted
- Use `.then().catch()` to handle connection success/failure

---

## PHASE 3 - CREATE MODELS

### What is a Model?
- A model is like a **blueprint** for your data
- It tells MongoDB what shape your data should be
- Think of it like a form template — it defines what fields exist

### Your Listing Model (`models/listing.js`):
```js
const mongoose = require('mongoose');

// Step 1: Define the schema (blueprint)
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,       // This field MUST be filled
    },
    description: {
        type: String,
    },
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://unsplash.com/...",  // Default value if not provided
        }
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
    },
    country: String,          // Shorthand (same as { type: String })
});

// Step 2: Create the model from schema
const Listing = mongoose.model('Listing', listingSchema);
// 'Listing' → MongoDB will create a collection called 'listings' (lowercase + plural)

// Step 3: Export it so other files can use it
module.exports = Listing;
```

**Schema field options you've used:**
| Option | What it does | Example |
|--------|-------------|---------|
| `type` | Data type (String, Number, etc.) | `type: String` |
| `required` | Must be provided | `required: true` |
| `default` | Auto-fill if not given | `default: "some url"` |

---

## PHASE 4 - BUILD ROUTES (CRUD)

### What is CRUD?
| Letter | Meaning | HTTP Method | Your Route | What it does |
|--------|---------|-------------|------------|-------------|
| C | Create | POST | `POST /listings` | Save new listing to database |
| R | Read | GET | `GET /listings` and `GET /listings/:id` | Show all or one listing |
| U | Update | PUT | `PUT /listings/:id` | Edit existing listing |
| D | Delete | DELETE | `DELETE /listings/:id` | Remove listing |

### IMPORTANT: RESTful Route Pattern
```
INDEX   →  GET    /listings          →  Show all listings
NEW     →  GET    /listings/new      →  Show create form
CREATE  →  POST   /listings          →  Actually save the new listing
SHOW    →  GET    /listings/:id      →  Show one listing's details
EDIT    →  GET    /listings/:id/edit →  Show edit form
UPDATE  →  PUT    /listings/:id      →  Actually update the listing
DELETE  →  DELETE /listings/:id      →  Remove the listing
```

### Your actual routes in app.js:

#### INDEX Route (Show all listings)
```js
app.get('/listings', wrapAsync(async (req, res) => {
    const alllistings = await Listing.find({});        // Get ALL listings from database
    res.render('listings/index.ejs', { listings: alllistings }); // Send to template
}));
```

#### NEW Route (Show create form)
```js
app.get('/listings/new', (req, res) => {
    res.render('listings/new.ejs');  // Just show the form, no database needed
});
// ⚠️ MUST be ABOVE the show route, otherwise '/new' gets treated as an ':id'
```

#### CREATE Route (Save new listing)
```js
app.post('/listings', validateListing, wrapAsync(async (req, res, next) => {
    let { title, description, price, city, country } = req.body; // Get form data
    const newListing = new Listing({                              // Create new document
        title: title,
        description: description,
        price: price,
        location: city,
        country: country,
    });
    await newListing.save();      // Save to database
    res.redirect('/listings');    // Go back to all listings
}));
```

#### SHOW Route (Show one listing)
```js
app.get('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;                          // Get id from URL
    const listing = await Listing.findById(id);         // Find in database
    res.render('listings/show.ejs', { listing });        // Send to template
}));
// ⚠️ MUST be at the END — it catches anything like /listings/ANYTHING
```

#### EDIT Route (Show edit form)
```js
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);         // Get current data to pre-fill form
    res.render('listings/edit.ejs', { listing });
}));
```

#### UPDATE Route (Actually update)
```js
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    let { title, description, price, city, country } = req.body;
    await Listing.findByIdAndUpdate(id, {               // Find and update in one step
        title: title,
        description: description,
        price: price,
        location: city,
        country: country,
    });
    res.redirect(`/listings/${id}`);                    // Go to updated listing
}));
```

#### DELETE Route
```js
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);                // Find and delete
    res.redirect('/listings');                           // Go back to all listings
}));
```

### ⚠️ ROUTE ORDER MATTERS!
```
1. GET /listings           ← INDEX (all listings)
2. GET /listings/new       ← NEW form (MUST be before :id routes!)
3. POST /listings          ← CREATE
4. GET /listings/:id/edit  ← EDIT form
5. PUT /listings/:id       ← UPDATE
6. DELETE /listings/:id    ← DELETE
7. GET /listings/:id       ← SHOW (MUST be LAST among :id routes!)
   ↑ Because :id matches ANYTHING — even "new" or "edit"
```

---

## PHASE 5 - CREATE VIEWS (EJS Templates)

> Covered in detail in `03_ejs_templates.md`

**Quick summary:**
- Use `ejs-mate` for layouts (boilerplate)
- Use `includes` for reusable parts (navbar, footer)
- Use `<%= %>` to output data, `<% %>` for logic
- Templates get data from routes via `res.render('template', { data })`

---

## PHASE 6 - ERROR HANDLING

> Covered in detail in `05_middlewares.md`

**Quick summary:**
- `expressError.js` → Custom error class with statusCode and message
- `wrapAsync.js` → Wraps async functions to catch errors automatically
- 404 catch-all route → Handles unknown URLs
- Error handling middleware → Shows error page

---

## PHASE 7 - VALIDATION

> Covered in detail in `02_database.md`

**Quick summary:**
- **Client-side**: Bootstrap's `needs-validation` + `script.js`
- **Server-side**: Joi schema in `schema.js` + `validateListing` middleware in `app.js`

---

## PHASE 8 - SEED DATA (Init)

### Purpose: Fill database with sample/test data

### How it works (`init/init.js`):
```js
const mongoose = require('mongoose');
const sampleData = require('./data.js');      // Import sample data
const listing = require('../models/listing.js'); // Import model

// Connect to database
main().then(() => {
    console.log("database are up");
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

// Seed function
const initdb = async () => {
    await listing.deleteMany({});             // ⚠️ DANGER: Deletes ALL existing data
    await listing.insertMany(sampleData.data); // Insert all sample listings
    console.log("database has been initialized with sample data");
}

initdb().then(() => {
    console.log("success in db");
}).catch(err => console.log(err));
```

### Run it:
```bash
node init/init.js
# This is a ONE-TIME thing. Run it only when you need fresh sample data.
```

### Sample data format (`init/data.js`):
```js
const sampleListings = [
    {
        title: "Cozy Beachfront Cottage",
        description: "Escape to this charming beachfront cottage...",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/...",
        },
        price: 1500,
        location: "Malibu",
        country: "United States",
    },
    // ... more listings
];

module.exports = { data: sampleListings };
```

---

## PHASE 9 - REVIEWS FEATURE ✅ COMPLETED

> Full details in `09_reviews.md`

### What is the Reviews feature?
- Users can leave a **star rating + comment** on any listing
- A listing can have **many reviews** (One-to-Many relationship)
- Reviews are stored in a **separate collection** and referenced from the listing

### Step 1: Create the Review Model (`models/review.js`)
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
        default: Date.now     // Auto-fill current timestamp
    }
});

module.exports = mongoose.model('Review', reviewSchema);
// Creates a 'reviews' collection in MongoDB
```

### Step 2: Add reviews array to Listing Model
```js
// models/listing.js — add this field:
reviews: [
    {
        type: mongoose.Schema.Types.ObjectId,  // Just store the Review's _id
        ref: 'Review'                           // Tell Mongoose which model to reference
    }
]
// This means: each listing stores an array of Review IDs, not the actual review data
```

### Step 3: Add reviewSchema to schema.js (Joi validation)
```js
// schema.js — ADD this as a SEPARATE export (don't overwrite listingSchema!):
module.exports.reviewSchema = Joi.object({
    review: Joi.object({                  // 'review' = the wrapper key from the form
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
});
```

### Step 4: Create the Review Route in app.js
```js
// POST /listings/:id/reviews  — Creates a new review for a listing
app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);  // Find the listing
    const review = new Review({                            // Create the review
        rating: req.body.rating,
        comment: req.body.comment,
    });
    listing.reviews.push(review);  // Add review's _id to the listing's reviews array
    await review.save();           // Save review to 'reviews' collection
    await listing.save();          // Save listing (with updated reviews array)
    res.redirect(`/listings/${listing._id}`);
}));
```

### Step 5: Use populate() to show reviews on the listing page
```js
// In the SHOW route — change findById to use populate:
const listing = await Listing.findById(id).populate('reviews');
// Without populate: listing.reviews = [ ObjectId('abc'), ObjectId('def') ]
// With populate:    listing.reviews = [ { comment: '...', rating: 5, ... }, ... ]
// populate() replaces the IDs with the actual Review documents
```

### Step 6: Add review form to show.ejs
```html
<!-- Form to submit a new review -->
<form action="/listings/<%= listing._id %>/reviews" method="POST">
    <input type="number" name="rating" min="1" max="5" required>
    <textarea name="comment" required></textarea>
    <button type="submit">Submit Review</button>
</form>

<!-- Display all reviews for this listing -->
<% for (let review of listing.reviews) { %>
    <div class="review-card">
        <p>Rating: <%= review.rating %>/5</p>
        <p><%= review.comment %></p>
    </div>
<% } %>
```

---

## PHASE 10 - DELETE REVIEWS ✅ COMPLETED

> Full details in `09_reviews.md`

### What was added:
- DELETE route for reviews
- `$pull` operator to remove the review ID from the listing's array
- Both the review document AND the reference in the listing are cleaned up

### The Delete Review Route (`route/review.js`):
```js
// DELETE /listings/:id/reviews/:reviewId
router.delete('/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Step 1: Remove reviewId from listing's reviews array
    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
        // $pull removes reviewId from the reviews array
    });

    // Step 2: Delete the actual review document
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));
```

### Delete button in show.ejs:
```html
<% for (let review of listing.reviews) { %>
    <div class="review-card">
        <p>Rating: <%= review.rating %>/5</p>
        <p><%= review.comment %></p>

        <!-- Delete review button -->
        <form action="/listings/<%= listing._id %>/reviews/<%= review._id %>?_method=DELETE" method="POST">
            <button type="submit" class="btn btn-sm btn-danger">Delete Review</button>
        </form>
    </div>
<% } %>
```

---

## PHASE 11 - EXPRESS ROUTER ✅ COMPLETED

> Full details in `04_routing.md`

### What changed:
- All listing routes moved from `app.js` to `route/listing.js`
- All review routes moved from `app.js` to `route/review.js`
- `app.js` is now clean — it just mounts the routers

### Your current `app.js` (clean version):
```js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressError = require('./utils/expressError');

// Routers
const listings = require('./route/listing.js');
const reviews = require('./route/review.js');

app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));

// Mount routers
app.use('/listings', listings);
app.use('/listings/:id/reviews', reviews);

main().then(() => console.log('database are up')).catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.listen(3000, () => console.log('server is up and running'));

app.get('/', (req, res) => res.send('working fine'));

app.all(/(.*)/, (req, res, next) => {
    next(new expressError(404, 'page not found'));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'something went wrong' } = err;
    res.render('listings/error.ejs', { message, statusCode });
});
```

---

## WHAT'S NEXT - FUTURE PHASES

These are the things you'll be adding to your project next:

### Phase 12: Authentication (Login/Signup)
- Install: `passport`, `passport-local`, `passport-local-mongoose`
- User model with automatic password hashing
- Login, Signup, Logout routes (`route/auth.js`)
- See `10_sessions_cookies.md` for the session setup needed

### Phase 13: Sessions + Flash Messages
- `express-session` + `connect-mongo` (store sessions in MongoDB)
- `connect-flash` for one-time success/error messages
- `res.locals` middleware to make messages available in all templates
- See `10_sessions_cookies.md` for full code

### Phase 14: Authorization
- `isLoggedIn` middleware — redirect to login if not authenticated
- `isOwner` middleware — 403 if user doesn't own the listing
- Store `owner` reference on Listing model

### Phase 15: Image Upload
- `multer` for handling file uploads from forms
- `cloudinary` + `multer-storage-cloudinary` for cloud storage
- Replace image URL fields with actual file uploads

### Phase 16: Maps
- Mapbox GL JS or Leaflet.js
- Geocoding (convert city/country to latitude/longitude)
- Show listing location on an interactive map

### Phase 17: Deployment
- MongoDB Atlas (cloud database, free tier)
- Render.com for hosting (connects to GitHub, free tier)
- Environment variables via `.env` + Render's dashboard
- See `11_project_mental_map.md` for deployment checklist

---

## 🧠 QUICK REFERENCE: Common Mongoose Methods

| Method | What it does | Example |
|--------|-------------|---------|
| `Model.find({})` | Get all documents | `Listing.find({})` |
| `Model.findById(id)` | Get one by ID | `Listing.findById(id)` |
| `Model.findByIdAndUpdate(id, data)` | Update one | `Listing.findByIdAndUpdate(id, {...})` |
| `Model.findByIdAndDelete(id)` | Delete one | `Listing.findByIdAndDelete(id)` |
| `new Model(data)` | Create new (not saved yet) | `new Listing({title: "..."})` |
| `.save()` | Save to database | `newListing.save()` |
| `Model.insertMany(array)` | Insert many at once | `Listing.insertMany(data)` |
| `Model.deleteMany({})` | Delete all | `Listing.deleteMany({})` |
| `.populate('field')` | Fill in referenced docs | `Listing.findById(id).populate('reviews')` |

## 🧠 QUICK REFERENCE: Common Express Methods

| Method | What it does | Example |
|--------|-------------|---------|
| `req.body` | Data from form/POST request | `req.body.title` |
| `req.params` | Data from URL (`:id`) | `req.params.id` |
| `req.query` | Data from URL query (`?key=value`) | `req.query.search` |
| `req.session` | Session data (after express-session) | `req.session.userId` |
| `req.flash()` | Flash messages (after connect-flash) | `req.flash('success', 'Done!')` |
| `res.render()` | Show a template | `res.render('index.ejs', {data})` |
| `res.redirect()` | Go to different URL | `res.redirect('/listings')` |
| `res.send()` | Send plain text/HTML | `res.send('Hello')` |
| `res.locals` | Variables for all templates | `res.locals.user = req.user` |

---

> 📝 **This file will be updated as you progress through the project!**

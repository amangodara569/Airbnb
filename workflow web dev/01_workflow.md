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
9. [What Comes Next (Not done yet)](#whats-next---future-phases)

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

## WHAT'S NEXT - FUTURE PHASES

These are the things you'll be adding to your project next:

### Phase 9: MongoDB Relationships (You're exploring this now)
- One to Few (embed documents)
- One to Many (reference by ID)
- Many to Many
- `populate()` to fill referenced data

### Phase 10: Reviews Feature
- Create Review model
- Add reviews to listings (one-to-many relationship)
- Review routes (create, delete)

### Phase 11: Authentication (Login/Signup)
- `passport.js` package
- User model with password hashing
- Login, Signup, Logout routes
- Sessions & Cookies

### Phase 12: Authorization
- Only logged-in users can create/edit/delete
- Only the owner can edit/delete their own listing
- `isLoggedIn` middleware
- `isOwner` middleware

### Phase 13: Image Upload
- `multer` for file uploads
- Cloudinary for cloud image storage
- Upload images instead of just URLs

### Phase 14: Maps
- Mapbox or Google Maps API
- Geocoding (convert location to coordinates)
- Show listing on a map

### Phase 15: Flash Messages & Sessions
- `connect-flash` for success/error messages
- `express-session` for session management

### Phase 16: Deployment
- Environment variables (`.env` file)
- MongoDB Atlas (cloud database)
- Render/Railway for hosting

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

## 🧠 QUICK REFERENCE: Common Express Methods

| Method | What it does | Example |
|--------|-------------|---------|
| `req.body` | Data from form/POST request | `req.body.title` |
| `req.params` | Data from URL (`:id`) | `req.params.id` |
| `req.query` | Data from URL query (`?key=value`) | `req.query.search` |
| `res.render()` | Show a template | `res.render('index.ejs', {data})` |
| `res.redirect()` | Go to different URL | `res.redirect('/listings')` |
| `res.send()` | Send plain text/HTML | `res.send('Hello')` |
| `res.json()` | Send JSON data | `res.json({key: value})` |

---

> 📝 **This file will be updated as you progress through the project!**

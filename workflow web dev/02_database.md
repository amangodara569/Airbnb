# 🗄️ DATABASE - MongoDB & Mongoose Complete Guide
> Everything about database — from connection to validation to seeding
> All examples from YOUR Wanderlust project

---

## 📋 TABLE OF CONTENTS
1. [MongoDB Basics](#mongodb-basics)
2. [Mongoose Setup & Connection](#mongoose-setup--connection)
3. [Creating Schemas & Models](#creating-schemas--models)
4. [CRUD Operations](#crud-operations---the-important-part)
5. [Schema Validation (Mongoose Level)](#schema-validation---mongoose-level)
6. [Joi Validation (Request Level)](#joi-validation---request-level)
7. [Database Seeding](#database-seeding)
8. [MongoDB Relationships (Starting)](#mongodb-relationships)
9. [Useful MongoDB Shell Commands](#useful-mongodb-shell-commands)

---

## MONGODB BASICS

### What is MongoDB?
- A **NoSQL** database — stores data as JSON-like documents (called BSON)
- No tables, no rows — instead has **collections** and **documents**
- Very flexible — no fixed structure required

### SQL vs MongoDB terminology:
| SQL (MySQL, PostgreSQL) | MongoDB |
|------------------------|---------|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |

### Your database:
```
Database name: wanderlust
Collection:    listings (created automatically from model name 'Listing')
```

### What a document looks like in MongoDB:
```json
{
    "_id": "ObjectId('abc123...')",
    "title": "Cozy Beachfront Cottage",
    "description": "Escape to this charming...",
    "image": {
        "filename": "listingimage",
        "url": "https://images.unsplash.com/..."
    },
    "price": 1500,
    "location": "Malibu",
    "country": "United States",
    "__v": 0
}
```
- `_id` → Automatically created by MongoDB, unique for every document
- `__v` → Version key, added by Mongoose

---

## MONGOOSE SETUP & CONNECTION

### What is Mongoose?
- An **ODM** (Object Data Modeling) library for MongoDB
- It's a bridge between your Node.js code and MongoDB
- You tell Mongoose the **shape** of your data (schema), and it enforces it

### Connection Code (from your app.js):
```js
const mongoose = require('mongoose');

// Method 1: Using async/await with .then (YOUR WAY)
main()
    .then(() => {
        console.log("database are up");
    }).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
```

### Connection String Breakdown:
```
mongodb://127.0.0.1:27017/wanderlust
│          │             │    │
│          │             │    └── Database name
│          │             └── Port (default MongoDB port)
│          └── IP address (localhost)
└── Protocol
```

### Common Connection Issues:
| Problem | Solution |
|---------|----------|
| `MongoServerError: connect ECONNREFUSED` | MongoDB service is not running. Run `sudo systemctl start mongod` |
| `MongooseError: Operation timed out` | Check if MongoDB is installed and running |
| Database doesn't show up in `mongosh` | It's created only after first document is inserted |

---

## CREATING SCHEMAS & MODELS

### What is a Schema?
- A **blueprint** that defines the structure of documents in a collection
- Like a form template — defines what fields exist and their rules

### What is a Model?
- A **JavaScript class** created from a schema
- It gives you methods to create, read, update, delete documents
- Think: Schema = blueprint, Model = factory

### Your Listing Schema (`models/listing.js`):
```js
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    // Field with options
    title: {
        type: String,
        required: true,       // MUST be provided
    },
    
    // Field with just type
    description: {
        type: String,
    },
    
    // Nested object (sub-document)
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://unsplash.com/...",  // Auto-fills if not given
        }
    },
    
    price: {
        type: Number,
    },
    
    location: {
        type: String,
    },
    
    // Shorthand — just the type
    country: String,    // Same as { type: String }
});

// Create model from schema
// 'Listing' → MongoDB auto-creates collection called 'listings' (lowercase + plural)
const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
```

### Schema Field Options:
| Option | What it does | Example |
|--------|-------------|---------|
| `type` | Data type | `type: String`, `type: Number`, `type: Boolean`, `type: Date` |
| `required` | Field must be provided | `required: true` |
| `default` | Auto-fill value | `default: "hello"` |
| `min` / `max` | Min/max for numbers | `min: 0`, `max: 1000` |
| `minLength` / `maxLength` | String length limits | `minLength: 3` |
| `enum` | Only allow specific values | `enum: ['sale', 'rent']` |
| `unique` | No duplicates allowed | `unique: true` |
| `trim` | Remove whitespace from start/end | `trim: true` |
| `lowercase` | Convert to lowercase | `lowercase: true` |

### Data Types Available:
```js
String     // "hello"
Number     // 42, 3.14
Boolean    // true, false
Date       // new Date()
Array      // [1, 2, 3]
ObjectId   // Reference to another document (for relationships)
Mixed      // Any type (avoid if possible)
```

---

## CRUD OPERATIONS - THE IMPORTANT PART

### CREATE — Adding new data

#### Method 1: new + save (YOUR WAY in create route)
```js
// Step 1: Create a new document (not saved yet, only in memory)
const newListing = new Listing({
    title: "Beautiful Villa",
    description: "A stunning villa with ocean views",
    price: 2000,
    location: "Bali",
    country: "Indonesia",
});

// Step 2: Save it to the database
await newListing.save();
// Now it's in MongoDB!
```

#### Method 2: Model.create() (shortcut — creates AND saves in one step)
```js
const newListing = await Listing.create({
    title: "Beautiful Villa",
    description: "A stunning villa with ocean views",
    price: 2000,
    location: "Bali",
    country: "Indonesia",
});
// Already saved! No need for .save()
```

#### Method 3: insertMany (for multiple documents — used in your seed file)
```js
await Listing.insertMany([
    { title: "Villa 1", price: 1000, ... },
    { title: "Villa 2", price: 2000, ... },
    { title: "Villa 3", price: 3000, ... },
]);
```

### READ — Getting data

#### Get ALL documents:
```js
const allListings = await Listing.find({});
// Returns an ARRAY of all listings
// {} means "no filter" → get everything
```

#### Get ONE document by ID:
```js
const listing = await Listing.findById("665abc123def...");
// Returns a SINGLE document or null
```

#### Get with conditions (filter):
```js
// Find all listings in India
const indianListings = await Listing.find({ country: "India" });

// Find listings under ₹2000
const cheapListings = await Listing.find({ price: { $lt: 2000 } });

// Find ONE listing by condition
const oneListing = await Listing.findOne({ title: "Cozy Beachfront Cottage" });
```

#### Common filter operators:
| Operator | Meaning | Example |
|----------|---------|---------|
| `$eq` | Equal to | `{ price: { $eq: 1000 } }` |
| `$gt` | Greater than | `{ price: { $gt: 1000 } }` |
| `$gte` | Greater than or equal | `{ price: { $gte: 1000 } }` |
| `$lt` | Less than | `{ price: { $lt: 2000 } }` |
| `$lte` | Less than or equal | `{ price: { $lte: 2000 } }` |
| `$ne` | Not equal | `{ country: { $ne: "India" } }` |
| `$in` | In array | `{ country: { $in: ["India", "Japan"] } }` |

### UPDATE — Changing data

#### Method 1: findByIdAndUpdate (YOUR WAY)
```js
await Listing.findByIdAndUpdate(id, {
    title: "Updated Title",
    description: "Updated description",
    price: 2500,
    location: "Mumbai",
    country: "India",
});
// Finds the document by id, updates the given fields
```

#### Method 2: Find first, then modify, then save
```js
const listing = await Listing.findById(id);
listing.title = "Updated Title";
listing.price = 2500;
await listing.save();
```

#### Method 3: updateOne / updateMany
```js
// Update one document
await Listing.updateOne({ _id: id }, { price: 3000 });

// Update ALL listings in India → set price to 5000
await Listing.updateMany({ country: "India" }, { price: 5000 });
```

### DELETE — Removing data

#### Delete one by ID (YOUR WAY):
```js
await Listing.findByIdAndDelete(id);
```

#### Delete with condition:
```js
// Delete all listings from a specific country
await Listing.deleteMany({ country: "Test Country" });

// Delete one by condition
await Listing.deleteOne({ title: "Test Listing" });
```

---

## SCHEMA VALIDATION - MONGOOSE LEVEL

### What is it?
- Rules defined **inside the schema** that MongoDB enforces when saving
- If data doesn't match the rules, Mongoose throws a `ValidationError`

### Your current schema validations:
```js
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,   // ← This is Mongoose validation
    },
    // ... other fields without required
});
```

### More validation options you can add:
```js
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],    // Custom error message
        minLength: [3, 'Title too short'],
        maxLength: [100, 'Title too long'],
        trim: true,                                // Remove extra spaces
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
        max: [100000, 'Price too high'],
    },
    category: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'cottage'], // Only these values allowed
    }
});
```

### Custom validators:
```js
price: {
    type: Number,
    validate: {
        validator: function(value) {
            return value >= 0;  // Must return true/false
        },
        message: 'Price must be positive!'
    }
}
```

---

## JOI VALIDATION - REQUEST LEVEL

### What is Joi?
- A separate validation library (not part of Mongoose)
- Validates the **incoming request data** BEFORE it even reaches the database
- Think of it as a **security guard at the door** — checks data before letting it in

### Why use BOTH Mongoose AND Joi validation?
```
User submits form
    ↓
JOI VALIDATION (schema.js + validateListing middleware)
    ↓ (if data is invalid, throw error immediately — never reach database)
    ↓ (if data is valid, continue...)
MONGOOSE VALIDATION (models/listing.js)
    ↓ (second line of defense when saving to database)
DATABASE
```
- **Joi** → Validates the shape/format of incoming data (request level)
- **Mongoose** → Validates at database level (last line of defense)
- **Both together** = bulletproof validation

### Your Joi Schema (`schema.js`):
```js
const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    city: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow("", null)   // Optional — can be empty or null
});
```

### Your Validation Middleware (`app.js`):
```js
const { listingSchema } = require('./schema.js');

const validateListing = (req, res, next) => {
    // Step 1: Validate request body against Joi schema
    let { error } = listingSchema.validate(req.body);
    
    // Step 2: If there's an error, throw it
    if (error) {
        // Combine all error messages into one string
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    } else {
        // Step 3: If valid, move to the next middleware/route handler
        next();
    }
}
```

### How it's used in routes:
```js
// validateListing runs BEFORE the async handler
app.post('/listings', validateListing, wrapAsync(async (req, res) => {
    // This code only runs if validation passes
    // ...
}));

app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
    // This code only runs if validation passes
    // ...
}));
```

### Common Joi methods:
| Method | What it does | Example |
|--------|-------------|---------|
| `.string()` | Must be a string | `Joi.string()` |
| `.number()` | Must be a number | `Joi.number()` |
| `.required()` | Cannot be empty/missing | `Joi.string().required()` |
| `.min(n)` | Minimum value (number) or length (string) | `Joi.number().min(0)` |
| `.max(n)` | Maximum value or length | `Joi.string().max(100)` |
| `.allow("", null)` | Allow specific empty values | `Joi.string().allow("")` |
| `.optional()` | Field is optional | `Joi.string().optional()` |
| `.valid()` | Only specific values | `Joi.string().valid('a', 'b', 'c')` |
| `.email()` | Must be valid email format | `Joi.string().email()` |
| `.uri()` | Must be valid URL | `Joi.string().uri()` |

### Client-Side vs Server-Side Validation:
| Feature | Client-Side (Browser) | Server-Side (Joi + Mongoose) |
|---------|----------------------|---------------------------|
| Where | In the browser (JS) | On the server (Node.js) |
| Speed | Instant feedback | Needs server round-trip |
| Security | Can be bypassed (Postman, dev tools) | Cannot be bypassed |
| Your code | `script.js` + Bootstrap `needs-validation` | `schema.js` + `validateListing` |
| Purpose | Better UX (quick feedback) | Actual security |

**⚠️ NEVER rely only on client-side validation! Always validate on server too.**

---

## DATABASE SEEDING

### What is seeding?
- Filling your database with **sample/test data**
- Useful for development and testing
- Run once to populate, then work with the data

### Your seed file (`init/init.js`):
```js
const mongoose = require('mongoose');
const sampleData = require('./data.js');
const listing = require('../models/listing.js');

// Connect to database
main().then(() => {
    console.log("database are up");
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

// Seed function
const initdb = async () => {
    await listing.deleteMany({});              // ⚠️ Delete ALL existing data first
    await listing.insertMany(sampleData.data); // Insert all sample data
    console.log("database has been initialized with sample data");
}

initdb().then(() => {
    console.log("success in db");
}).catch(err => console.log(err));
```

### Your sample data format (`init/data.js`):
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
    // ... 30 listings total
];

module.exports = { data: sampleListings };
```

### How to run:
```bash
node init/init.js
# Output: database are up
#         database has been initialized with sample data
#         success in db
```

**⚠️ WARNING: `deleteMany({})` deletes ALL data! Only run when you want to reset.**

---

## MONGODB RELATIONSHIPS

### You're starting to explore this! Here's what you need to know:

### Types of Relationships:
| Type | Example | Implementation |
|------|---------|---------------|
| One to Few | User → Home Addresses (max 2-3) | Embed inside parent document |
| One to Many | User → Posts (could be 100s) | Store reference (ObjectId) |
| One to Bajillions | User → Log entries (millions) | Store reference in child |
| Many to Many | Students ↔ Courses | Array of references on both sides |

### Rule: When to embed vs reference?
```
EMBED (store inside parent) when:
  ✅ Data is small (few items)
  ✅ Data is always accessed WITH the parent
  ✅ Data doesn't need to exist independently
  Example: User's home address

REFERENCE (store ObjectId) when:
  ✅ Data is large or growing
  ✅ Data needs to be accessed independently
  ✅ Data is shared between multiple parents
  Example: User's posts, Reviews on a listing
```

### One to Few — Embed (from your notes):
```js
// You DON'T need a separate model for the embedded data
// Example: Adding addresses to a User model
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    addresses: [                    // Array of sub-documents
        {
            street: String,
            city: String,
            state: String,
        }
    ]
});
// The addresses live INSIDE the user document
// No separate "Address" model needed
```

### One to Many — Reference (you'll use this for Reviews):
```js
// Listing model (parent)
const listingSchema = new mongoose.Schema({
    title: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,  // Store just the ID
            ref: 'Review'                          // Reference to Review model
        }
    ]
});

// Review model (child) — separate model
const reviewSchema = new mongoose.Schema({
    body: String,
    rating: Number,
});
```

> 📝 More will be added here as you progress through relationships!

---

## USEFUL MONGODB SHELL COMMANDS

### Open MongoDB shell:
```bash
mongosh
```

### Basic commands:
```js
show dbs                           // Show all databases
use wanderlust                     // Switch to your database
show collections                   // Show all collections in current db

db.listings.find()                 // Get all listings
db.listings.find().pretty()        // Get all listings (formatted)
db.listings.findOne()              // Get first listing
db.listings.countDocuments()       // Count total listings

db.listings.find({ country: "India" })           // Filter
db.listings.find({ price: { $gt: 2000 } })       // Price > 2000

db.listings.deleteMany({})         // ⚠️ Delete ALL listings
db.listings.drop()                 // ⚠️ Delete the entire collection
db.dropDatabase()                  // ⚠️ Delete the entire database
```

---

## 🧠 COMMON MISTAKES & FIXES

| Mistake | Fix |
|---------|-----|
| Forgot `await` before database operations | Always use `await` with `.find()`, `.save()`, `.findByIdAndUpdate()` etc. |
| Model name wrong | `mongoose.model('Listing', schema)` → collection will be `listings` |
| `req.body` is undefined | Add `app.use(express.urlencoded({ extended: true }))` |
| Data not saving | Check if `await` is used and if MongoDB is running |
| Validation not working | Check if Joi schema field names match your form input `name` attributes |
| `CastError: Cast to ObjectId failed` | The `:id` in URL is not a valid MongoDB ObjectId |

---

> 📝 **This file will be updated as you add more database features!**

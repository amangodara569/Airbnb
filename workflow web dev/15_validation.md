# ✅ VALIDATION - Complete Guide (All Types)
> Everything about validation — client-side, server-side, Mongoose, Joi
> All types with implementation, examples, and important cases
> All examples from YOUR Wanderlust project

---

## 📋 TABLE OF CONTENTS
1. [Validation Overview — The 3-Layer System](#validation-overview--the-3-layer-system)
2. [Layer 1: Client-Side Validation (HTML5)](#layer-1-client-side-validation-html5)
3. [Layer 2: Mongoose Schema Validation](#layer-2-mongoose-schema-validation)
4. [Layer 3: Joi Validation (Request Level)](#layer-3-joi-validation-request-level)
5. [Custom Server Validation](#custom-server-validation)
6. [Complete Validation Flow — Start to Finish](#complete-validation-flow--start-to-finish)
7. [Important Cases & Edge Cases](#important-cases--edge-cases)
8. [Common Mistakes & How to Fix Them](#common-mistakes--how-to-fix-them)

---

## VALIDATION OVERVIEW — THE 3-LAYER SYSTEM

### Why 3 layers?
A single layer is NOT enough. You need multiple layers of protection:
```
Layer 1: Client-Side (HTML5)   ← Quick UX feedback, can be BYPASSED
           ↓ (if passes)
Layer 2: Mongoose Schema       ← Database-level protection
           ↓ (if passes)
Layer 3: Joi Middleware        ← Business logic validation
           ↓ (if passes)
Database                       ← Data is safely saved
```

### The Weakest Link Problem:
```
Without Layer 2 & 3:
- A hacker uses curl or Postman to bypass HTML5 validation
- They send invalid data directly to your API
- Bad data gets saved to database
- Your app breaks or shows wrong info

With all 3 layers:
- HTML5 blocks normal users from sending bad data (UX)
- Mongoose prevents wrong data types from being saved
- Joi validates business rules (like "price must be > 0")
- Hackers CAN'T bypass all 3 layers easily
```

---

## LAYER 1: CLIENT-SIDE VALIDATION (HTML5)

### What is it?
Built-in browser validation using HTML attributes. Happens BEFORE form data is sent.

### Key Points:
- ✅ Fast — no server round trip
- ✅ Good UX — immediate feedback
- ❌ NOT secure — users can bypass it (F12 developer tools)
- ❌ NOT enough — always need server validation too

### Your Signup Form (views/users/signup.ejs):
```html
<form action="/signup" method="POST">
    <!-- Client validation: browser checks field is not empty -->
    <div>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
        <!-- 'required' = HTML5 validation: field can't be empty -->
    </div>
    
    <!-- Client validation: browser checks email format -->
    <div>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        <!-- 'type="email"' = HTML5 validation: must be valid email format -->
        <!-- Browser checks: has @ symbol, domain, etc. -->
    </div>
    
    <!-- Client validation: marks as password field (masked input) -->
    <div>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <!-- 'type="password"' = masks characters, doesn't validate length -->
    </div>
    
    <button type="submit">Sign Up</button>
</form>
```

### Common HTML5 Validation Attributes:

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `required` | Field must NOT be empty | `<input required>` |
| `type` | Enforce specific data type | `type="email"`, `type="number"`, `type="date"` |
| `minlength` / `maxlength` | String length limits | `maxlength="50"` |
| `min` / `max` | Number or date range | `min="0" max="100"` |
| `pattern` | Custom regex validation | `pattern="[a-zA-Z0-9]+"` |

### Examples:

```html
<!-- Number field: must be between 100 and 5000 -->
<input type="number" name="price" min="100" max="5000" required>

<!-- Text field: must be 3-20 characters -->
<input type="text" name="username" minlength="3" maxlength="20" required>

<!-- Date field: user picks from calendar -->
<input type="date" name="bookingDate" required>

<!-- Checkbox: user must check it -->
<input type="checkbox" name="terms" required>
I agree to terms and conditions

<!-- Custom validation: only letters and numbers -->
<input type="text" name="username" pattern="[a-zA-Z0-9]+" required>
```

### Testing Client Validation (How to Bypass):
```bash
# Open browser DevTools (F12)
# Go to Console tab
# Type:
document.querySelector('input[name="username"]').removeAttribute('required');
# Now the 'required' attribute is gone — you can submit empty!
```

### Why Client Validation Alone is Dangerous:
```js
// Hacker doesn't use your form at all
// They send raw request to your API using curl/Postman:

curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "",
    "email": "not-an-email",
    "password": ""
  }'

// Your HTML validation doesn't even run!
// Data goes directly to backend → bad data in database
// This is why you NEED server validation
```

---

## LAYER 2: MONGOOSE SCHEMA VALIDATION

### What is it?
Validation rules built into your Mongoose schema. Happens when you try to SAVE a document to database.

### Key Points:
- ✅ Database-level protection
- ✅ Prevents wrong data types from being saved
- ✅ Works even if client sends raw requests
- ✅ Built-in validators (required, min, max, enum, etc.)
- ⚠️ Not caught if you use direct MongoDB queries (bypass Mongoose)

### Your Listing Schema (models/listing.js):
```js
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    // String field: required, minimum 3 characters
    title: {
        type: String,
        required: true,           // ← Validation: title MUST be provided
        minlength: 3,            // ← Validation: at least 3 characters
        trim: true,              // ← Auto: remove whitespace from start/end
    },
    
    // String field: limited length
    description: {
        type: String,
        maxlength: 500,          // ← Validation: max 500 characters
    },
    
    // Number field: min/max range
    price: {
        type: Number,
        required: true,
        min: 0,                  // ← Validation: can't be negative
        max: 1000000,            // ← Validation: practical max limit
    },
    
    // Enum: only specific values allowed
    status: {
        type: String,
        enum: ['available', 'rented', 'sold'],  // ← Validation: only these 3 values
        default: 'available',
    },
    
    // Reference to another model
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,          // ← Validation: owner MUST be set
    },
    
    // Array of references
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    
    // Lowercase: automatically convert to lowercase
    category: {
        type: String,
        lowercase: true,         // ← Auto: "LUXURY" becomes "luxury"
        enum: ['luxury', 'budget', 'mid-range'],
    },
    
    // Unique: no duplicates allowed in database
    email: {
        type: String,
        unique: true,            // ← Validation: can't have 2 listings with same email
    },
    
    // Default value: auto-fills if not provided
    createdAt: {
        type: Date,
        default: Date.now,       // ← Auto: current timestamp if not given
    }
});

// Custom validator function
listingSchema.path('price').validate(function(value) {
    // Custom rule: price must be a multiple of 100
    return value % 100 === 0;
}, 'Price must be a multiple of 100');

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
```

### Mongoose Validation Rules (Built-in):

| Rule | Purpose | Example |
|------|---------|---------|
| `required: true` | Field must be provided | `required: true` |
| `type` | Must be correct data type | `type: String` |
| `min` / `max` | Range for numbers/dates | `min: 0, max: 100` |
| `minlength` / `maxlength` | String length | `minlength: 3` |
| `match` | Must match regex pattern | `match: /^[0-9]+$/` |
| `enum` | Only specific values | `enum: ['a', 'b', 'c']` |
| `unique: true` | No duplicates | `unique: true` |
| `trim: true` | Remove whitespace | `trim: true` |
| `lowercase: true` | Convert to lowercase | `lowercase: true` |
| `uppercase: true` | Convert to uppercase | `uppercase: true` |
| `validate: function` | Custom validator | `validate: (val) => val > 0` |

### How Mongoose Validation Works — Step by Step:
```js
// Step 1: Create a new listing document
const newListing = new Listing({
    title: "Co",                    // Only 2 chars — VIOLATES minlength: 3
    price: -100,                    // Negative — VIOLATES min: 0
    status: "pending",              // Invalid — VIOLATES enum
    owner: userId                   // Valid
});

// Step 2: Try to save it
try {
    await newListing.save();        // ← Mongoose validates HERE
} catch (error) {
    // Validation failed! error contains all problems:
    // {
    //   "title": "Path `title` (`Co`) is shorter than the minimum allowed length (3).",
    //   "price": "Path `price` (-100) is less than minimum allowed value (0).",
    //   "status": "`pending` is not a valid enum value..."
    // }
    console.log(error.errors);      // See all validation errors
    
    // Example: Show first error to user
    const firstError = Object.values(error.errors)[0];
    console.log(firstError.message);  // "Path `title` is shorter..."
}
```

### Your Review Model (models/review.js):
```js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Comment: required, min 1 character
    comment: {
        type: String,
        required: true,
    },
    
    // Rating: required, must be 1-5
    rating: {
        type: Number,
        required: true,
        min: 1,                   // ← Validation: at least 1 star
        max: 5,                   // ← Validation: max 5 stars
        default: 3,               // ← Default to 3 stars
    },
    
    // Author reference
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    
    // Listing reference
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
    
    // Timestamp
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
```

### Custom Validators — Advanced:
```js
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        validate: {
            // Custom validator: email must not be from blocked domains
            validator: function(email) {
                const blockedDomains = ['spam.com', 'fake.com'];
                const domain = email.split('@')[1];
                return !blockedDomains.includes(domain);
            },
            message: 'That email domain is not allowed'
        }
    },
    
    password: {
        type: String,
        required: true,
        validate: {
            // Custom validator: password must be at least 8 chars
            // and contain at least 1 number
            validator: function(pwd) {
                return pwd.length >= 8 && /[0-9]/.test(pwd);
            },
            message: 'Password must be 8+ chars with at least 1 number'
        }
    },
    
    age: {
        type: Number,
        validate: {
            // Custom validator: age must be 18+
            validator: function(age) {
                return age >= 18;
            },
            message: 'Must be 18 or older'
        }
    }
});
```

---

## LAYER 3: JOI VALIDATION (REQUEST LEVEL)

### What is it?
Joi is a schema validation library for object shape and content. Validates the REQUEST BODY (form data) BEFORE it reaches your database.

### Key Points:
- ✅ Validates business logic rules
- ✅ Creates human-friendly error messages
- ✅ Can validate combinations of fields
- ✅ More flexible than Mongoose validators
- ✅ Works as middleware (before route handler runs)
- ✅ Can sanitize/transform data

### When to Use Joi vs Mongoose:
```
MONGOOSE validates:
- Wrong data types (string instead of number)
- Basic field requirements
- Database constraints (unique, references)

JOI validates:
- Business logic (price > 0, rating 1-5)
- Field combinations (if status='sold', then saleDate is required)
- User input quality (reasonable length, sensible values)
- REQUEST BODY before touching database
```

### Your schema.js (Joi Validation Schemas):
```js
const Joi = require('joi');

// Listing validation schema
const listingSchema = Joi.object({
    // Title: required string, 3-100 chars, trim whitespace
    title: Joi.string()
        .required()              // ← Must be provided
        .min(3)                  // ← Minimum 3 characters
        .max(100)                // ← Maximum 100 characters
        .trim()                  // ← Remove leading/trailing whitespace
        .messages({
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title must be at least 3 characters',
            'string.max': 'Title must be less than 100 characters',
            'any.required': 'Title is required'
        }),
    
    // Description: optional, but if provided must be 10+ chars
    description: Joi.string()
        .min(10)                 // ← At least 10 chars IF provided
        .max(1000),              // ← Max 1000 chars
    
    // Price: required number, must be > 0
    price: Joi.number()
        .required()
        .min(1)                  // ← Must be at least 1
        .messages({
            'number.min': 'Price must be greater than 0',
            'any.required': 'Price is required'
        }),
    
    // Location: required string
    location: Joi.string().required(),
    
    // Country: required string
    country: Joi.string().required(),
    
    // Image filename: optional
    image: Joi.object({
        filename: Joi.string(),
        url: Joi.string()
            .uri()               // ← Must be valid URL
            .required()
    }),
    
}).unknown(true);                 // Allow extra fields (safety)


// Review validation schema
const reviewSchema = Joi.object({
    // Rating: required number between 1-5
    rating: Joi.number()
        .required()
        .min(1)                  // ← At least 1 star
        .max(5)                  // ← Max 5 stars
        .messages({
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot exceed 5',
            'any.required': 'Rating is required'
        }),
    
    // Comment: required string, 1-500 chars
    comment: Joi.string()
        .required()
        .min(1)
        .max(500)
        .messages({
            'string.empty': 'Comment cannot be empty',
            'string.max': 'Comment must be under 500 characters',
            'any.required': 'Comment is required'
        }),
    
    review: Joi.object().unknown(true)  // Allow nested object

}).unknown(true);                // Allow extra fields


module.exports = { listingSchema, reviewSchema };
```

### Joi Validation Rules (Most Common):

| Rule | Purpose | Example |
|------|---------|---------|
| `.required()` | Field must be provided | `.required()` |
| `.min(n)` | Minimum (length or value) | `.min(3)` |
| `.max(n)` | Maximum (length or value) | `.max(100)` |
| `.string()` | Must be a string | `.string()` |
| `.number()` | Must be a number | `.number()` |
| `.email()` | Must be valid email | `.email()` |
| `.uri()` | Must be valid URL | `.uri()` |
| `.alphanum()` | Only letters and numbers | `.alphanum()` |
| `.lowercase()` | Convert to lowercase | `.lowercase()` |
| `.trim()` | Remove whitespace | `.trim()` |
| `.valid('a', 'b')` | Only specific values | `.valid('admin', 'user')` |
| `.regex()` | Match regex pattern | `.regex(/^[0-9]+$/)` |

### Using Joi in Middleware (app.js):
```js
const { listingSchema, reviewSchema } = require('./schema');
const expressError = require('./utils/expressError');

// LISTING VALIDATION MIDDLEWARE
const validateListing = (req, res, next) => {
    // Step 1: Validate req.body against listingSchema
    let { error } = listingSchema.validate(req.body);
    
    // Step 2: If validation fails, create error message
    if (error) {
        // error.details = array of all errors
        // Example: [
        //   { message: '"title" is required' },
        //   { message: '"price" must be greater than 0' }
        // ]
        let errMsg = error.details
            .map((el) => el.message)  // Extract just the message text
            .join(", ");              // Join multiple errors with comma
        
        // Throw error so error handler can catch it
        throw new expressError(400, errMsg);
    } else {
        // Validation passed — continue to route handler
        next();
    }
};

// REVIEW VALIDATION MIDDLEWARE
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new expressError(400, errMsg);
    } else {
        next();
    }
};

module.exports = { validateListing, validateReview };
```

### Using Validation Middleware in Routes (app.js):
```js
const { validateListing, validateReview } = require('./middleware/validation');

// LISTING ROUTES
// Create listing with validation middleware
app.post('/listings', 
    validateListing,           // ← Middleware 1: Validate data
    wrapAsync(async (req, res) => {
        // If validation passed, we reach here
        const newListing = new Listing(req.body);
        await newListing.save();
        res.redirect(`/listings/${newListing._id}`);
    })
);

// Update listing with validation
app.put('/listings/:id',
    validateListing,           // ← Validate before updating
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, req.body);
        res.redirect(`/listings/${id}`);
    })
);

// REVIEW ROUTES
// Create review with validation
app.post('/listings/:id/reviews',
    validateReview,            // ← Validate review data
    wrapAsync(async (req, res) => {
        const listing = await Listing.findById(req.params.id);
        const review = new Review(req.body.review);
        listing.reviews.push(review);
        await listing.save();
        await review.save();
        res.redirect(`/listings/${listing._id}`);
    })
);
```

---

## CUSTOM SERVER VALIDATION

### What is it?
Custom logic to validate data beyond what Joi/Mongoose can do. Happens in route handlers.

### Examples of Custom Validation:

```js
// Example 1: Validate that listing owner is the current user
app.put('/listings/:id',
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        
        // CUSTOM VALIDATION: Check if user is the owner
        if (!listing.owner.equals(req.user._id)) {
            throw new expressError(403, "You don't have permission to edit this");
        }
        
        // If check passed, proceed with update
        await Listing.findByIdAndUpdate(id, req.body);
        res.redirect(`/listings/${id}`);
    })
);

// Example 2: Validate file upload
app.post('/listings',
    validateListing,
    wrapAsync(async (req, res) => {
        // CUSTOM VALIDATION: Check if image was uploaded
        if (!req.files || req.files.length === 0) {
            throw new expressError(400, "Please upload at least one image");
        }
        
        const newListing = new Listing(req.body);
        await newListing.save();
        res.redirect(`/listings/${newListing._id}`);
    })
);

// Example 3: Validate that email doesn't already exist
app.post('/signup',
    wrapAsync(async (req, res) => {
        const { email, username, password } = req.body;
        
        // CUSTOM VALIDATION: Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new expressError(400, "Email already registered");
        }
        
        const user = new User({ email, username });
        await user.setPassword(password);
        await user.save();
        res.redirect('/');
    })
);

// Example 4: Validate date logic
app.post('/bookings',
    wrapAsync(async (req, res) => {
        const { checkIn, checkOut } = req.body;
        
        // CUSTOM VALIDATION: checkOut must be after checkIn
        if (new Date(checkOut) <= new Date(checkIn)) {
            throw new expressError(400, "Check-out date must be after check-in date");
        }
        
        // Validation passed, proceed
        const booking = new Booking(req.body);
        await booking.save();
        res.redirect('/bookings');
    })
);

// Example 5: Validate dependent fields
app.post('/jobs',
    wrapAsync(async (req, res) => {
        const { jobType, salary, hourlyRate } = req.body;
        
        // CUSTOM VALIDATION: If jobType is "hourly", hourlyRate must be provided
        if (jobType === 'hourly' && !hourlyRate) {
            throw new expressError(400, "Hourly rate required for hourly jobs");
        }
        
        // CUSTOM VALIDATION: If jobType is "fulltime", salary must be provided
        if (jobType === 'fulltime' && !salary) {
            throw new expressError(400, "Salary required for full-time jobs");
        }
        
        const job = new Job(req.body);
        await job.save();
        res.redirect('/jobs');
    })
);
```

---

## COMPLETE VALIDATION FLOW — START TO FINISH

### Real-World Scenario: User Signs Up
```
┌─────────────────────────────────────────────────────────────┐
│ USER TYPES IN FORM & CLICKS SUBMIT                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: HTML5 VALIDATION (Browser checks)                 │
│ - Checks 'required' attribute                               │
│ - Checks 'type="email"' format                              │
│ - Checks 'minlength'/'maxlength'                            │
│                                                              │
│ Possible Outcomes:                                          │
│ ✅ PASS → Send form data to server                          │
│ ❌ FAIL → Show browser error, DON'T send to server         │
└─────────────────────────────────────────────────────────────┘
                           ↓ (if passes)
┌─────────────────────────────────────────────────────────────┐
│ NETWORK REQUEST SENT TO /signup                             │
│ Data: { username, email, password }                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: JOI VALIDATION MIDDLEWARE                          │
│ validateSignup middleware runs FIRST                        │
│ - Checks schema rules (required, min, max, etc.)            │
│ - Creates user-friendly error messages                      │
│                                                              │
│ Possible Outcomes:                                          │
│ ✅ PASS → Continue to route handler                         │
│ ❌ FAIL → Throw error → error handler catches it            │
│          → Flash error message → redirect to signup form   │
└─────────────────────────────────────────────────────────────┘
                           ↓ (if passes)
┌─────────────────────────────────────────────────────────────┐
│ ROUTE HANDLER: app.post('/signup', ...)                     │
│ 1. Create new User: new User({ username, email, password }) │
│ 2. Hash password (passport.js does this)                    │
│ 3. Call user.save()                                         │
│                                                              │
│ Now LAYER 2: MONGOOSE VALIDATION runs automatically        │
│ - Checks 'required' fields                                  │
│ - Checks data types                                         │
│ - Checks custom validators                                  │
│ - Checks 'unique' constraint (email not duplicate)          │
│                                                              │
│ Possible Outcomes:                                          │
│ ✅ PASS → Document saved to MongoDB                         │
│ ❌ FAIL → Throw error → error handler catches it            │
│          → Flash error → redirect to signup form            │
└─────────────────────────────────────────────────────────────┘
                           ↓ (if passes)
┌─────────────────────────────────────────────────────────────┐
│ SUCCESS!                                                     │
│ - User saved to database                                    │
│ - Session created                                           │
│ - Redirect to dashboard                                     │
│ - Flash success message                                     │
└─────────────────────────────────────────────────────────────┘
```

### Code Example — The Full Flow:
```js
// ==========================================
// SCHEMA.JS - Joi Validation (Layer 3)
// ==========================================
const signupSchema = Joi.object({
    username: Joi.string()
        .alphanum()              // Only letters and numbers
        .min(3)                  // At least 3 chars
        .max(30)                 // Max 30 chars
        .required(),
    
    email: Joi.string()
        .email()                 // Must be valid email
        .required(),
    
    password: Joi.string()
        .min(8)                  // At least 8 chars
        .required()
});

// ==========================================
// MODELS/USER.JS - Mongoose Validation (Layer 2)
// ==========================================
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,          // Must be provided
        minlength: 3,            // At least 3 chars
        unique: true             // No duplicates
    },
    
    email: {
        type: String,
        required: true,
        unique: true,            // No duplicate emails
        lowercase: true          // Auto-convert to lowercase
    },
    
    password: {
        type: String,
        required: true,
        minlength: 8
    }
});

// ==========================================
// ROUTES/AUTH.JS - Middleware + Handler
// ==========================================

// Middleware function (Layer 3 - Joi)
const validateSignup = (req, res, next) => {
    const { error } = signupSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(", ");
        throw new expressError(400, errMsg);
    }
    next();
};

// Route handler
app.post('/signup',
    validateSignup,              // Layer 3: Joi validates
    wrapAsync(async (req, res) => {
        const { username, email, password } = req.body;
        
        try {
            // Create new user (triggers Layer 2: Mongoose validation)
            const user = new User({ username, email });
            
            // Hash password
            await user.setPassword(password);
            
            // Save to database (Mongoose validates here)
            await user.save();        // ← Layer 2 validation happens here
            
            // Success - login and redirect
            req.login(user, (err) => {
                if (err) return next(err);
                req.flash('success', 'Welcome! You are signed up.');
                res.redirect('/');
            });
        } catch (error) {
            // Catch Mongoose validation errors
            if (error.code === 11000) {
                // Duplicate key error (email or username already exists)
                req.flash('error', 'Email or username already registered');
            } else {
                req.flash('error', error.message);
            }
            res.redirect('/signup');
        }
    })
);

// ==========================================
// VIEWS/SIGNUP.EJS - HTML5 Validation (Layer 1)
// ==========================================
<form action="/signup" method="POST">
    <!-- Layer 1: HTML5 validation -->
    <input 
        type="text" 
        name="username" 
        required
        minlength="3"
        maxlength="30"
    />
    
    <input 
        type="email" 
        name="email" 
        required
    />
    
    <input 
        type="password" 
        name="password" 
        required
        minlength="8"
    />
    
    <button type="submit">Sign Up</button>
</form>
```

---

## IMPORTANT CASES & EDGE CASES

### Case 1: Handling Joi Validation Errors — Show All or Just First?
```js
// ❌ WRONG: Show just raw error object
if (error) {
    res.status(400).send(error);  // User sees confusing object
}

// ✅ RIGHT: Show user-friendly messages
if (error) {
    let errMsg = error.details
        .map((el) => el.message)  // Get just the messages
        .join(", ");              // Join multiple with comma
    res.status(400).send(errMsg); // Clear, readable error
}

// ✅ ALSO RIGHT: Show first error only (simpler UX)
if (error) {
    const firstError = error.details[0].message;
    res.status(400).send(firstError);
}
```

### Case 2: Mongoose Duplicate Key Error
```js
app.post('/signup', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.redirect('/');
    } catch (error) {
        // Duplicate key error has code 11000
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];  // 'email' or 'username'
            res.status(400).send(`${field} already exists`);
        } else if (error.name === 'ValidationError') {
            // Mongoose validation error
            const messages = Object.values(error.errors)
                .map(el => el.message);
            res.status(400).send(messages.join(", "));
        } else {
            res.status(500).send('Server error');
        }
    }
});
```

### Case 3: File Upload Validation
```js
app.post('/listings',
    validateListing,  // Joi validates form fields
    wrapAsync(async (req, res) => {
        // CUSTOM: Validate file upload
        if (!req.files || req.files.length === 0) {
            throw new expressError(400, "Please upload at least one image");
        }
        
        // Optional: Validate file size (max 5MB per file)
        req.files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                throw new expressError(400, `File too large: ${file.name}`);
            }
        });
        
        const newListing = new Listing(req.body);
        await newListing.save();
        res.redirect(`/listings/${newListing._id}`);
    })
);
```

### Case 4: Validating Related Documents
```js
app.post('/listings/:id/reviews',
    validateReview,
    wrapAsync(async (req, res) => {
        // CUSTOM: Make sure listing exists
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            throw new expressError(404, "Listing not found");
        }
        
        // CUSTOM: Make sure user hasn't already reviewed this listing
        const existingReview = await Review.findOne({
            listing: req.params.id,
            author: req.user._id
        });
        if (existingReview) {
            throw new expressError(400, "You already reviewed this listing");
        }
        
        // If all checks pass, create review
        const review = new Review({
            ...req.body.review,
            author: req.user._id,
            listing: req.params.id
        });
        await review.save();
        listing.reviews.push(review);
        await listing.save();
        res.redirect(`/listings/${listing._id}`);
    })
);
```

### Case 5: Skipping Validation for Specific Cases
```js
// Sometimes you need to UPDATE without full validation
// Use findByIdAndUpdate with runValidators: false

app.patch('/listings/:id',
    wrapAsync(async (req, res) => {
        // Only update 'views' counter without full validation
        await Listing.findByIdAndUpdate(id, 
            { $inc: { views: 1 } },
            { runValidators: false }  // Skip validation
        );
        res.send('OK');
    })
);
```

---

## COMMON MISTAKES & HOW TO FIX THEM

### ❌ Mistake 1: Only HTML5 Validation (No Server Validation)
```js
// WRONG:
app.post('/listings', async (req, res) => {
    const listing = new Listing(req.body);
    await listing.save();  // Bad data could be saved!
    res.redirect(`/listings/${listing._id}`);
});

// RIGHT:
app.post('/listings',
    validateListing,       // ← Add Joi middleware
    wrapAsync(async (req, res) => {
        const listing = new Listing(req.body);
        await listing.save();  // Now data is validated first
        res.redirect(`/listings/${listing._id}`);
    })
);
```

### ❌ Mistake 2: Not Catching Mongoose Validation Errors
```js
// WRONG:
app.post('/signup', async (req, res) => {
    const user = new User(req.body);
    await user.save();  // If validation fails, error crashes app!
    res.redirect('/');
});

// RIGHT:
app.post('/signup', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.redirect('/');
    } catch (error) {
        // Handle validation error gracefully
        req.flash('error', error.message);
        res.redirect('/signup');
    }
});
```

### ❌ Mistake 3: Using Joi with Wrong Data Structure
```js
// WRONG: Joi validates form data directly
// If form uses <input name="review[rating]">, data looks like:
// { review: { rating: 4, comment: "Great!" } }

const reviewSchema = Joi.object({
    rating: Joi.number().required(),   // ← WRONG location
    comment: Joi.string().required()
});

// RIGHT: Joi should match the actual data structure
const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),     // ← Correct nesting
        comment: Joi.string().required()
    })
}).unknown(true);
```

### ❌ Mistake 4: Forgetting `required()` for Important Fields
```js
// WRONG: Optional fields that should be required
const listingSchema = Joi.object({
    title: Joi.string(),      // Can be empty!
    price: Joi.number(),      // Can be missing!
    location: Joi.string()    // Can be empty!
});

// RIGHT: Mark important fields as required
const listingSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    location: Joi.string().required()
});
```

### ❌ Mistake 5: Not Converting Joi Error to User-Friendly Message
```js
// WRONG:
if (error) {
    res.status(400).json(error);  // Shows technical error details
}
// User sees: "statusCode":400,"isJoi":true,"details":[...]

// RIGHT:
if (error) {
    const messages = error.details
        .map(el => el.message)
        .join(", ");
    res.status(400).send(messages);
}
// User sees: "title" is required, "price" must be greater than 0
```

### ❌ Mistake 6: Validating Data AFTER Saving (Too Late!)
```js
// WRONG: Validate after save
app.post('/listings', wrapAsync(async (req, res) => {
    const listing = new Listing(req.body);
    await listing.save();              // Already saved!
    
    // Too late to validate
    if (!req.body.title) {
        res.status(400).send('Title required');
    }
    res.redirect(`/listings/${listing._id}`);
}));

// RIGHT: Validate BEFORE save
app.post('/listings',
    validateListing,  // ← Validation happens first
    wrapAsync(async (req, res) => {
        // By the time we're here, data is already valid
        const listing = new Listing(req.body);
        await listing.save();
        res.redirect(`/listings/${listing._id}`);
    })
);
```

---

## QUICK REFERENCE TABLE

### Which Layer Catches What?

| Error | Layer 1 (HTML5) | Layer 2 (Mongoose) | Layer 3 (Joi) | Custom |
|-------|---|---|---|---|
| Empty required field | ✅ Catches | ✅ Catches | ✅ Catches | - |
| Wrong data type | ❌ | ✅ Catches | ✅ Catches | - |
| Too short/long | ✅ Catches | ✅ Catches | ✅ Catches | - |
| Price < 0 | ❌ | ✅ Catches | ✅ Catches | - |
| Rating not 1-5 | ❌ | ❌ | ✅ Catches | ✅ |
| Email duplicate | ❌ | ✅ Catches | ❌ | - |
| File not uploaded | ❌ | ❌ | ❌ | ✅ Catches |
| User already reviewed | ❌ | ❌ | ❌ | ✅ Catches |

---

## SUMMARY

**Always use all 3 layers:**
1. **HTML5** → Quick UX feedback for users
2. **Joi** → Business logic validation (before database touch)
3. **Mongoose** → Database-level protection (data type, constraints)
4. **Custom** → Complex rules that need code logic

**Error handling priority:**
- Show user-friendly messages
- Never crash the app
- Log errors for debugging
- Redirect or flash messages

**Security reminder:**
- NEVER trust client-side validation alone
- ALWAYS validate on server
- Assume hacker will send invalid data
- All 3 layers work together

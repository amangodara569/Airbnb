# ⭐ REVIEWS FEATURE - Complete Guide
> Everything about adding Reviews to your Wanderlust project
> One-to-Many relationship: Listing → Reviews
> Covers: model, routes, Joi validation, populate(), cascade delete

---

## 📋 TABLE OF CONTENTS
1. [What is a Review?](#what-is-a-review)
2. [The One-to-Many Relationship](#the-one-to-many-relationship)
3. [Step 1 — Review Model](#step-1--review-model-modelsreviewjs)
4. [Step 2 — Update Listing Model](#step-2--update-listing-model)
5. [Step 3 — Fix schema.js (Critical Bug!)](#step-3--fix-schemajs-critical-bug)
6. [Step 4 — validateReview Middleware](#step-4--validatereview-middleware)
7. [Step 5 — Create Review Route](#step-5--create-review-route)
8. [Step 6 — populate() in Show Route](#step-6--populate-in-show-route)
9. [Step 7 — Review Form in show.ejs](#step-7--review-form-in-showejs)
10. [Delete Review Route (Next Step)](#delete-review-route-next-step)
11. [Cascade Delete (Next Step)](#cascade-delete--mongoose-middleware)
12. [Common Mistakes & Fixes](#common-mistakes--fixes)

---

## WHAT IS A REVIEW?

A review is a **user's feedback** on a listing — it has:
- A **rating** (number from 1 to 5)
- A **comment** (text describing their experience)
- A **timestamp** (when it was created)

Each listing can have **many reviews**. Each review belongs to **one listing**.
This is a **One-to-Many relationship**.

---

## THE ONE-TO-MANY RELATIONSHIP

### How it works in MongoDB:
```
Listings collection:
{
  _id: ObjectId('abc'),
  title: "Cozy Beach House",
  reviews: [
    ObjectId('r1'),    ← Just the review's ID (reference)
    ObjectId('r2'),    ← Just the review's ID (reference)
  ]
}

Reviews collection:
{ _id: ObjectId('r1'), rating: 5, comment: "Amazing!", createdAt: Date }
{ _id: ObjectId('r2'), rating: 4, comment: "Very nice!", createdAt: Date }
```

### Why store just the ID (not the full review)?
- Reviews can be large (long comments)
- A listing could have hundreds of reviews
- Storing full reviews inside the listing makes the listing document too large
- **Reference approach** = listing stores just the ID, MongoDB fetches the full review on demand

---

## STEP 1 — REVIEW MODEL (`models/review.js`)

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: {
        type: String
        // Not required here — Joi handles that at the request level
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
        // Mongoose validates range (1-5) at DB level
        // Joi validates at request level (belt and suspenders!)
    },
    createdAt: {
        type: Date,
        default: Date.now    // Auto-filled when review is created
        // Date.now is a function reference (NOT Date.now() — no parentheses!)
        // Mongoose calls it when needed, so each review gets its own timestamp
    }
});

module.exports = mongoose.model('Review', reviewSchema);
// 'Review' → MongoDB creates 'reviews' collection (lowercase + plural)
```

### Why `default: Date.now` and not `default: Date.now()`?
```js
// WRONG — called immediately, all reviews get the SAME date (when server started!)
createdAt: { type: Date, default: Date.now() }

// CORRECT — passes the function reference, Mongoose calls it for EACH new review
createdAt: { type: Date, default: Date.now }
```

---

## STEP 2 — UPDATE LISTING MODEL

Add `reviews` field to `models/listing.js`:

```js
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String },
    image: {
        filename: String,
        url: { type: String, default: "https://unsplash.com/..." }
    },
    price:    { type: Number },
    location: { type: String },
    country:  String,

    // ↓ NEW FIELD: array of ObjectId references to Review documents
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
            // ref: 'Review' tells Mongoose:
            // "When you populate this, look in the 'Review' model's collection"
        }
    ]
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
```

### What `mongoose.Schema.Types.ObjectId` means:
- MongoDB gives every document a unique `_id` (called an ObjectId)
- `ObjectId('abc123def456...')` is a 24-character hex string
- By defining `type: ObjectId`, Mongoose knows this field stores references (not plain strings)
- This enables `populate()` to work

---

## STEP 3 — FIX SCHEMA.JS (CRITICAL BUG!)

### The Bug in your current `schema.js`:
```js
// ❌ CURRENT (broken!) — second export OVERWRITES the first!
module.exports.listingSchema = Joi.object({ ... });   // ← exported as listingSchema
module.exports.listingSchema = Joi.object({ ... });   // ← OVERWRITES! Now listingSchema = reviewSchema
// Result: listingSchema actually contains the review validation!
// This breaks listing validation silently
```

### The Fix — use a different name for the second export:
```js
// ✅ FIXED schema.js
const Joi = require('joi');

// Validates listing form data
module.exports.listingSchema = Joi.object({
    title:       Joi.string().required(),
    description: Joi.string().required(),
    price:       Joi.number().required().min(0),
    city:        Joi.string().required(),
    country:     Joi.string().required(),
    image:       Joi.string().allow("", null)
});

// Validates review form data — DIFFERENT NAME: reviewSchema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating:  Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
});
```

### Why the `review` wrapper in reviewSchema?
Your HTML form uses `name="review[rating]"` and `name="review[comment]"`:
```html
<input name="review[rating]">    → req.body = { review: { rating: 4 } }
<input name="review[comment]">   → req.body = { review: { comment: "Great!" } }
```
The `review` key wraps the review data — separating it from any other form fields on the same page.

---

## STEP 4 — validateReview MIDDLEWARE

In `app.js` (or in `routes/review.js` when you add Express Router):

```js
// Import both schemas
const { listingSchema, reviewSchema } = require('./schema.js');
// Also import Review model
const Review = require('./models/review.js');

// Validation middleware for review forms
const validateReview = (req, res, next) => {
    // Validate req.body against the review Joi schema
    let { error } = reviewSchema.validate(req.body);
    
    if (error) {
        // Collect all error messages (there could be multiple)
        let errMsg = error.details.map((el) => el.message).join(", ");
        // Throw a 400 Bad Request error — this gets caught by wrapAsync + error handler
        throw new expressError(400, errMsg);
    } else {
        // Data is valid, continue to the route handler
        next();
    }
};
```

### What `reviewSchema.validate(req.body)` checks:
```
req.body = { review: { rating: 4, comment: "Great place!" } }

Joi checks:
  1. Is 'review' key present?         YES ✅
  2. Is 'review' an object?           YES ✅
  3. Is 'review.rating' present?      YES ✅
  4. Is 'review.rating' a number?     YES ✅ (Joi auto-converts "4" → 4)
  5. Is 'review.rating' between 1-5?  YES ✅
  6. Is 'review.comment' present?     YES ✅
  7. Is 'review.comment' a string?    YES ✅
  8. Is 'review.comment' non-empty?   YES ✅

Result: { error: undefined, value: { review: { rating: 4, comment: "Great place!" } } }
→ Validation passes → next() called
```

```
req.body = { review: { rating: 7, comment: "" } }

Joi checks:
  5. Is 'review.rating' between 1-5?  NO ❌ → "review.rating" must be less than or equal to 5
  7. Is 'review.comment' non-empty?   NO ❌ → "review.comment" is not allowed to be empty

Result: { error: { details: [ {message: "..."}, {message: "..."} ] } }
→ Validation fails → throw expressError(400, "both error messages combined")
```

---

## STEP 5 — CREATE REVIEW ROUTE

In `app.js`, AFTER the show route:

```js
// POST /listings/:id/reviews
// :id = the listing this review belongs to
app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req, res) => {
    // Step 1: Find the listing we're adding a review to
    let listing = await Listing.findById(req.params.id);
    // req.params.id = the listing's MongoDB _id from the URL

    // Step 2: Create a new Review document
    const review = new Review({
        rating:  req.body.rating,   // From the form: name="review[rating]"
        comment: req.body.comment,  // From the form: name="review[comment]"
        // Note: If using wrapper key 'review', use req.body.review.rating instead
    });
    // At this point, review exists in memory but NOT saved to database yet

    // Step 3: Add the review's ID to the listing's reviews array
    listing.reviews.push(review);
    // listing.reviews was: [ ObjectId('existing') ]
    // Now it's: [ ObjectId('existing'), ObjectId(review._id) ]

    // Step 4: Save BOTH to the database
    await review.save();    // Save review to 'reviews' collection
    await listing.save();   // Save listing with updated reviews array

    // Step 5: Redirect back to the listing page to see the new review
    res.redirect(`/listings/${listing._id}`);
}));
```

### Why two separate saves?
```js
// review.save()   → writes the review document to the reviews collection
// listing.save()  → writes the listing document (with updated reviews array) to listings collection

// They are TWO SEPARATE database operations
// Order matters: save the review first, then save the listing with the review's ID
```

### The data flow:
```
User submits review form
    ↓
POST /listings/abc123/reviews
    ↓
validateReview runs (Joi check)
    ↓
wrapAsync wraps the async function
    ↓
Find listing with id 'abc123'
    ↓
Create new Review document in memory
    ↓
Push review._id into listing.reviews array
    ↓
Save review to 'reviews' collection
    ↓
Save listing to 'listings' collection (with updated reviews array)
    ↓
Redirect to /listings/abc123
```

---

## STEP 6 — populate() IN SHOW ROUTE

Without `populate()`, the show page can't display review content:

```js
// ❌ WITHOUT populate() — reviews are just IDs, can't display them
app.get('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    // listing.reviews = [ ObjectId('r1'), ObjectId('r2') ]
    // Can't display "rating: ???" because we only have the ID!
    res.render('listings/show.ejs', { listing });
}));

// ✅ WITH populate() — reviews are full objects, ready to display
app.get('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    // listing.reviews = [
    //   { _id: ObjectId('r1'), rating: 5, comment: "Amazing!", createdAt: Date },
    //   { _id: ObjectId('r2'), rating: 4, comment: "Very nice!", createdAt: Date }
    // ]
    // Now we can loop through them and display rating + comment!
    res.render('listings/show.ejs', { listing });
}));
```

### How `.populate('reviews')` works internally:
```
1. Mongoose executes: db.listings.findOne({ _id: 'abc' })
   → Gets: { ..., reviews: [ ObjectId('r1'), ObjectId('r2') ] }

2. Mongoose sees the 'reviews' field has ref: 'Review'
   → Executes: db.reviews.find({ _id: { $in: [ObjectId('r1'), ObjectId('r2')] } })
   → Gets: [ { rating: 5, comment: "..." }, { rating: 4, comment: "..." } ]

3. Mongoose replaces the ID array with the actual documents
   → Returns: { ..., reviews: [ { rating: 5, ... }, { rating: 4, ... } ] }
```

---

## STEP 7 — REVIEW FORM IN SHOW.EJS

Add to `views/listings/show.ejs`:

```html
<%- layout('layouts/boilerplate') %>

<!-- ... existing listing content ... -->

<!-- ====== REVIEW FORM ====== -->
<div class="review-section">
    <h3>Leave a Review</h3>
    
    <!-- Action: POST to /listings/:id/reviews -->
    <form action="/listings/<%= listing._id %>/reviews" method="POST" class="needs-validation" novalidate>
        
        <!-- Rating field — name="review[rating]" creates wrapper key -->
        <div class="form-group">
            <label for="rating">Rating (1-5)</label>
            <input type="number" 
                   id="rating" 
                   name="review[rating]"
                   min="1" 
                   max="5" 
                   class="form-control" 
                   required>
            <div class="invalid-feedback">Please give a rating between 1 and 5.</div>
        </div>
        
        <!-- Comment field — name="review[comment]" -->
        <div class="form-group">
            <label for="comment">Comment</label>
            <textarea id="comment" 
                      name="review[comment]" 
                      class="form-control" 
                      rows="3" 
                      required></textarea>
            <div class="invalid-feedback">Please write a comment.</div>
        </div>
        
        <button type="submit" class="btn btn-primary">Submit Review</button>
    </form>
</div>

<!-- ====== DISPLAY REVIEWS ====== -->
<div class="reviews-display">
    <h3>Reviews (<%= listing.reviews.length %>)</h3>
    
    <% if (listing.reviews.length === 0) { %>
        <p>No reviews yet. Be the first to review!</p>
    <% } else { %>
        <% for (let review of listing.reviews) { %>
            <div class="review-card">
                <!-- Star display: repeat ⭐ rating times -->
                <div class="review-rating">
                    <% for (let i = 0; i < review.rating; i++) { %>
                        <span>⭐</span>
                    <% } %>
                    <span class="rating-number"><%= review.rating %>/5</span>
                </div>
                <p class="review-comment"><%= review.comment %></p>
                <!-- Future: Add delete button here -->
            </div>
        <% } %>
    <% } %>
</div>
```

### Key form details:
| Form attribute | Value | Why |
|----------------|-------|-----|
| `action` | `/listings/<%= listing._id %>/reviews` | POST to create review for this specific listing |
| `method` | `POST` | Creating new data |
| `name="review[rating]"` | Creates `req.body.review.rating` | Matches `reviewSchema` wrapper key |
| `name="review[comment]"` | Creates `req.body.review.comment` | Matches `reviewSchema` wrapper key |

---

## DELETE REVIEW ROUTE (NEXT STEP)

> 📝 This is NOT yet implemented — you'll add this next!

### The route:
```js
// DELETE /listings/:id/reviews/:reviewId
app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    
    // Step 1: Remove reviewId from the listing's reviews array
    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
        // $pull removes the element from the array
    });
    
    // Step 2: Delete the actual review document
    await Review.findByIdAndDelete(reviewId);
    
    res.redirect(`/listings/${id}`);
}));
```

### The $pull operator:
```js
// $pull removes elements from an array that match a condition
await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
});
// Before: reviews: [ ObjectId('r1'), ObjectId('r2'), ObjectId('r3') ]
// After:  reviews: [ ObjectId('r1'), ObjectId('r3') ]  (r2 removed)
```

### Delete button in show.ejs:
```html
<% for (let review of listing.reviews) { %>
    <div class="review-card">
        <p><%= review.rating %>/5 — <%= review.comment %></p>
        
        <!-- DELETE form — POST with _method=DELETE override -->
        <form action="/listings/<%= listing._id %>/reviews/<%= review._id %>?_method=DELETE" method="POST">
            <button type="submit" class="btn btn-danger btn-sm">🗑️ Delete</button>
        </form>
    </div>
<% } %>
```

---

## CASCADE DELETE — MONGOOSE MIDDLEWARE

> 📝 This is NOT yet implemented — add it after delete review route!

### The Problem:
When you delete a listing, its reviews remain in the database (wasting space + polluting data).

### The Solution — post middleware on listingSchema:
```js
// In models/listing.js — add this AFTER defining listingSchema, BEFORE mongoose.model()

// Import Review model (needed to delete reviews)
const Review = require('./review');

// Post middleware: runs AFTER findOneAndDelete completes
listingSchema.post('findOneAndDelete', async function(deletedListing) {
    // 'deletedListing' is the document that was just deleted
    // Note: if already deleted or not found, deletedListing is null — check for it!
    if (deletedListing) {
        await Review.deleteMany({
            _id: { $in: deletedListing.reviews }
            // Find all reviews whose _id appears in the listing's reviews array
            // Delete them all in ONE database call
        });
    }
});
```

### When does this trigger?
```js
// In your DELETE route:
await Listing.findByIdAndDelete(id);
//            ↑ internally calls findOneAndDelete
//            ↑ which triggers the post middleware after deletion
// So your reviews are auto-deleted!
```

### The full updated models/listing.js:
```js
const mongoose = require('mongoose');
const Review = require('./review');   // ← Add this import

const listingSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String },
    image: {
        filename: String,
        url: { type: String, default: "https://..." }
    },
    price:    { type: Number },
    location: { type: String },
    country:  String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Post middleware — auto-delete reviews when a listing is deleted
listingSchema.post('findOneAndDelete', async function(deletedListing) {
    if (deletedListing) {
        await Review.deleteMany({ _id: { $in: deletedListing.reviews } });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
```

---

## COMMON MISTAKES & FIXES

| Mistake | What happens | Fix |
|---------|-------------|-----|
| `module.exports.listingSchema` used twice in schema.js | Second overwrites first — listing validation silently broken | Use `module.exports.reviewSchema` for the review schema |
| Forgot `.populate('reviews')` in show route | `listing.reviews` contains ObjectIds — can't display rating/comment | Add `.populate('reviews')` to `Listing.findById(id)` |
| Form uses `name="rating"` instead of `name="review[rating]"` | `req.body = { rating: 4 }` — doesn't match reviewSchema `{ review: { rating: 4 } }` | Use `name="review[rating]"` to create the wrapper key |
| Forgot `await review.save()` | Review created in memory but NOT persisted to database | Always `await review.save()` before `await listing.save()` |
| Forgot `await listing.save()` after push | listing.reviews updated in memory but NOT saved to database | Always save listing after pushing a review to its array |
| Using wrong `req.body` keys | `req.body.rating` instead of `req.body.review.rating` when using wrapper form | Check your form's `name` attributes match how you access `req.body` |
| `listing` is null in review route | The listing with that ID doesn't exist | Add a check: `if (!listing) throw new expressError(404, 'Listing not found')` |

---

## 🧠 REVIEWS QUICK REFERENCE

### Route table for reviews:
| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/listings/:id/reviews` | Create a new review for listing `:id` ✅ Done |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Delete review `:reviewId` from listing `:id` 🔜 Next |

### Files modified for Reviews feature:
| File | Change |
|------|--------|
| `models/review.js` | **Created** — Review model with rating, comment, createdAt |
| `models/listing.js` | **Updated** — Added `reviews` array field |
| `schema.js` | **Updated** — Added `reviewSchema` export (keep `listingSchema` too!) |
| `app.js` | **Updated** — Added `Review` require, `validateReview`, POST review route, `.populate('reviews')` in SHOW route |
| `views/listings/show.ejs` | **Updated** — Added review form + review display loop |

---

> 📝 **This file documents Reviews Phase — update it when you add delete route and cascade delete!**

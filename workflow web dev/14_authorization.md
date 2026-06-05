# 🔑 AUTHORIZATION — Complete Guide
> How to restrict what logged-in users can do
> isLoggedIn + isOwner middleware + protecting routes + redirect after login
> Phase 14 of your Wanderlust (Airbnb Clone) project

---

## 📋 TABLE OF CONTENTS
1. [What is Authorization?](#what-is-authorization)
2. [The Two Middleware You Need](#the-two-middleware-you-need)
3. [Step 1 — isLoggedIn Middleware](#step-1--isloggedin-middleware)
4. [Step 2 — Redirect After Login (savedUrl)](#step-2--redirect-after-login-savedurl)
5. [Step 3 — Add Owner to Listing Model](#step-3--add-owner-to-listing-model)
6. [Step 4 — Save Owner on Listing Create](#step-4--save-owner-on-listing-create)
7. [Step 5 — isOwner Middleware](#step-5--isowner-middleware)
8. [Step 6 — Protect All Routes](#step-6--protect-all-routes)
9. [Step 7 — Hide Edit/Delete Buttons in Views](#step-7--hide-editdelete-buttons-in-views)
10. [Authorization for Reviews](#authorization-for-reviews)
11. [The Full Authorization Flow](#the-full-authorization-flow)
12. [Common Mistakes & Fixes](#common-mistakes--fixes)
13. [Quick Reference](#quick-reference)

---

## WHAT IS AUTHORIZATION?

Authorization = **"What are you allowed to do?"**

After authentication tells us WHO the user is, authorization decides what they're ALLOWED to do.

```
Without authorization (broken):
  Aman logs in → can edit/delete ANY listing, even listings made by other users!
  Anyone not logged in → can still access /listings/new and create listings!

With authorization (correct):
  ✅ Only logged-in users can create listings
  ✅ Only the OWNER of a listing can edit or delete it
  ✅ Logged-out users trying to access /listings/new → redirected to /login
  ✅ After logging in → redirected back to where they were trying to go
```

### The two types of checks:
| Check | Question | Middleware |
|-------|----------|-----------|
| **Is user logged in?** | Is there a `req.user`? | `isLoggedIn` |
| **Does user own this?** | Is `listing.owner` === `req.user._id`? | `isOwner` |

---

## THE TWO MIDDLEWARE YOU NEED

### Overview:
```
isLoggedIn → checks if req.user exists (passport sets this if session is valid)
  Used on: /listings/new (GET), POST /listings, GET /:id/edit, PUT /:id, DELETE /:id

isOwner → checks if listing.owner matches req.user._id
  Used on: GET /:id/edit, PUT /:id, DELETE /:id (only after isLoggedIn!)
```

### Where to put them:
```js
// In route/listing.js — add as middleware PARAMETERS in your routes:

// Only logged-in users can see the "new listing" form:
router.get('/new', isLoggedIn, (req, res) => { ... });

// Only logged-in users can create a listing:
router.post('/', isLoggedIn, validateListing, wrapAsync(async (req, res) => { ... }));

// Only the OWNER can see the edit form or update/delete the listing:
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req, res) => { ... }));
router.put('/:id',      isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => { ... }));
router.delete('/:id',   isLoggedIn, isOwner, wrapAsync(async (req, res) => { ... }));
```

---

## STEP 1 — `isLoggedIn` MIDDLEWARE

Add this function to `route/listing.js` (or create a separate `middleware/auth.js` file):

```js
// ============================================================
//   isLoggedIn — Redirect to login if user is not authenticated
// ============================================================
const isLoggedIn = (req, res, next) => {
    // req.isAuthenticated() is added by Passport
    // Returns true if req.user exists (valid session), false otherwise
    if (!req.isAuthenticated()) {
        // Save the URL the user was trying to visit
        // So after login we can redirect them back there (see Step 2)
        req.session.redirectUrl = req.originalUrl;
        //                        ↑ The full URL they tried to access
        //                          e.g. "/listings/new" or "/listings/abc123/edit"

        req.flash('error', 'You must be logged in to do that!');
        return res.redirect('/login');
    }
    next();  // User IS logged in → continue to route handler
};
```

### How `req.isAuthenticated()` works:
```
When user is logged in:
  → Passport set req.user via deserializeUser
  → req.isAuthenticated() returns true ✅
  → next() is called → route continues

When user is NOT logged in:
  → req.user is undefined
  → req.isAuthenticated() returns false ❌
  → Save their intended URL in session
  → Flash error message
  → Redirect to /login
```

---

## STEP 2 — REDIRECT AFTER LOGIN (`savedUrl`)

Without this, after login the user is ALWAYS sent to `/listings` — even if they were trying to visit `/listings/new`. This is bad UX.

### The problem:
```
1. User (not logged in) tries to go to /listings/abc123/edit
2. isLoggedIn redirects them to /login
3. User logs in successfully
4. They get sent to /listings (home) — they have to navigate back manually!

Better behavior:
1. User tries /listings/abc123/edit
2. isLoggedIn saves "/listings/abc123/edit" in session, redirects to /login
3. User logs in successfully
4. They get redirected BACK to /listings/abc123/edit automatically ✅
```

### Step 2a — Save the URL in `isLoggedIn` (already done above):
```js
req.session.redirectUrl = req.originalUrl;  // Saves the intended URL
```

### Step 2b — Create a middleware to copy it to `res.locals`:
```js
// ============================================================
//   saveRedirectUrl — Preserve the redirectUrl before passport clears the session
// ============================================================
const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        // Why copy to res.locals?
        // passport.authenticate() can RESET the session (clears req.session.redirectUrl)
        // res.locals persists through the request even if session changes
    }
    next();
};
```

### Step 2c — Use it in the POST /login route (`route/auth.js`):
```js
// Add saveRedirectUrl BEFORE passport.authenticate()
router.post('/login',
    saveRedirectUrl,          // ← Run this FIRST to copy URL to res.locals
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login',
    }),
    (req, res) => {
        req.flash('success', `Welcome back, ${req.user.username}!`);
        // Use saved URL if it exists, otherwise go to /listings
        const redirectUrl = res.locals.redirectUrl || '/listings';
        res.redirect(redirectUrl);
    }
);
```

### The full flow with savedUrl:
```
1. User (not logged in) visits /listings/abc123/edit
2. isLoggedIn runs:
   → req.session.redirectUrl = "/listings/abc123/edit"
   → redirect to /login
3. saveRedirectUrl runs (on POST /login):
   → res.locals.redirectUrl = "/listings/abc123/edit"
   (copied from session to locals BEFORE passport might reset it)
4. passport.authenticate() runs → credentials OK
5. Route handler: res.redirect(res.locals.redirectUrl)
   → User goes to /listings/abc123/edit ✅
```

---

## STEP 3 — ADD OWNER TO LISTING MODEL

We need to know WHO created each listing so we can check ownership.

Update `models/listing.js`:

```js
const mongoose = require('mongoose');
const Review = require('./review');

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
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],

    // ↓ NEW FIELD: who created this listing
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',       // References the User model
        // Not required: true (for backward compatibility with existing listings)
    }
});

listingSchema.post('findOneAndDelete', async function(deletedListing) {
    if (deletedListing) {
        await Review.deleteMany({ _id: { $in: deletedListing.reviews } });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
```

### What this does:
```
Before: listings collection in MongoDB had no owner field
  { _id: 'abc', title: 'Beach House', price: 1500, ... }

After: each listing stores the owner's _id
  { _id: 'abc', title: 'Beach House', price: 1500, owner: ObjectId('user_abc'), ... }

Now we can check:
  listing.owner.equals(req.user._id)  → true if the logged-in user created this listing
```

---

## STEP 4 — SAVE OWNER ON LISTING CREATE

Update the POST `/listings` route in `route/listing.js`:

```js
// CREATE route — save the logged-in user as the owner
router.post('/', isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    let { title, description, price, city, country } = req.body;

    const newListing = new Listing({
        title,
        description,
        price,
        location: city,
        country,
    });

    // Set the owner to the currently logged-in user
    newListing.owner = req.user._id;
    //                  ↑ req.user is set by Passport (deserializeUser)
    //                  ↑ req.user._id = the logged-in user's MongoDB _id

    await newListing.save();
    req.flash('success', 'Listing created successfully!');
    res.redirect('/listings');
}));
```

### Why `req.user._id` and not `req.user.id`?
```js
// Both work! Mongoose adds a virtual getter:
req.user._id  → returns the raw ObjectId (e.g. ObjectId('abc123'))
req.user.id   → returns the string version (e.g. 'abc123')

// When comparing, use .equals() — it handles both ObjectId and string comparison:
listing.owner.equals(req.user._id)  // ✅ correct
listing.owner === req.user._id      // ❌ wrong — comparing objects with ===
```

---

## STEP 5 — `isOwner` MIDDLEWARE

Add this to `route/listing.js`:

```js
// ============================================================
//   isOwner — Check if the logged-in user owns this listing
// ============================================================
const isOwner = wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    // Check if the listing exists first
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }

    // Compare listing's owner with logged-in user's _id
    if (!listing.owner.equals(req.user._id)) {
        // .equals() is Mongoose's method for comparing ObjectIds
        // Don't use === (compares object references, not values)
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }

    next();  // Ownership confirmed → continue
});
```

### Why `.equals()` and not `===`?
```js
// MongoDB ObjectIds are OBJECTS, not strings:
console.log(listing.owner);      // ObjectId('64a7b8c9d0e1f2a3b4c5d6e7')
console.log(req.user._id);       // ObjectId('64a7b8c9d0e1f2a3b4c5d6e7')

listing.owner === req.user._id   // ❌ false — comparing two different object references
listing.owner.equals(req.user._id) // ✅ true  — Mongoose compares the actual ID values

// Alternatively, convert both to strings:
listing.owner.toString() === req.user._id.toString()  // ✅ also works
```

---

## STEP 6 — PROTECT ALL ROUTES

Here is the **complete updated `route/listing.js`** with all authorization middleware added:

```js
const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listing');

// ============================================================
//   MIDDLEWARE DEFINITIONS
// ============================================================

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    } else {
        next();
    }
};

// Check if user is logged in (Passport provides req.isAuthenticated())
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;  // Save intended URL
        req.flash('error', 'You must be logged in to do that!');
        return res.redirect('/login');
    }
    next();
};

// Check if logged-in user owns this listing
const isOwner = wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    if (!listing.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
});

// ============================================================
//   ROUTES (with authorization middleware added)
// ============================================================

// INDEX — no auth needed (everyone can browse)
router.get('/', wrapAsync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render('listings/index.ejs', { listings: alllistings });
}));

// NEW — must be logged in to see the create form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('listings/new.ejs');
});

// CREATE — must be logged in to create a listing
router.post('/', isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    let { title, description, price, city, country } = req.body;
    const newListing = new Listing({ title, description, price, location: city, country });
    newListing.owner = req.user._id;     // ← Save owner
    await newListing.save();
    req.flash('success', 'Listing created successfully!');
    res.redirect('/listings');
}));

// EDIT — must be logged in AND must be the owner
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    res.render('listings/edit.ejs', { listing });
}));

// UPDATE — must be logged in AND must be the owner
router.put('/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    let { title, description, price, city, country } = req.body;
    await Listing.findByIdAndUpdate(id, { title, description, price, location: city, country });
    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
}));

// DELETE — must be logged in AND must be the owner
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
}));

// SHOW — no auth needed (everyone can view a listing)
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews').populate('owner');
    //                                                               ↑ Populate owner so we
    //                                                                 can show owner info in show.ejs
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    res.render('listings/show.ejs', { listing });
}));

module.exports = router;
```

---

## STEP 7 — HIDE EDIT/DELETE BUTTONS IN VIEWS

Just protecting the routes is not enough — we also need to hide the edit/delete buttons from users who don't own the listing.

In `views/listings/show.ejs`:

```html
<!-- Show listing details ... -->

<!-- Only show Edit/Delete buttons if the current user is the owner -->
<% if (currentUser && listing.owner && listing.owner.equals(currentUser._id)) { %>

    <!-- Edit button -->
    <a href="/listings/<%= listing._id %>/edit" class="btn btn-warning">
        <i class="fa-solid fa-pen"></i> Edit
    </a>

    <!-- Delete button -->
    <form action="/listings/<%= listing._id %>?_method=DELETE" method="POST" style="display:inline;">
        <button type="submit" class="btn btn-danger">
            <i class="fa-solid fa-trash"></i> Delete
        </button>
    </form>

<% } %>
```

### Why we check BOTH the route AND the view:
```
Route protection (isOwner middleware):
  → Prevents the actual edit/delete ACTION from happening
  → Even if someone manually types /listings/abc/edit in the URL bar
  → This is the real security layer

View hiding (the <% if %> check):
  → Just improves UX — don't show buttons that won't work
  → NOT a security measure on its own (anyone can bypass HTML)
  → Always do BOTH — hide in view AND protect the route!
```

### Check both `currentUser` AND `listing.owner`:
```js
// ❌ UNSAFE — what if listing has no owner? (old listings from before auth was added)
<% if (listing.owner.equals(currentUser._id)) { %>

// ✅ SAFE — check both exist before comparing
<% if (currentUser && listing.owner && listing.owner.equals(currentUser._id)) { %>
//   ↑ is user logged in?
//                 ↑ does this listing have an owner?
//                               ↑ does the owner match the logged-in user?
```

---

## AUTHORIZATION FOR REVIEWS

Users should only be able to delete their OWN reviews. To support this:

### Add `author` to Review model (`models/review.js`):
```js
const reviewSchema = new Schema({
    comment:   { type: String },
    rating:    { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },

    // ↓ NEW: who wrote this review
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});
```

### Save author in POST review route (`route/review.js`):
```js
router.post('/:id/reviews', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    const { rating, comment } = req.body.review;
    const review = new Review({ rating, comment });

    review.author = req.user._id;   // ← Save author

    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash('success', 'Review created successfully!');
    res.redirect(`/listings/${listing._id}`);
}));
```

### isReviewAuthor middleware for DELETE review (`route/review.js`):
```js
const isReviewAuthor = wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to delete this review!');
        return res.redirect(`/listings/${id}`);
    }
    next();
});

// Apply to DELETE route:
router.delete('/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/listings/${id}`);
}));
```

### Hide delete button in show.ejs for reviews:
```html
<% for (let review of listing.reviews) { %>
    <div class="review-card">
        <!-- Show author username (populate review.author in SHOW route!) -->
        <p><strong><%= review.author ? review.author.username : 'Anonymous' %></strong></p>
        <p>Rating: <%= review.rating %>/5</p>
        <p><%= review.comment %></p>

        <!-- Only show delete button if current user wrote this review -->
        <% if (currentUser && review.author && review.author.equals(currentUser._id)) { %>
            <form action="/listings/<%= listing._id %>/reviews/<%= review._id %>?_method=DELETE" method="POST">
                <button type="submit" class="btn btn-danger btn-sm">Delete</button>
            </form>
        <% } %>
    </div>
<% } %>
```

### Update SHOW route to populate review authors:
```js
// In route/listing.js — update the SHOW route:
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: { path: 'author' }  // ← Nested populate: get the review author's info
        })
        .populate('owner');               // ← Also populate listing owner
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    res.render('listings/show.ejs', { listing });
}));
```

---

## THE FULL AUTHORIZATION FLOW

```
Scenario: Logged-out user tries to edit a listing
────────────────────────────────────────────────────────
1. User visits /listings/abc123/edit (not logged in)
2. isLoggedIn runs → req.isAuthenticated() = false
3. Saves req.session.redirectUrl = "/listings/abc123/edit"
4. Flash: "You must be logged in to do that!"
5. Redirect to /login

6. User fills in login form → POST /login
7. saveRedirectUrl runs → res.locals.redirectUrl = "/listings/abc123/edit"
8. passport.authenticate() runs → credentials correct ✅
9. Route handler: res.redirect('/listings/abc123/edit') ← back to intended page!

10. GET /listings/abc123/edit (now logged in)
11. isLoggedIn → req.isAuthenticated() = true ✅ → next()
12. isOwner → listing.owner.equals(req.user._id)?
    → YES → next() → shows edit form ✅
    → NO  → flash error → redirect to /listings/abc123

────────────────────────────────────────────────────────
Scenario: Wrong user tries to delete via URL manipulation
────────────────────────────────────────────────────────
1. User "bob" is logged in but visits /listings/abc123 (owned by "aman")
2. Bob manually sends DELETE /listings/abc123 (via Postman or browser trick)
3. isLoggedIn → Bob IS logged in → next()
4. isOwner → listing.owner (aman's _id) vs req.user._id (bob's _id) → NOT equal!
5. Flash: "You do not have permission to do that!"
6. Redirect to /listings/abc123

Bob CANNOT delete Aman's listing even if he's logged in ✅
```

---

## COMMON MISTAKES & FIXES

| Mistake | What happens | Fix |
|---------|-------------|-----|
| Using `===` to compare ObjectIds | Always returns false even if IDs are identical | Use `.equals()` method: `listing.owner.equals(req.user._id)` |
| Only hiding button in view, no route protection | Users can bypass HTML and send DELETE request directly | ALWAYS protect the route too with `isOwner` middleware |
| `isOwner` BEFORE `isLoggedIn` | `req.user` is undefined → `req.user._id` throws error | Always put `isLoggedIn` first, then `isOwner` |
| Forgot to populate `owner` in SHOW route | `listing.owner` is just an ObjectId → `.equals()` still works BUT can't display owner name | Add `.populate('owner')` to SHOW route |
| Forgot `review.author` field in review model | Can't track who wrote which review | Add `author: { type: ObjectId, ref: 'User' }` to reviewSchema |
| `req.session.redirectUrl` cleared by passport | After login, redirectUrl is lost → always goes to /listings | Use `saveRedirectUrl` middleware to copy it to `res.locals` before passport runs |
| Old listings have no `owner` field | `listing.owner` is null → `.equals()` throws error | Check `listing.owner &&` before calling `.equals()` |

---

## 🧠 QUICK REFERENCE

### Middleware summary:
| Middleware | When to use | What it does |
|------------|------------|-------------|
| `isLoggedIn` | Before any route that needs auth | Redirects to /login if not authenticated |
| `saveRedirectUrl` | In POST /login, before passport | Copies redirectUrl from session to res.locals |
| `isOwner` | On edit/update/delete routes (after isLoggedIn) | 403 redirect if user doesn't own the listing |
| `isReviewAuthor` | On delete review route (after isLoggedIn) | 403 redirect if user didn't write the review |

### Route protection table:
| Method | Path | Middleware needed |
|--------|------|-----------------|
| `GET` | `/listings` | None — public |
| `GET` | `/listings/new` | `isLoggedIn` |
| `POST` | `/listings` | `isLoggedIn` |
| `GET` | `/listings/:id` | None — public |
| `GET` | `/listings/:id/edit` | `isLoggedIn`, `isOwner` |
| `PUT` | `/listings/:id` | `isLoggedIn`, `isOwner` |
| `DELETE` | `/listings/:id` | `isLoggedIn`, `isOwner` |
| `POST` | `/listings/:id/reviews` | `isLoggedIn` |
| `DELETE` | `/listings/:id/reviews/:reviewId` | `isLoggedIn`, `isReviewAuthor` |

### Files created/modified for Authorization:
| File | Change |
|------|--------|
| `models/listing.js` | **Updated** — Added `owner` field (ref: 'User') |
| `models/review.js` | **Updated** — Added `author` field (ref: 'User') |
| `route/listing.js` | **Updated** — Added `isLoggedIn` + `isOwner` middleware to routes, save owner on create |
| `route/review.js` | **Updated** — Added `isLoggedIn` + `isReviewAuthor` middleware, save author on create |
| `route/auth.js` | **Updated** — Added `saveRedirectUrl` to POST /login |
| `views/listings/show.ejs` | **Updated** — Conditionally show edit/delete buttons, show delete on reviews |

### The essential ownership check:
```js
// In isOwner middleware — always use .equals() for ObjectId comparison:
if (!listing.owner.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/listings/${id}`);
}
```

### The essential view check (in EJS):
```html
<% if (currentUser && listing.owner && listing.owner.equals(currentUser._id)) { %>
    <!-- Edit / Delete buttons here -->
<% } %>
```

---

> 📝 **Next step:** After auth + authorization is complete, move to Phase 15 — **Image Upload** with `multer` + `cloudinary`. Users will be able to upload real photos for their listings instead of just entering an image URL.

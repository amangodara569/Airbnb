# 🎨 EJS TEMPLATES - Complete Guide
> Everything about EJS (Embedded JavaScript) — templating, layouts, partials, forms
> All examples from YOUR Wanderlust project

---

## 📋 TABLE OF CONTENTS
1. [What is EJS?](#what-is-ejs)
2. [EJS Syntax — The 3 Tags](#ejs-syntax--the-3-tags-you-need)
3. [Setup in Express](#setup-in-express)
4. [Layouts with ejs-mate](#layouts-with-ejs-mate)
5. [Partials (Includes)](#partials-includes)
6. [Passing Data to Templates](#passing-data-to-templates)
7. [Loops and Conditionals](#loops-and-conditionals)
8. [Forms — Create & Edit](#forms--create--edit)
9. [method-override (PUT/DELETE)](#method-override--putdelete-from-forms)
10. [Client-Side Form Validation](#client-side-form-validation)
11. [Your Complete Template Structure](#your-complete-template-structure)

---

## WHAT IS EJS?

- **EJS = Embedded JavaScript**
- A template engine that lets you write HTML with JavaScript mixed in
- The server **processes** the EJS file → replaces JS parts with actual data → sends **pure HTML** to the browser
- The browser NEVER sees EJS code — it only gets normal HTML

### Flow:
```
User visits /listings
    ↓
Express route runs: res.render('listings/index.ejs', { listings: data })
    ↓
EJS engine processes the template (replaces <%= %> with real data)
    ↓
Pure HTML is sent to the browser
    ↓
User sees the page
```

---

## EJS SYNTAX — THE 3 TAGS YOU NEED

### 1. `<%= %>` — Output (prints value into HTML)
```html
<h1><%= listing.title %></h1>
<!-- If listing.title = "Cozy Cottage", HTML becomes: -->
<!-- <h1>Cozy Cottage</h1> -->
```

### 2. `<% %>` — Logic (runs JS but doesn't output anything)
```html
<% if (listings.length > 0) { %>
    <p>We have listings!</p>
<% } else { %>
    <p>No listings available.</p>
<% } %>
```

### 3. `<%- %>` — Unescaped output (outputs raw HTML)
```html
<%- include("../includes/navbar.ejs") %>
<!-- Used for including partials and layouts -->
<!-- Also used when you want to render actual HTML tags -->
```

### Quick Comparison:
| Tag | Purpose | Example | When to use |
|-----|---------|---------|------------|
| `<%= %>` | Output escaped text | `<%= listing.title %>` | Displaying data (SAFE — prevents XSS) |
| `<% %>` | Run JS logic | `<% if (x > 5) { %>` | Loops, conditionals, variables |
| `<%- %>` | Output raw HTML | `<%- include("file") %>` | Including partials, rendering HTML |

### ⚠️ Security Note:
- `<%= %>` is SAFE — it escapes HTML characters (prevents script injection)
- `<%- %>` is DANGEROUS — it renders raw HTML (never use with user input!)

```html
<!-- SAFE: If user types <script>alert('hacked')</script> as title -->
<%= listing.title %>
<!-- Output: &lt;script&gt;alert('hacked')&lt;/script&gt; (harmless text) -->

<!-- DANGEROUS: -->
<%- listing.title %>
<!-- Output: <script>alert('hacked')</script> (actual script runs! BAD!) -->
```

---

## SETUP IN EXPRESS

### Install:
```bash
npm install ejs ejs-mate
```

### Configure in app.js:
```js
const path = require('path');
const ejsMate = require('ejs-mate');

// Tell Express to use EJS as the template engine
app.set('view engine', 'ejs');

// Tell Express where to find templates
app.set('views', path.join(__dirname, 'views/'));

// Use ejs-mate for layout support
app.engine('ejs', ejsMate);
```

### Why `path.join(__dirname, 'views/')`?
- `__dirname` = the folder where `app.js` is located
- `path.join()` = safely combines paths (handles `/` differences between Windows/Linux)
- This way, your app works no matter which folder you run `node app.js` from

---

## LAYOUTS WITH EJS-MATE

### What is a Layout?
- A **wrapper template** that contains the common HTML structure
- Header, navbar, footer, CSS links, JS scripts — all in ONE place
- Individual pages just fill in the **body** content

### Your Layout (`views/layouts/boilerplate.ejs`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wanderlust</title>
    <!-- CSS files -->
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/animations.css">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
</head>
<body style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); min-height: 100vh;">
    
    <!-- Navbar (included from partials) -->
    <%- include("../includes/navbar.ejs") %>
    
    <!-- Page Content (THIS IS WHERE EACH PAGE'S CONTENT GOES) -->
    <div class="container-fluid" style="padding: 0; margin: 0;">
        <%- body %>
    </div>
    
    <!-- Footer (included from partials) -->
    <%- include("../includes/footer.ejs") %>
    
    <!-- Wave Animation -->
    <div class="wave-container">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Your custom JS -->
    <script src="/js/script.js"></script>
</body>
</html>
```

### How pages use the layout:
```html
<!-- index.ejs, show.ejs, new.ejs, edit.ejs — all start with this: -->
<%- layout('layouts/boilerplate') %>

<!-- Everything below this line becomes the <%- body %> in the layout -->
<h1>This goes inside the layout!</h1>
```

### Visual Flow:
```
boilerplate.ejs:
┌──────────────────────────┐
│ <head>...</head>         │
│ <body>                   │
│   ┌─ navbar.ejs ──────┐  │
│   └────────────────────┘  │
│   ┌─ <%- body %> ─────┐  │  ← THIS gets replaced by your page content
│   │ (index.ejs content)│  │
│   │ (show.ejs content) │  │
│   │ (new.ejs content)  │  │
│   └────────────────────┘  │
│   ┌─ footer.ejs ──────┐  │
│   └────────────────────┘  │
│ </body>                  │
└──────────────────────────┘
```

---

## PARTIALS (INCLUDES)

### What are partials?
- **Reusable chunks of HTML** stored in separate files
- Used for components that appear on multiple pages (navbar, footer)
- Keeps code DRY (Don't Repeat Yourself)

### Your partials:

#### Navbar (`views/includes/navbar.ejs`):
```html
<nav class="navbar navbar-expand-md navbar-dark sticky-top" style="...glassmorphism styles...">
    <a class="navbar-brand" href="/">WANDERLUST</a>
    <button class="navbar-toggler" ...>
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

#### Footer (`views/includes/footer.ejs`):
```html
<footer style="...glassmorphism styles...">
    <div class="f-info">
        <div class="f-info-socials">
            <i class="fa-brands fa-fort-awesome"></i>
            <!-- more icons -->
        </div>
        <div class="f-info-brand">WANDERLUST PRIVATE LIMITED</div>
        <div class="f-info-links">
            <a href="#">Contact Us</a>
            <a href="/terms">Terms and Conditions</a>
            <a href="/privacy">Privacy Policy</a>
        </div>
    </div>
</footer>
```

### How to include partials:
```html
<%- include("../includes/navbar.ejs") %>
<%- include("../includes/footer.ejs") %>
```
- Use `<%-` (not `<%=`) because you want RAW HTML to be rendered
- Path is relative to the current file

---

## PASSING DATA TO TEMPLATES

### From route to template:
```js
// In app.js (route handler)
app.get('/listings', async (req, res) => {
    const alllistings = await Listing.find({});
    
    // Pass data as second argument to res.render()
    res.render('listings/index.ejs', { listings: alllistings });
    //         ↑ template path        ↑ data object
    //                                  key: value
    //                                  'listings' = name used in template
    //                                  alllistings = actual data
});
```

### Using the data in template:
```html
<!-- index.ejs -->
<% for (let listing of listings) { %>
    <h5><%= listing.title %></h5>
    <p><%= listing.description %></p>
    <p>₹<%= listing.price %></p>
<% } %>
```

### Multiple data values:
```js
res.render('listings/show.ejs', { 
    listing: foundListing,
    // In future you'll add more:
    // currentUser: req.user,
    // reviews: allReviews,
});
```

---

## LOOPS AND CONDITIONALS

### For Loop (used in your index.ejs):
```html
<% for (let listing of listings) { %>
    <div class="listing-card">
        <img src="<%= listing.image.url %>" alt="<%= listing.title %>">
        <h5><%= listing.title %></h5>
        <p>₹<%= listing.price %>/night</p>
        <a href="/listings/<%= listing._id %>">View Listing</a>
    </div>
<% } %>
```

### If-Else (used in your index.ejs):
```html
<% if (listings.length > 0) { %>
    <!-- Show all the listings -->
    <div class="listings-grid">
        <% for (let listing of listings) { %>
            <!-- listing cards -->
        <% } %>
    </div>
<% } else { %>
    <p>No listings available.</p>
<% } %>
```

### Ternary Operator (one-line if-else):
```html
<p><%= listing.description ? listing.description : 'No description available' %></p>
```

---

## FORMS — CREATE & EDIT

### Create Form (`views/listings/new.ejs`):
```html
<%- layout('layouts/boilerplate') %>

<div class="form-container">
    <h1>Create New Listing</h1>
    
    <!-- POST to /listings — triggers the CREATE route -->
    <form method="POST" action="/listings" novalidate class="needs-validation">
        
        <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" placeholder="Enter listing title" required>
            <!-- 'name' attribute = the key in req.body -->
            <!-- name="title" → req.body.title -->
            <div class="valid-feedback">looks good!</div>
            <div class="invalid-feedback">Please fill out this field.</div>
        </div>
        
        <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" placeholder="Describe your listing" required></textarea>
        </div>
        
        <div class="form-group">
            <label for="price">Price (per night)</label>
            <input type="number" id="price" name="price" placeholder="Enter price" step="0.01" required>
        </div>
        
        <div class="form-group">
            <label for="city">Location</label>
            <input type="text" id="city" name="city" placeholder="Enter city/location" required>
        </div>
        
        <div class="form-group">
            <label for="country">Country</label>
            <input type="text" id="country" name="country" placeholder="Enter country" required>
        </div>
        
        <button type="submit">Create Listing</button>
    </form>
</div>
```

### Edit Form (`views/listings/edit.ejs`):
```html
<%- layout('layouts/boilerplate') %>

<div class="form-container">
    <h1>Edit Listing</h1>
    
    <!-- POST + method override → becomes PUT /listings/:id -->
    <form action="/listings/<%= listing._id %>?_method=PUT" method="POST">
        
        <div class="form-group">
            <label for="title">Title</label>
            <!-- value="..." pre-fills the form with existing data -->
            <input type="text" id="title" name="title" value="<%= listing.title %>" required>
        </div>
        
        <div class="form-group">
            <label for="description">Description</label>
            <!-- For textarea, content goes BETWEEN tags, not in value attribute -->
            <textarea id="description" name="description" required><%= listing.description %></textarea>
        </div>
        
        <div class="form-group">
            <label for="price">Price</label>
            <input type="number" id="price" name="price" value="<%= listing.price %>" required>
        </div>
        
        <div class="form-group">
            <label for="city">Location</label>
            <input type="text" id="city" name="city" value="<%= listing.location %>" required>
        </div>
        
        <div class="form-group">
            <label for="country">Country</label>
            <input type="text" id="country" name="country" value="<%= listing.country %>" required>
        </div>
        
        <button type="submit">Update Listing</button>
        <a href="/listings/<%= listing._id %>">Cancel</a>
    </form>
</div>
```

### Key differences between Create and Edit forms:
| Feature | Create (new.ejs) | Edit (edit.ejs) |
|---------|-----------------|----------------|
| Form action | `/listings` | `/listings/<%= listing._id %>?_method=PUT` |
| HTTP method | POST | POST (with method override to PUT) |
| Input values | Empty (placeholder only) | Pre-filled with `value="<%= listing.title %>"` |
| Button text | "Create Listing" | "Update Listing" |

---

## METHOD-OVERRIDE — PUT/DELETE FROM FORMS

### The Problem:
- HTML forms can ONLY send `GET` and `POST` requests
- But RESTful routes need `PUT` (update) and `DELETE` (delete) too
- `method-override` package solves this

### Setup:
```js
// In app.js
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
```

### Usage in forms:

#### For PUT (Update):
```html
<!-- The form sends POST, but _method=PUT tells Express to treat it as PUT -->
<form action="/listings/<%= listing._id %>?_method=PUT" method="POST">
    <!-- form fields -->
    <button type="submit">Update</button>
</form>
```

#### For DELETE:
```html
<!-- The form sends POST, but _method=DELETE tells Express to treat it as DELETE -->
<form action="/listings/<%= listing._id %>?_method=DELETE" method="POST">
    <button type="submit">Delete Listing</button>
</form>
```

### How it works:
```
Form sends: POST /listings/abc123?_method=DELETE
                                   ↑
method-override reads this ────────┘
Express receives it as: DELETE /listings/abc123
```

---

## CLIENT-SIDE FORM VALIDATION

### Your validation script (`public/js/script.js`):
```js
// Bootstrap's built-in validation
(() => {
    'use strict'
    
    // Find all forms with class 'needs-validation'
    const forms = document.querySelectorAll('.needs-validation')
    
    // Add event listener to each form
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            // If form is not valid, prevent submission
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            // Add Bootstrap validation styles
            form.classList.add('was-validated')
        }, false)
    })
})()
```

### How it works:
1. Form has `class="needs-validation"` and `novalidate` (disable browser default validation)
2. Each input has `required` attribute
3. On submit, script checks if all required fields are filled
4. If not → shows Bootstrap validation feedback (red/green borders and messages)
5. If yes → form submits normally

### Validation feedback HTML:
```html
<input type="text" name="title" required>
<div class="valid-feedback">looks good!</div>        <!-- Green — shown when valid -->
<div class="invalid-feedback">Please fill out this field.</div>  <!-- Red — shown when invalid -->
```

---

## YOUR COMPLETE TEMPLATE STRUCTURE

```
views/
├── layouts/
│   └── boilerplate.ejs     ← Main wrapper (head, body, navbar, footer, scripts)
│
├── includes/
│   ├── navbar.ejs           ← Navigation bar (Home, All Listings, Create)
│   └── footer.ejs           ← Footer with links and branding
│
└── listings/
    ├── index.ejs            ← All listings page (cards grid with loop)
    ├── show.ejs             ← Single listing detail (title, image, description, edit/delete)
    ├── new.ejs              ← Create new listing form
    ├── edit.ejs             ← Edit existing listing form (pre-filled)
    └── error.ejs            ← Error display page (status code + message)
```

### How each template connects:
```
boilerplate.ejs
    ├── includes navbar.ejs    (always shown)
    ├── <%- body %> ←────────── index.ejs  (when visiting /listings)
    │                 ←────────── show.ejs   (when visiting /listings/:id)
    │                 ←────────── new.ejs    (when visiting /listings/new)
    │                 ←────────── edit.ejs   (when visiting /listings/:id/edit)
    │                 ←────────── error.ejs  (when an error occurs)
    └── includes footer.ejs   (always shown)
```

---

## 🧠 COMMON EJS MISTAKES & FIXES

| Mistake | Fix |
|---------|-----|
| `<%= include("file") %>` | Use `<%-` not `<%=` for includes → `<%- include("file") %>` |
| Template not found | Check path is relative to current file, and file extension is `.ejs` |
| Data is `undefined` in template | Make sure you passed it in `res.render('file', { key: value })` |
| `Cannot read property of undefined` | The data variable doesn't exist — check spelling in render() |
| Form data not received | Make sure `app.use(express.urlencoded({ extended: true }))` is in app.js |
| PUT/DELETE not working | Make sure `method-override` is installed and configured |
| Textarea shows extra whitespace | Remove spaces between tags: `<textarea><%= data %></textarea>` (no newlines!) |

---

> 📝 **This file will be updated as you add more templates (reviews, auth pages, etc.)!**

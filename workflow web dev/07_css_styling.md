# 🎨 CSS & STYLING - Quick Reference
> How styling works in your project (Bootstrap + Custom CSS)
> Based on YOUR Wanderlust project

---

## 📋 TABLE OF CONTENTS
1. [How CSS is Organized](#how-css-is-organized)
2. [Bootstrap Usage](#bootstrap-usage)
3. [Custom CSS Structure](#custom-css-structure)
4. [Glassmorphism Effect](#glassmorphism-effect)
5. [Static Files Setup](#static-files-setup)
6. [Font Awesome Icons](#font-awesome-icons)

---

## HOW CSS IS ORGANIZED

### Your CSS files:
```
public/css/
├── style.css              ← Global styles (applies everywhere)
├── animations.css         ← Wave animations (background effect)
├── listings-index.css     ← Styles for all listings page
├── listings-show.css      ← Styles for single listing page
├── listings-new.css       ← Styles for create form
└── listings-edit.css      ← Styles for edit form
```

### How they're loaded:

#### Global CSS (in boilerplate.ejs — loads on EVERY page):
```html
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/animations.css">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
```

#### Page-specific CSS (in each template — loads only on that page):
```html
<!-- index.ejs -->
<%- layout('layouts/boilerplate') %>
<link rel="stylesheet" href="/css/listings-index.css">

<!-- show.ejs -->
<%- layout('layouts/boilerplate') %>
<link rel="stylesheet" href="/css/listings-show.css">
```

---

## BOOTSTRAP USAGE

### What is Bootstrap?
- A CSS framework that gives you pre-built components
- Buttons, cards, navbars, forms, grid system — all ready to use
- You're using Bootstrap 5.3.8

### Bootstrap components you use:
| Component | Where | Class |
|-----------|-------|-------|
| Navbar | navbar.ejs | `navbar navbar-expand-md navbar-dark` |
| Alerts | error.ejs | `alert alert-danger` |
| Buttons | show.ejs, error.ejs | `btn btn-primary` |
| Container | boilerplate.ejs | `container-fluid` |
| Form validation | new.ejs | `needs-validation`, `valid-feedback`, `invalid-feedback` |

### Grid System basics:
```html
<div class="container">
    <div class="row">
        <div class="col-md-6">Half width on medium+ screens</div>
        <div class="col-md-6">Half width on medium+ screens</div>
    </div>
</div>
```

### Bootstrap Docs: https://getbootstrap.com/docs/5.3/

---

## CUSTOM CSS STRUCTURE

### Your design approach:
- **Dark theme** with gradients
- **Glassmorphism** for navbar, cards, and footer
- **Custom CSS** for page-specific styling

### Background (set in boilerplate.ejs):
```css
body {
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
    min-height: 100vh;
}
```

### Pattern you follow for each page:
1. Create a CSS file in `public/css/` (e.g., `listings-index.css`)
2. Define styles for that specific page
3. Link it in the corresponding EJS template

---

## GLASSMORPHISM EFFECT

### The signature look of your app — frosted glass effect:
```css
/* The glassmorphism recipe */
.element {
    background: rgba(255, 255, 255, 0.08);      /* Semi-transparent white */
    backdrop-filter: blur(10px);                  /* Blur what's behind */
    border: 1px solid rgba(255, 255, 255, 0.2);  /* Subtle border */
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37); /* Soft shadow */
}
```

### Where you use it:
- **Navbar**: Glass-effect navigation bar
- **Footer**: Glass-effect footer
- **Cards**: Listing cards with glass background

---

## STATIC FILES SETUP

### The Express config:
```js
// In app.js
app.use(express.static(path.join(__dirname, 'public')));
```

### How paths map:
```
File on disk:                    → URL in browser:
public/css/style.css             → /css/style.css
public/css/listings-index.css    → /css/listings-index.css
public/js/script.js              → /js/script.js
```

### In HTML/EJS, always use the URL path:
```html
<link rel="stylesheet" href="/css/style.css">
<!-- NOT: href="public/css/style.css" -->
<!-- NOT: href="../public/css/style.css" -->
<!-- The '/public' part is invisible — '/' maps to the public folder -->
```

---

## FONT AWESOME ICONS

### What is it?
- A library of thousands of icons
- Used via CSS classes
- You're using Font Awesome 7.0.1

### How to use:
```html
<!-- Include in boilerplate.ejs (already done) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">

<!-- Use icons anywhere -->
<i class="fa-brands fa-accusoft"></i>           <!-- Brand icon (navbar) -->
<i class="fas fa-map-marker-alt"></i>           <!-- Solid icon (location pin) -->
<i class="fa-brands fa-fort-awesome"></i>       <!-- Brand icon (footer) -->
```

### Icon types:
| Prefix | Type | Example |
|--------|------|---------|
| `fas` | Solid (filled) | `<i class="fas fa-heart"></i>` |
| `far` | Regular (outline) | `<i class="far fa-heart"></i>` |
| `fa-brands` | Brand logos | `<i class="fa-brands fa-github"></i>` |

### Find icons: https://fontawesome.com/icons

---

## 🧠 CSS TIPS FOR YOUR PROJECT

### When adding a new page:
1. Create `public/css/page-name.css`
2. Add styles for that page
3. Link it in the EJS template: `<link rel="stylesheet" href="/css/page-name.css">`

### Keep the glassmorphism consistent:
```css
/* Copy this pattern for any new glass-effect element */
.glass-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
}
```

### Text colors for dark theme:
```css
/* Primary text */
color: #FFFFFF;

/* Secondary text */
color: rgba(255, 255, 255, 0.8);

/* Muted text */
color: rgba(255, 255, 255, 0.7);

/* Very subtle text */
color: rgba(255, 255, 255, 0.5);
```

---

> 📝 **This file will be updated as you add more pages and styles!**

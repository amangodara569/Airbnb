# 🎨 CSS & STYLING - Complete Reference
> Bootstrap + Custom CSS patterns for your Wanderlust project
> Headers, footers, page designs, common code snippets & key concepts

---

## 📋 TABLE OF CONTENTS
1. [How CSS is Organized](#how-css-is-organized)
2. [Bootstrap Usage](#bootstrap-usage)
3. [How to Build a Header / Navbar](#how-to-build-a-header--navbar)
4. [How to Build a Footer](#how-to-build-a-footer)
5. [Common Page Designs](#common-page-designs)
6. [Glassmorphism Effect](#glassmorphism-effect)
7. [Common Design Patterns & Code](#common-design-patterns--code)
8. [Key CSS Concepts Explained](#key-css-concepts-explained)
9. [Static Files Setup](#static-files-setup)
10. [Font Awesome Icons](#font-awesome-icons)
11. [Design Resources & Learning](#design-resources--learning)

---

## HOW CSS IS ORGANIZED

```
public/css/
├── style.css              ← Global styles (applies everywhere)
├── animations.css         ← Wave animations (background effect)
├── listings-index.css     ← Styles for all listings page
├── listings-show.css      ← Styles for single listing page
├── listings-new.css       ← Styles for create form
└── listings-edit.css      ← Styles for edit form
```

#### Global CSS (in boilerplate.ejs — loads on EVERY page):
```html
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/animations.css">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
```

#### Page-specific CSS (in each template):
```html
<%- layout('layouts/boilerplate') %>
<link rel="stylesheet" href="/css/listings-index.css">
```

---

## BOOTSTRAP USAGE

| Component | Where | Class |
|-----------|-------|-------|
| Navbar | navbar.ejs | `navbar navbar-expand-md navbar-dark` |
| Alerts | error.ejs | `alert alert-danger` |
| Buttons | show.ejs | `btn btn-primary` |
| Container | boilerplate.ejs | `container-fluid` |
| Form validation | new.ejs | `needs-validation` |

### Grid System:
```html
<div class="container">
    <div class="row">
        <div class="col-md-6">Half width on medium+</div>
        <div class="col-md-6">Half width on medium+</div>
    </div>
</div>
```
> Bootstrap Docs: https://getbootstrap.com/docs/5.3/

---

## HOW TO BUILD A HEADER / NAVBAR

### Concept: What is a Navbar?
A navbar sits at the **top of every page**. It typically contains:
- A **brand/logo** (left side)
- **Navigation links** (right side)
- A **hamburger menu** for mobile

### Your current navbar (glassmorphism style):
```html
<!-- views/includes/navbar.ejs -->
<nav class="navbar navbar-expand-md navbar-dark sticky-top"
     style="background: rgba(255,255,255,0.08);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 32px rgba(31,38,135,0.37);">

    <!-- Brand -->
    <a class="navbar-brand" href="/" style="color:#fff; font-weight:bold;">
        <i class="fa-brands fa-accusoft"></i> WANDERLUST
    </a>

    <!-- Hamburger toggle (mobile) -->
    <button class="navbar-toggler" type="button"
            data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Links -->
    <div class="collapse navbar-collapse" id="navMenu">
        <div class="navbar-nav ms-auto">
            <a class="nav-item nav-link" href="/">Home</a>
            <a class="nav-item nav-link" href="/listings">All Listings</a>
            <a class="nav-item nav-link" href="/listings/new">Create</a>
        </div>
    </div>
</nav>
```

### Key navbar CSS concepts:
| Property | What it does |
|----------|-------------|
| `sticky-top` | Navbar stays at top as you scroll |
| `navbar-expand-md` | Collapses to hamburger below md (768px) |
| `ms-auto` | Bootstrap: pushes links to the RIGHT (margin-start: auto) |
| `navbar-dark` | Makes text/toggler white (for dark backgrounds) |

### Pure CSS Navbar (no Bootstrap):
```css
.navbar {
    display: flex;
    justify-content: space-between;  /* logo left, links right */
    align-items: center;
    padding: 1rem 2rem;
    position: sticky;
    top: 0;
    z-index: 1000;                   /* stays above all content */
    background: rgba(10, 10, 10, 0.9);
    backdrop-filter: blur(10px);
}

.nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
}

.nav-links a {
    color: rgba(255,255,255,0.8);
    text-decoration: none;
    transition: color 0.2s;
}

.nav-links a:hover {
    color: #ffffff;
}

/* Mobile: hide links, show hamburger */
@media (max-width: 768px) {
    .nav-links { display: none; }
    .hamburger { display: block; }
}
```

---

## HOW TO BUILD A FOOTER

### Concept: What is a Footer?
A footer sits at the **bottom of every page**. It typically contains:
- Brand name / copyright
- Important links (Terms, Privacy, Contact)
- Social media icons

### Your current footer (glassmorphism style):
```html
<!-- views/includes/footer.ejs -->
<footer style="background: rgba(255,255,255,0.05);
               backdrop-filter: blur(10px);
               border-top: 1px solid rgba(255,255,255,0.2);
               margin-top: 3rem;">
    <div style="padding: 2rem; text-align: center;">
        <!-- Social icons -->
        <div style="margin-bottom: 1.5rem;">
            <i class="fa-brands fa-github" style="color: rgba(255,255,255,0.8); margin: 0 0.5rem;"></i>
            <i class="fa-brands fa-twitter" style="color: rgba(255,255,255,0.8); margin: 0 0.5rem;"></i>
        </div>
        <!-- Brand -->
        <div style="color:#fff; font-weight:bold; margin-bottom:1rem;">
            WANDERLUST PRIVATE LIMITED
        </div>
        <!-- Links -->
        <div style="display:flex; justify-content:center; gap:2rem;">
            <a href="#"        style="color: rgba(255,255,255,0.7);">Contact Us</a>
            <a href="/terms"   style="color: rgba(255,255,255,0.7);">Terms</a>
            <a href="/privacy" style="color: rgba(255,255,255,0.7);">Privacy</a>
        </div>
    </div>
</footer>
```

### Making footer stick to bottom (even on short pages):
```css
/* In style.css */
body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

main {
    flex: 1;   /* main takes all available space, pushes footer down */
}

footer {
    margin-top: auto;
}
```

---

## COMMON PAGE DESIGNS

### 1. INDEX PAGE — Grid of Cards
Use this for: all listings, product galleries, blog posts

```css
/* listings-index.css */
.listings-container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1.5rem;
}

.listings-title {
    color: #fff;
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
}

/* The grid layout */
.listings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

/* Each card */
.listing-card {
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
}

.listing-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;     /* crops image to fill, no stretching */
}

.card-content {
    padding: 1.2rem;
}

.card-title {
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.card-button {
    display: inline-block;
    padding: 0.5rem 1.2rem;
    background: linear-gradient(135deg, #6c63ff, #a855f7);
    color: #fff;
    border-radius: 8px;
    text-decoration: none;
    font-size: 0.9rem;
    transition: opacity 0.2s;
}

.card-button:hover { opacity: 0.85; }
```

---

### 2. SHOW PAGE — Detail/Hero Layout
Use this for: single item detail pages

```css
/* listings-show.css */

/* Full-width hero image at top */
.listing-image-hero {
    width: 100%;
    height: 50vh;
    background-size: cover;
    background-position: center;
    position: relative;
}

.listing-image-overlay {
    position: absolute;
    inset: 0;                    /* shorthand for top/right/bottom/left: 0 */
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7));
}

/* Main content area */
.listing-container {
    max-width: 900px;
    margin: -3rem auto 3rem;    /* negative top margin overlaps the hero */
    padding: 0 1.5rem;
    position: relative;
    z-index: 1;
}

.listing-hero {
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 1.5rem;
}

.listing-title {
    color: #fff;
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.listing-price {
    display: inline-block;
    background: linear-gradient(135deg, #6c63ff, #a855f7);
    padding: 0.5rem 1.5rem;
    border-radius: 30px;
    color: #fff;
    font-weight: 700;
    font-size: 1.4rem;
}

/* Action buttons row */
.action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.btn-action {
    padding: 0.7rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: transform 0.2s;
}

.btn-edit   { background: #6c63ff; color: #fff; }
.btn-delete { background: #ef4444; color: #fff; }
.btn-action:hover { transform: translateY(-2px); }
```

---

### 3. FORM PAGES — Create / Edit
Use this for: new.ejs, edit.ejs, login, signup

```css
/* listings-new.css / listings-edit.css */
.form-container {
    max-width: 600px;
    margin: 3rem auto;
    padding: 0 1rem;
}

.form-title {
    color: #fff;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    text-align: center;
}

/* The glass card wrapping the form */
.form-card {
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 2.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    color: rgba(255,255,255,0.8);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
}

.form-input:focus,
.form-textarea:focus {
    border-color: #6c63ff;
    background: rgba(108,99,255,0.1);
}

/* Placeholder text color */
.form-input::placeholder { color: rgba(255,255,255,0.4); }

.form-textarea {
    resize: vertical;
    min-height: 120px;
}

.form-button {
    width: 100%;
    padding: 0.9rem;
    background: linear-gradient(135deg, #6c63ff, #a855f7);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
}

.form-button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
}

/* Cancel button variant */
.btn-cancel {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    text-align: center;
    text-decoration: none;
}
```

---

### 4. ERROR / EMPTY STATE PAGE
```css
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    padding: 2rem;
}

.error-code {
    font-size: 6rem;
    font-weight: 700;
    color: transparent;
    background: linear-gradient(135deg, #6c63ff, #a855f7);
    background-clip: text;
    -webkit-background-clip: text;
    line-height: 1;
}

.error-message {
    color: rgba(255,255,255,0.8);
    font-size: 1.2rem;
    margin: 1rem 0 2rem;
}
```

---

## GLASSMORPHISM EFFECT

The signature frosted glass look of your app:

```css
/* Basic recipe */
.glass {
    background: rgba(255, 255, 255, 0.08);      /* semi-transparent */
    backdrop-filter: blur(10px);                  /* blur what's behind */
    -webkit-backdrop-filter: blur(10px);          /* Safari support */
    border: 1px solid rgba(255, 255, 255, 0.2);  /* subtle border */
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

/* Stronger glass (modals, popups) */
.glass-strong {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Subtle glass (cards) */
.glass-subtle {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
```

> ⚠️ Glassmorphism ONLY works on a dark/colourful background. It looks invisible on white.

---

## COMMON DESIGN PATTERNS & CODE

### Dark Theme Text Colors:
```css
/* Use these consistently across your project */
.text-primary   { color: #FFFFFF; }
.text-secondary { color: rgba(255, 255, 255, 0.8); }
.text-muted     { color: rgba(255, 255, 255, 0.6); }
.text-subtle    { color: rgba(255, 255, 255, 0.4); }
```

### Gradient Text:
```css
.gradient-text {
    background: linear-gradient(135deg, #6c63ff, #a855f7);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
}
```

### Gradient Button:
```css
.btn-gradient {
    background: linear-gradient(135deg, #6c63ff, #a855f7);
    color: #fff;
    border: none;
    padding: 0.7rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
}
.btn-gradient:hover {
    opacity: 0.85;
    transform: translateY(-2px);
}
```

### Badge / Tag:
```css
.badge {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border-radius: 30px;
    font-size: 0.8rem;
    font-weight: 600;
    background: rgba(108, 99, 255, 0.2);
    color: #a78bfa;
    border: 1px solid rgba(108, 99, 255, 0.4);
}
```

### Divider Line:
```css
.divider {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    margin: 2rem 0;
}
```

### Skeleton Loading Placeholder:
```css
.skeleton {
    background: linear-gradient(90deg,
        rgba(255,255,255,0.05) 25%,
        rgba(255,255,255,0.12) 50%,
        rgba(255,255,255,0.05) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
}

@keyframes shimmer {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
}
```

### Full Page Loading Screen:
```css
.page-loader {
    position: fixed;
    inset: 0;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.5s;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255,255,255,0.1);
    border-top-color: #6c63ff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

### When adding a new page:
```
1. Create public/css/page-name.css
2. Add styles for that page
3. Link it in the EJS: <link rel="stylesheet" href="/css/page-name.css">
4. Keep the glassmorphism consistent (copy the .glass recipe above)
```

---

## KEY CSS CONCEPTS EXPLAINED

### `position` — how elements are placed:
| Value | Meaning |
|-------|---------|
| `static` | Default — normal document flow |
| `relative` | Offset from its normal position; creates positioning context for children |
| `absolute` | Removed from flow; positioned relative to nearest `relative` parent |
| `fixed` | Stays in same place when scrolling (relative to viewport) |
| `sticky` | Acts like `relative` until you scroll to it, then acts like `fixed` |

```css
/* Common pattern: overlay on top of image */
.image-wrapper { position: relative; }
.overlay {
    position: absolute;
    inset: 0;          /* covers the whole parent */
    background: rgba(0,0,0,0.5);
}
```

### `z-index` — stacking order:
- Higher number = on top
- Only works on positioned elements (`position` != static)
- Common values: navbar `1000`, modal `2000`, tooltip `3000`

### `overflow`:
```css
overflow: hidden;   /* clips content that goes outside the box — used on cards */
overflow: auto;     /* shows scrollbar only when needed */
overflow: scroll;   /* always shows scrollbar */
overflow-x: hidden; /* only horizontal */
```

### `object-fit` — how images fill their container:
```css
img {
    width: 100%;
    height: 250px;
    object-fit: cover;    /* crops to fill — most common for cards */
    object-fit: contain;  /* shrinks to fit — for logos */
    object-fit: fill;     /* stretches (avoid!) */
}
```

### `transform` — move/scale/rotate without affecting layout:
```css
transform: translateX(20px);    /* move right */
transform: translateY(-5px);    /* move up (lift effect on hover) */
transform: scale(1.05);         /* zoom in 5% */
transform: rotate(45deg);       /* rotate */
transform: translateX(-50%) translateY(-50%); /* center trick */
```

### `transition` — smooth changes:
```css
/* transition: property duration timing-function delay */
transition: all 0.3s ease;               /* all properties */
transition: transform 0.3s ease, opacity 0.2s; /* specific */

/* Timing functions */
ease        /* slow start, fast middle, slow end (default) */
ease-in-out /* slow start and end */
linear      /* constant speed */
cubic-bezier(0.4, 0, 0.2, 1) /* custom (Google's Material curve) */
```

### `backdrop-filter` — glassmorphism key:
```css
backdrop-filter: blur(10px);   /* blurs whatever is BEHIND the element */
/* ⚠️ The element must be semi-transparent for this to be visible */
/* ⚠️ Always add -webkit- prefix for Safari */
-webkit-backdrop-filter: blur(10px);
```

### CSS `clamp()` — responsive sizing:
```css
/* clamp(minimum, preferred, maximum) */
font-size: clamp(1rem, 2.5vw, 2rem);
/* font scales with viewport, but never < 1rem or > 2rem */

padding: clamp(1rem, 5%, 3rem);
/* padding scales with container width */
```

---

## STATIC FILES SETUP

```js
// In app.js
app.use(express.static(path.join(__dirname, 'public')));
```

| File on disk | URL in HTML |
|-------------|------------|
| `public/css/style.css` | `/css/style.css` |
| `public/js/script.js` | `/js/script.js` |
| `public/images/logo.png` | `/images/logo.png` |

```html
<!-- CORRECT: -->
<link rel="stylesheet" href="/css/style.css">

<!-- WRONG — these will NOT work: -->
<link rel="stylesheet" href="public/css/style.css">
<link rel="stylesheet" href="../public/css/style.css">
```

---

## FONT AWESOME ICONS

```html
<!-- Include in boilerplate.ejs (already done) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">

<!-- Usage -->
<i class="fas fa-heart"></i>                <!-- Solid -->
<i class="far fa-heart"></i>                <!-- Outline -->
<i class="fa-brands fa-github"></i>         <!-- Brand -->

<!-- Sizing -->
<i class="fas fa-star fa-xs"></i>   <!-- extra small -->
<i class="fas fa-star fa-lg"></i>   <!-- large -->
<i class="fas fa-star fa-2x"></i>   <!-- 2× size -->

<!-- Spinning icon (loading indicator) -->
<i class="fas fa-circle-notch fa-spin"></i>
```

| Prefix | Type |
|--------|------|
| `fas` | Solid (filled) |
| `far` | Regular (outline) |
| `fa-brands` | Brand logos |

> Find icons: https://fontawesome.com/icons

---

## DESIGN RESOURCES & LEARNING

### 🎨 Design Inspiration
| Site | URL | What For |
|------|-----|---------|
| **Dribbble** | https://dribbble.com | UI design shots & color palettes |
| **Awwwards** | https://awwwards.com | Cutting-edge award-winning sites |
| **Dark Design** | https://www.dark.design | Dark mode website gallery |
| **Land-book** | https://land-book.com | Landing page inspiration |
| **Behance** | https://behance.net | Full project case studies |

### 🛠️ CSS Tools
| Tool | URL | What For |
|------|-----|---------|
| **CSS Tricks** | https://css-tricks.com | Flexbox & Grid guides |
| **Glassmorphism Generator** | https://hype4.academy/tools/glassmorphism-generator | Generate your glass CSS |
| **Gradient Generator** | https://cssgradient.io | Visual gradient builder |
| **Animista** | https://animista.net | Ready-to-use CSS animations |
| **Box Shadow Dev** | https://box-shadow.dev | Visual box-shadow builder |
| **Grid Generator** | https://cssgrid-generator.netlify.app | Visual CSS Grid builder |
| **Clippy** | https://bennettfeely.com/clippy | CSS clip-path shapes |

### 🎨 Colors & Fonts
| Tool | URL | What For |
|------|-----|---------|
| **Coolors** | https://coolors.co | Generate color palettes |
| **ColorHunt** | https://colorhunt.co | Curated palettes |
| **Realtime Colors** | https://realtimecolors.com | Preview colors on a real UI |
| **Google Fonts** | https://fonts.google.com | Free web fonts |
| **Fontpair** | https://fontpair.co | Font pairing ideas |

### 📖 Learn More CSS
| Resource | URL |
|----------|-----|
| MDN CSS Reference | https://developer.mozilla.org/en-US/docs/Web/CSS |
| Flexbox Froggy (game) | https://flexboxfroggy.com |
| CSS Grid Garden (game) | https://cssgridgarden.com |
| web.dev/learn/css | https://web.dev/learn/css |

---

> 📝 **This file will be updated as you add more pages and styles!**

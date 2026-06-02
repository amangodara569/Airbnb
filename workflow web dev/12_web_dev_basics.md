# 🌐 WEB DEVELOPMENT BASICS
> Everything a professional web developer should know — theory, concepts, and code
> A solid foundation before jumping into frameworks

---

## 📋 TABLE OF CONTENTS
1. [How the Web Works](#how-the-web-works)
2. [HTML Essentials](#html-essentials)
3. [CSS Essentials](#css-essentials)
4. [JavaScript Essentials](#javascript-essentials)
5. [The DOM](#the-dom)
6. [HTTP & APIs](#http--apis)
7. [Responsive Design](#responsive-design)
8. [Accessibility (a11y)](#accessibility-a11y)
9. [Performance Basics](#performance-basics)
10. [Developer Tools](#developer-tools)
11. [Version Control (Git)](#version-control-git)
12. [Important Concepts Glossary](#important-concepts-glossary)
13. [Learning Resources](#learning-resources)

---

## HOW THE WEB WORKS

### The Request-Response Cycle:
```
You type URL → DNS lookup → TCP connection → HTTP request sent
→ Server processes it → Server sends HTTP response → Browser renders HTML/CSS/JS
```

### Key terms:
| Term | Meaning |
|------|---------|
| **DNS** | Translates domain names (google.com) to IP addresses |
| **IP Address** | Unique number identifying a server on the internet |
| **HTTP** | Protocol for sending requests/responses (text-based) |
| **HTTPS** | HTTP + encryption via SSL/TLS |
| **Port** | Number that identifies which service on a server (80=HTTP, 443=HTTPS, 3000=dev) |
| **Client** | The browser — sends requests |
| **Server** | Backend — receives requests, sends back data |

### HTTP Status Codes (must know):
| Code | Meaning |
|------|---------|
| `200` | OK — everything worked |
| `201` | Created — new resource made |
| `301/302` | Redirect |
| `400` | Bad Request — client sent wrong data |
| `401` | Unauthorized — not logged in |
| `403` | Forbidden — logged in but no permission |
| `404` | Not Found |
| `500` | Internal Server Error — something broke on the server |

---

## HTML ESSENTIALS

### What is HTML?
- **HyperText Markup Language** — the structure/skeleton of a webpage
- Browsers read HTML top-to-bottom
- HTML is NOT a programming language — it just describes content

### Essential Boilerplate:
```html
<!DOCTYPE html>          <!-- Tells browser: use modern HTML5 -->
<html lang="en">         <!-- Root element, lang for accessibility -->
<head>
    <meta charset="UTF-8">                                    <!-- Handle all characters -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- Mobile scaling -->
    <meta name="description" content="Page description for SEO">
    <title>Page Title</title>                                 <!-- Tab title + SEO -->
    <link rel="stylesheet" href="/css/style.css">             <!-- Load CSS -->
</head>
<body>
    <!-- All visible content goes here -->
    <script src="/js/script.js" defer></script>  <!-- Load JS at end (defer = after HTML parsed) -->
</body>
</html>
```

### Semantic HTML (USE THESE, not just divs):
```html
<header>    <!-- Top section of page or section -->
<nav>       <!-- Navigation links -->
<main>      <!-- Main content (only ONE per page) -->
<section>   <!-- Thematic group of content -->
<article>   <!-- Self-contained content (blog post, card) -->
<aside>     <!-- Sidebar, related content -->
<footer>    <!-- Bottom of page or section -->
<figure>    <!-- Image with caption -->
<figcaption><!-- Caption for a figure -->
<time>      <!-- Dates and times -->
<address>   <!-- Contact information -->
```

### Why semantic HTML matters:
- ✅ Better **SEO** — search engines understand your content
- ✅ Better **accessibility** — screen readers navigate by landmarks
- ✅ Cleaner code — other devs understand it faster

### Forms — the most important HTML feature:
```html
<form action="/submit" method="POST">
    <!-- Text input -->
    <label for="username">Username</label>
    <input type="text" id="username" name="username" required placeholder="Enter name">

    <!-- Email -->
    <input type="email" name="email" required>

    <!-- Password -->
    <input type="password" name="password" minlength="8">

    <!-- Number -->
    <input type="number" name="price" min="0" step="0.01">

    <!-- Textarea -->
    <textarea name="message" rows="5"></textarea>

    <!-- Select dropdown -->
    <select name="country">
        <option value="">Choose country</option>
        <option value="IN">India</option>
        <option value="US">United States</option>
    </select>

    <!-- Checkbox -->
    <input type="checkbox" name="agree" id="agree" required>
    <label for="agree">I agree to terms</label>

    <!-- Radio buttons -->
    <input type="radio" name="size" value="small" id="small">
    <label for="small">Small</label>

    <!-- File upload -->
    <input type="file" name="photo" accept="image/*">

    <!-- Hidden field (sent with form but not shown to user) -->
    <input type="hidden" name="_method" value="PUT">

    <button type="submit">Submit</button>
    <button type="reset">Clear</button>
</form>
```

### ⚠️ `name` vs `id` — critical difference:
| Attribute | Purpose | Who uses it |
|-----------|---------|------------|
| `id` | Unique identifier on the page | CSS (`#id`), JS (`getElementById`), label `for` |
| `name` | Key in the form data sent to server | Server (`req.body.name`) |

---

## CSS ESSENTIALS

### The Box Model — Everything is a box:
```
┌─────────────────────────────┐
│           MARGIN            │  ← Space OUTSIDE the border
│  ┌───────────────────────┐  │
│  │        BORDER         │  │  ← The visible border line
│  │  ┌─────────────────┐  │  │
│  │  │     PADDING     │  │  │  ← Space INSIDE the border
│  │  │  ┌───────────┐  │  │  │
│  │  │  │  CONTENT  │  │  │  │  ← Your actual text/image
│  │  │  └───────────┘  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

```css
/* ⚠️ Always add this to your CSS reset: */
*, *::before, *::after {
    box-sizing: border-box; /* width/height includes padding + border */
}
```

### CSS Selectors (most used):
```css
div           /* Element selector */
.card         /* Class selector */
#hero         /* ID selector (avoid for styling — too specific) */
div.card      /* Element WITH class */
.parent .child /* Descendant selector */
.parent > .child /* Direct child only */
a:hover       /* Pseudo-class — element in a state */
p::first-line /* Pseudo-element — part of an element */
[data-type="primary"] /* Attribute selector */
```

### CSS Specificity (why your styles don't apply):
```
Inline styles        → 1000 points  (most powerful)
ID selector          → 100 points
Class/pseudo-class   → 10 points
Element selector     → 1 point

Example:
div.card p   = 1 + 10 + 1 = 12 points
#hero p      = 100 + 1 = 101 points  ← wins!
```
> ⚡ Rule: Use classes for styling, avoid IDs. Use `!important` only as a last resort.

### Flexbox — 1D layouts (rows or columns):
```css
.container {
    display: flex;
    flex-direction: row;          /* row | column */
    justify-content: center;      /* main axis: flex-start | center | space-between | space-around */
    align-items: center;          /* cross axis: flex-start | center | stretch */
    gap: 1rem;                    /* space between items */
    flex-wrap: wrap;              /* allow items to wrap to next line */
}

/* On the child: */
.item {
    flex: 1;                      /* grow to fill available space equally */
    flex: 0 0 300px;              /* fixed 300px, don't grow or shrink */
}
```

### CSS Grid — 2D layouts (rows AND columns):
```css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);   /* 3 equal columns */
    grid-template-columns: 200px 1fr 1fr;    /* fixed + flexible */
    grid-template-rows: auto;
    gap: 1.5rem;                             /* gap between all cells */
}

/* Responsive grid without media queries: */
.responsive-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    /* auto-fit: create as many columns as fit */
    /* minmax(250px, 1fr): each column min 250px, max flexible */
}
```

### CSS Variables (Custom Properties):
```css
/* Define in :root so available everywhere */
:root {
    --primary: #6c63ff;
    --bg-dark: #0a0a0a;
    --text: #ffffff;
    --radius: 12px;
    --shadow: 0 4px 20px rgba(0,0,0,0.3);
}

/* Use anywhere: */
.button {
    background: var(--primary);
    border-radius: var(--radius);
}
```

### Media Queries — Responsive Design:
```css
/* Mobile-first approach (preferred): */
/* Base styles for mobile */
.container { padding: 1rem; }

/* Tablet and up */
@media (min-width: 768px) {
    .container { padding: 2rem; }
}

/* Desktop and up */
@media (min-width: 1024px) {
    .container { padding: 3rem; }
}
```

### CSS Transitions & Animations:
```css
/* Transition — smooth change between states */
.button {
    background: #6c63ff;
    transition: background 0.3s ease, transform 0.2s ease;
}
.button:hover {
    background: #5a52d5;
    transform: translateY(-2px);  /* lifts up slightly */
}

/* Keyframe animation */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
}

.card {
    animation: fadeIn 0.5s ease forwards;
}
```

---

## JAVASCRIPT ESSENTIALS

### The Modern JS You Must Know:

```js
// ── Variables ──
const name = "Alex";        // Can't be reassigned
let count = 0;              // Can be reassigned
// Never use var (old, has scope issues)

// ── Destructuring ──
const { title, price } = listing;       // Object destructuring
const [first, second] = items;          // Array destructuring
const { title: listingTitle } = item;   // Rename while destructuring

// ── Spread & Rest ──
const newArr = [...arr1, ...arr2];      // Spread: merge arrays
const newObj = { ...obj1, ...obj2 };   // Spread: merge objects
function sum(...nums) { }               // Rest: collect args into array

// ── Arrow Functions ──
const double = (n) => n * 2;
const greet = (name) => {
    return `Hello, ${name}!`;
};

// ── Template Literals ──
const msg = `Welcome, ${user.name}! You have ${count} messages.`;

// ── Optional Chaining ──
const city = user?.address?.city;   // No error if user or address is undefined

// ── Nullish Coalescing ──
const port = process.env.PORT ?? 3000;  // Use 3000 only if PORT is null/undefined

// ── Array Methods (most used) ──
const nums = [1, 2, 3, 4, 5];

nums.map(n => n * 2)         // [2,4,6,8,10] — transform each item
nums.filter(n => n > 2)      // [3,4,5] — keep items that pass test
nums.find(n => n > 3)        // 4 — first item that passes test
nums.reduce((acc, n) => acc + n, 0)  // 15 — reduce to single value
nums.forEach(n => console.log(n))   // loop (returns undefined)
nums.includes(3)             // true
nums.some(n => n > 4)        // true — at least one passes
nums.every(n => n > 0)       // true — all pass

// ── Async/Await ──
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed:', error);
    }
}

// ── Fetch API (built-in HTTP requests) ──
// GET
const res = await fetch('/api/listings');
const data = await res.json();

// POST
const res = await fetch('/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Beach House', price: 200 })
});
```

---

## THE DOM

### What is the DOM?
- **Document Object Model** — the browser's representation of your HTML as a JavaScript object tree
- JS can read, change, add, or delete any HTML element via the DOM

```js
// ── Selecting elements ──
document.querySelector('.card')          // First element matching CSS selector
document.querySelectorAll('.card')       // ALL matching (returns NodeList)
document.getElementById('hero')         // By ID (fast)

// ── Reading & changing content ──
element.textContent = 'New text';        // Change text (safe — no HTML injection)
element.innerHTML = '<strong>Bold</strong>'; // Change HTML (⚠️ XSS risk with user data)
input.value                              // Get/set form input value

// ── Classes ──
element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('dark');
element.classList.contains('active');    // returns true/false

// ── Attributes ──
element.getAttribute('href');
element.setAttribute('data-id', '123');

// ── Style ──
element.style.backgroundColor = 'red';   // inline styles (avoid, prefer classes)

// ── Events ──
button.addEventListener('click', (event) => {
    event.preventDefault();    // Stop form submit or link navigation
    event.stopPropagation();   // Stop event bubbling up to parent
    console.log('clicked!');
});

// Common events:
// 'click', 'submit', 'input', 'change', 'keydown', 'keyup',
// 'mouseover', 'mouseout', 'focus', 'blur', 'DOMContentLoaded'

// ── Creating elements ──
const div = document.createElement('div');
div.className = 'card';
div.textContent = 'New card';
document.body.appendChild(div);

// ── Event delegation (better performance) ──
// Instead of adding listeners to 100 list items, add ONE to the parent:
document.querySelector('.list').addEventListener('click', (e) => {
    if (e.target.matches('.list-item')) {
        console.log('Item clicked:', e.target.textContent);
    }
});
```

---

## HTTP & APIs

### What is an API?
- **Application Programming Interface** — a set of rules for how programs talk to each other
- A **REST API** returns data (usually JSON) instead of HTML

### Fetch vs Forms:
| Method | Use Case | Data Format |
|--------|----------|-------------|
| HTML Form | Traditional web apps (full page reload) | `application/x-www-form-urlencoded` |
| `fetch()` in JS | Single page updates, no reload | JSON |
| Axios (library) | Like fetch but with better defaults | JSON |

### JSON — the language of APIs:
```json
{
  "title": "Beach House",
  "price": 1500,
  "location": "Goa",
  "tags": ["beach", "pool"],
  "owner": {
    "name": "Rahul",
    "verified": true
  }
}
```

```js
// Convert JS object → JSON string (for sending)
JSON.stringify({ title: "Beach House" })

// Convert JSON string → JS object (for using)
JSON.parse('{"title":"Beach House"}')
```

---

## RESPONSIVE DESIGN

### Core Concepts:
1. **Fluid layouts** — use `%`, `vw`, `rem` instead of fixed `px`
2. **Flexible images** — `max-width: 100%` so images shrink with container
3. **Media queries** — change layout at different screen sizes

### Viewport units:
```css
/* Viewport-relative units */
width: 100vw;      /* 100% of viewport WIDTH */
height: 100vh;     /* 100% of viewport HEIGHT */
font-size: 4vw;    /* scales with viewport */

/* Responsive font size without media queries: */
font-size: clamp(1rem, 2.5vw, 2rem);
/* min: 1rem, preferred: 2.5vw, max: 2rem */
```

### Common Breakpoints:
```css
/* Mobile first */
/* Base: 0px → 767px  (phones) */
@media (min-width: 768px)  { /* Tablet  */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large   */ }
```

---

## ACCESSIBILITY (a11y)

### Why it matters:
- ~15% of world population has some form of disability
- Required by law in many countries
- Better accessibility = better SEO

### Quick checklist:
```html
<!-- 1. Use alt text for images -->
<img src="house.jpg" alt="Cozy beachfront cottage in Goa">
<img src="divider.svg" alt="">  <!-- Decorative: empty alt -->

<!-- 2. Label form inputs -->
<label for="email">Email</label>
<input type="email" id="email" name="email">

<!-- 3. Use semantic HTML instead of div soup -->
<button onclick="...">Click me</button>   <!-- ✅ keyboard-accessible -->
<div onclick="...">Click me</div>         <!-- ❌ not keyboard-accessible -->

<!-- 4. Proper heading hierarchy -->
<h1>Page Title</h1>       <!-- ONE per page -->
  <h2>Section</h2>
    <h3>Subsection</h3>   <!-- Don't skip levels -->

<!-- 5. ARIA labels when needed -->
<button aria-label="Close dialog">✕</button>
<nav aria-label="Main navigation">...</nav>
```

### Keyboard navigation:
- Every interactive element must be reachable via `Tab` key
- Use `button` for actions, `a` for navigation
- Never remove `outline` on focus without replacing it:
```css
/* ❌ Bad */
button:focus { outline: none; }

/* ✅ Good */
button:focus { outline: 3px solid #6c63ff; outline-offset: 2px; }
```

---

## PERFORMANCE BASICS

### Why performance matters:
- 53% of users leave if a page takes >3 seconds to load
- Google uses page speed as a ranking factor

### Quick wins:
```html
<!-- 1. Load CSS in <head>, JS at end or with defer -->
<link rel="stylesheet" href="style.css">           <!-- in <head> -->
<script src="app.js" defer></script>               <!-- before </body> -->

<!-- 2. Lazy load images below the fold -->
<img src="photo.jpg" loading="lazy" alt="...">

<!-- 3. Use modern image formats -->
<picture>
    <source srcset="photo.webp" type="image/webp">
    <img src="photo.jpg" alt="...">               <!-- fallback -->
</picture>

<!-- 4. Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
```

```css
/* 5. Use transform for animations (GPU-accelerated) */
/* ✅ Fast: */
.element { transform: translateX(100px); }

/* ❌ Slow (causes layout recalculation): */
.element { left: 100px; }

/* 6. will-change hint (use sparingly) */
.animated-card {
    will-change: transform;  /* tells browser to prepare GPU layer */
}
```

---

## DEVELOPER TOOLS

### Chrome DevTools (F12) — the most important tool:

| Tab | What it's for |
|-----|--------------|
| **Elements** | Inspect/edit HTML & CSS live |
| **Console** | Run JS, see errors and logs |
| **Network** | See all requests/responses — debug API calls |
| **Sources** | Debug JS with breakpoints |
| **Application** | See cookies, localStorage, sessionStorage |
| **Lighthouse** | Audit for performance, SEO, accessibility |

### Console shortcuts:
```js
console.log('basic log');
console.error('error message');           // Red
console.warn('warning');                  // Yellow
console.table([{ name: 'Alex', age: 25 }]); // Tabular format
console.time('label'); /* code */ console.timeEnd('label'); // Measure time
```

---

## VERSION CONTROL (GIT)

### Workflow every developer uses:
```bash
# Setup (once per project)
git init
git remote add origin <repo-url>

# Daily workflow
git status                    # See what changed
git add .                     # Stage all changes
git add src/style.css         # Stage specific file
git commit -m "feat: add glassmorphism navbar"
git push origin main

# Branching (important!)
git checkout -b feature/auth  # Create and switch to new branch
git merge feature/auth        # Merge branch into current
git branch -d feature/auth    # Delete branch after merge

# Undoing things
git restore style.css         # Discard unstaged changes to file
git reset HEAD~1              # Undo last commit (keep changes)
git revert <commit-hash>      # Safe undo (creates new commit)
```

### Commit message convention (use this):
```
feat: add user authentication
fix: resolve navbar overflow on mobile
style: improve button hover animation
refactor: split routes into separate files
docs: update README with setup instructions
```

---

## IMPORTANT CONCEPTS GLOSSARY

| Term | Simple Explanation |
|------|--------------------|
| **Rendering** | Browser converting HTML/CSS/JS into pixels on screen |
| **Repaint** | Browser redraws element appearance (color, shadow) — cheaper |
| **Reflow/Layout** | Browser recalculates positions and sizes — expensive |
| **Critical Rendering Path** | The steps browser takes to show first pixel |
| **Blocking resource** | A file (JS/CSS) that stops rendering until it loads |
| **CORS** | Security rule: browser blocks JS from requesting different domains unless server allows it |
| **Cookie** | Small data stored in browser, sent with every request automatically |
| **localStorage** | Browser storage, persists after tab closes, NOT sent to server |
| **sessionStorage** | Like localStorage but cleared when tab closes |
| **JWT** | JSON Web Token — a signed string proving who you are |
| **Session** | Server-side storage of user data, identified by a cookie |
| **Hashing** | One-way transformation of data (passwords stored as hashes) |
| **CDN** | Content Delivery Network — servers around the world to serve files faster |
| **Minification** | Remove spaces/comments from JS/CSS to reduce file size |
| **SPA** | Single Page Application — all routing done by JS, no full page reloads |
| **SSR** | Server-Side Rendering — HTML built on the server (better SEO) |
| **CSR** | Client-Side Rendering — HTML built in browser via JS |
| **REST** | Architectural style for APIs: uses HTTP methods + stateless |
| **Idempotent** | Calling an operation multiple times gives same result (GET, PUT are idempotent; POST is not) |
| **Middleware** | Function that runs between request and response |
| **MVC** | Model-View-Controller — pattern to organize app code |
| **ORM/ODM** | Layer between your code and database (Mongoose is an ODM) |
| **Environment Variable** | Config values stored outside code (API keys, passwords) |

---

## LEARNING RESOURCES

### 📖 Documentation (official — always accurate)
| Resource | URL | What For |
|----------|-----|---------|
| MDN Web Docs | https://developer.mozilla.org | HTML, CSS, JS reference — the gold standard |
| Node.js Docs | https://nodejs.org/docs | Node.js built-in modules |
| Express.js Docs | https://expressjs.com | Express API reference |
| Mongoose Docs | https://mongoosejs.com/docs | Mongoose schema/query reference |

### 🎨 Design Inspiration
| Resource | URL | What For |
|----------|-----|---------|
| **Dribbble** | https://dribbble.com | Beautiful UI design shots — use as inspiration |
| **Behance** | https://behance.net | Full project case studies, UI/UX |
| **Awwwards** | https://awwwards.com | Award-winning websites — cutting edge designs |
| **Land-book** | https://land-book.com | Landing page inspiration |
| **UI Land** | https://ui.land | UI component gallery |
| **Dark Design** | https://www.dark.design | Dark mode website inspiration |

### 🎨 Color & Typography Tools
| Resource | URL | What For |
|----------|-----|---------|
| **Coolors** | https://coolors.co | Generate beautiful color palettes |
| **ColorHunt** | https://colorhunt.co | Curated color palettes |
| **Google Fonts** | https://fonts.google.com | Free web fonts |
| **Fontpair** | https://fontpair.co | Font pairing recommendations |
| **Realtime Colors** | https://realtimecolors.com | Preview colors on a real UI |

### 🛠️ CSS Tools
| Resource | URL | What For |
|----------|-----|---------|
| **CSS Tricks** | https://css-tricks.com | In-depth CSS guides and flexbox/grid reference |
| **Glassmorphism Generator** | https://hype4.academy/tools/glassmorphism-generator | Generate glass effect CSS |
| **Neumorphism** | https://neumorphism.io | Generate soft UI / neumorphic designs |
| **Gradient Generator** | https://cssgradient.io | Visual CSS gradient builder |
| **Clippy** | https://bennettfeely.com/clippy | CSS clip-path shapes generator |
| **Animista** | https://animista.net | Ready-to-use CSS animations |
| **Box Shadow Generator** | https://box-shadow.dev | Visual box-shadow builder |
| **CSS Grid Generator** | https://cssgrid-generator.netlify.app | Visual grid layout builder |

### 📺 Learning Platforms
| Resource | URL | What For |
|----------|-----|---------|
| **The Odin Project** | https://theodinproject.com | Free full-stack curriculum (highly recommended) |
| **freeCodeCamp** | https://freecodecamp.org | Free structured courses with certifications |
| **javascript.info** | https://javascript.info | Best JS tutorial on the internet |
| **web.dev** | https://web.dev/learn | Google's guide to modern web dev |
| **Scrimba** | https://scrimba.com | Interactive coding tutorials |

### 🧰 Icons & Assets
| Resource | URL | What For |
|----------|-----|---------|
| **Font Awesome** | https://fontawesome.com | Icon library (you use this!) |
| **Heroicons** | https://heroicons.com | Clean SVG icons by Tailwind team |
| **Phosphor Icons** | https://phosphoricons.com | Flexible icon family |
| **unDraw** | https://undraw.co | Free SVG illustrations |
| **Unsplash** | https://unsplash.com | Free high-quality photos |
| **Pexels** | https://pexels.com | Free stock photos and videos |

---

> 📝 **Keep learning — web dev evolves fast. Revisit this file as you grow!**

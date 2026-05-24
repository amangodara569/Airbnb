# 📖 WORKFLOW WEB DEV — Your MERN Learning Reference
> Personal reference notes for full-stack web development
> Based on YOUR Wanderlust (Airbnb Clone) project
> **Current Level:** CRUD + Validation + Error Handling + Reviews (One-to-Many Relationship) ✅

---

## 📂 FILES IN THIS FOLDER

| # | File | What's Inside |
|---|------|-------------|
| 01 | [01_workflow.md](./01_workflow.md) | **Complete project workflow** — Step-by-step phases from setup to deployment. The big picture of how everything connects. |
| 02 | [02_database.md](./02_database.md) | **Database (MongoDB + Mongoose)** — Connection, schemas, models, CRUD operations, Mongoose validation, Joi validation, seeding, relationships, populate(). |
| 03 | [03_ejs_templates.md](./03_ejs_templates.md) | **EJS Templates** — Syntax, layouts (ejs-mate), partials (includes), passing data, loops, conditionals, forms, method-override, client validation. |
| 04 | [04_routing.md](./04_routing.md) | **Express Routing** — HTTP methods, RESTful routes, route parameters, req/res objects, route order, static files, Express Router (full implementation). |
| 05 | [05_middlewares.md](./05_middlewares.md) | **Middlewares** — Types, built-in middleware, custom middleware, validation middleware (listing + review), error handling, wrapAsync, custom error class, complete error flow. |
| 06 | [06_packages_config.md](./06_packages_config.md) | **NPM Packages & Config** — All packages explained, nodemon, .gitignore, environment variables, future packages list. |
| 07 | [07_css_styling.md](./07_css_styling.md) | **CSS & Styling** — Bootstrap usage, custom CSS organization, glassmorphism, static files, Font Awesome. |
| 08 | [08_code_reference.md](./08_code_reference.md) | **Complete Code Reference** — Every important code file in your project, copy-paste ready (updated with Reviews). |
| 09 | [09_reviews.md](./09_reviews.md) | **Reviews Feature** — Full deep dive into Reviews: model, routes, templates, populate(), Joi validation, cascade delete. |

---

## 🎯 YOUR CURRENT PROJECT STATUS

### ✅ What you've COMPLETED:
- [x] Project setup (Express, Mongoose, EJS)
- [x] MongoDB connection & Listing model
- [x] All 7 RESTful CRUD routes
- [x] EJS templates with ejs-mate layouts
- [x] Navbar & Footer partials
- [x] Glassmorphism dark theme design
- [x] Database seeding (30 sample listings)
- [x] Custom error class (expressError)
- [x] Async error wrapper (wrapAsync)
- [x] Error handling middleware
- [x] 404 catch-all route
- [x] Client-side validation (Bootstrap)
- [x] Server-side validation (Joi) — for Listings
- [x] Validation middleware (validateListing)
- [x] Review model (One-to-Many relationship)
- [x] Reviews added to Listing model (array of ObjectIds)
- [x] POST /listings/:id/reviews — Create review route
- [x] Joi validation for reviews (validateReview middleware)
- [x] populate('reviews') — Show reviews on listing page
- [x] Reviews displayed on show.ejs page

### 🔜 What's NEXT:
- [ ] Delete Review route (DELETE /listings/:id/reviews/:reviewId)
- [ ] Mongoose middleware — cascade delete reviews when listing is deleted
- [ ] Express Router (split routes into files)
- [ ] Star rating display for reviews
- [ ] Authentication (Passport.js — login/signup)
- [ ] Authorization (isLoggedIn, isOwner)
- [ ] Sessions & Cookies
- [ ] Flash messages
- [ ] Image upload (Multer + Cloudinary)
- [ ] Maps (Mapbox)
- [ ] Deployment

---

## 🔍 HOW TO USE THESE FILES

1. **Starting a new project?** → Read `01_workflow.md` for the step-by-step process
2. **Working with database?** → Check `02_database.md` for queries and validation
3. **Building a template?** → Check `03_ejs_templates.md` for syntax and patterns
4. **Creating a route?** → Check `04_routing.md` for RESTful patterns
5. **Adding middleware?** → Check `05_middlewares.md` for patterns and error handling
6. **Installing a package?** → Check `06_packages_config.md` for what each package does
7. **Styling a page?** → Check `07_css_styling.md` for design patterns
8. **Need to copy code?** → Check `08_code_reference.md` for all code snippets

---

## ⚠️ KNOWN BUG

There's a typo in `utils/wrapAsync.js` — `fb` should be `fn`. See `08_code_reference.md` for the fix.

## ⚠️ KNOWN ISSUE IN SCHEMA.JS

`listingSchema` is exported **twice** in `schema.js` — the second export overwrites the first, so `listingSchema` actually contains the `reviewSchema` definition. This means listing validation is broken! Fix: rename the second export to `reviewSchema`. See `09_reviews.md` for details.

---

> 📝 All files will be updated as you progress through the project!

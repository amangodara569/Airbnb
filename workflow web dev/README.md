# 📖 WORKFLOW WEB DEV — Your MERN Learning Reference
> Personal reference notes for full-stack web development
> Based on YOUR Wanderlust (Airbnb Clone) project
> **Current Level:** Full CRUD + Validation + Error Handling + Reviews Feature (Create/Delete/Populate) + Express Router (routes split) + Sessions/Cookies/Flash Messages ✅

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
| 08 | [08_code_reference.md](./08_code_reference.md) | **Complete Code Reference** — Every important code file in your project, copy-paste ready (updated with Reviews + Router). |
| 09 | [09_reviews.md](./09_reviews.md) | **Reviews Feature** — Full deep dive into Reviews: model, routes, templates, populate(), Joi validation, cascade delete. |
| 10 | [10_sessions_cookies.md](./10_sessions_cookies.md) | **Sessions & Cookies** — Theory, cookie-parser, signed cookies, express-session, connect-mongo, connect-flash, flash messages, security best practices. |
| 11 | [11_project_mental_map.md](./11_project_mental_map.md) | **Project Mental Map** — How a senior dev thinks, design resources, AI tools, fastest path for any project type, universal folder structure. |

---

## 🎯 YOUR CURRENT PROJECT STATUS

### ✅ What you've COMPLETED:
- [x] Project setup (Express, Mongoose, EJS)
- [x] MongoDB connection & Listing model
- [x] All 7 RESTful CRUD routes (Index, New, Create, Show, Edit, Update, Delete)
- [x] EJS templates with ejs-mate layouts
- [x] Navbar & Footer partials
- [x] Glassmorphism dark theme design
- [x] Database seeding (30 sample listings)
- [x] Custom error class (expressError)
- [x] Async error wrapper (wrapAsync)
- [x] Error handling middleware (4-param error handler)
- [x] 404 catch-all route
- [x] Client-side validation (Bootstrap)
- [x] Server-side validation (Joi) — for Listings & Reviews
- [x] Validation middleware (validateListing + validateReview)
- [x] Review model (One-to-Many relationship)
- [x] Reviews added to Listing model (array of ObjectIds)
- [x] POST /listings/:id/reviews — Create review route
- [x] DELETE /listings/:id/reviews/:reviewId — Delete review route
- [x] Cascade delete (post middleware) — Auto-delete reviews when listing deleted
- [x] populate('reviews') — Show reviews on listing page
- [x] Reviews displayed on show.ejs page with ratings, comments, timestamps
- [x] Express Router — routes split into `route/listing.js` + `route/review.js`
- [x] Router mounting with mergeParams for nested routes
- [x] `$pull` operator to remove review from listing array
- [x] express-session configured with cookie options
- [x] connect-flash for flash messages (success & error)
- [x] Flash messages displayed in views (includes/flash.ejs)
- [x] Flash on create listing, delete listing, create review, delete review routes

### 🔜 What's NEXT:
- [ ] Mongoose post middleware — cascade delete reviews when listing is deleted
- [ ] Authentication (Passport.js — login/signup/logout)
- [ ] User model with passport-local-mongoose
- [ ] Sessions (express-session + connect-mongo)
- [ ] Flash messages (connect-flash)
- [ ] Authorization (isLoggedIn, isOwner middlewares)
- [ ] Image upload (Multer + Cloudinary)
- [ ] Maps (Mapbox)
- [ ] Deployment (Render + MongoDB Atlas)

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
9. **Cookies/Sessions?** → Check `10_sessions_cookies.md` for theory and working code
10. **Starting a new project?** → Check `11_project_mental_map.md` for the full process

---

## ✅ KNOWN BUGS — FIXED

- `utils/wrapAsync.js` typo (`fb` → `fn`) — **FIXED**
- `schema.js` double export issue — **FIXED** (`reviewSchema` is now a separate export)

---

> 📝 All files will be updated as you progress through the project!

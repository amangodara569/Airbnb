# 📦 NPM PACKAGES & PROJECT CONFIG
> Quick reference for all packages, what they do, and configuration
> Based on YOUR Wanderlust project

---

## 📋 TABLE OF CONTENTS
1. [package.json Explained](#packagejson-explained)
2. [Your Current Packages](#your-current-packages)
3. [How to Install/Remove Packages](#how-to-installremove-packages)
4. [Future Packages You'll Need](#future-packages-youll-need)
5. [nodemon — Auto-restart](#nodemon--auto-restart)
6. [.gitignore](#gitignore)
7. [Environment Variables](#environment-variables-future)

---

## PACKAGE.JSON EXPLAINED

```json
{
    "name": "project_1",             // Project name
    "version": "1.0.0",             // Version number
    "description": "",               // Short description
    "license": "ISC",               // License type
    "author": "aman",               // Your name
    "type": "commonjs",             // Module system (require/module.exports)
    "main": "index.js",             // Entry point (not used since you use app.js)
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "dependencies": {                // Installed packages
        "ejs": "^5.0.2",
        "ejs-mate": "^4.0.0",
        "express": "^5.2.1",
        "joi": "^18.2.1",
        "method-override": "^3.0.0",
        "mongoose": "^9.6.2"
    }
}
```

### What `^` means in versions:
```
"express": "^5.2.1"
            │ │ │
            │ │ └── Patch (bug fixes) — auto-updates
            │ └── Minor (new features, backward compatible) — auto-updates  
            └── Major (breaking changes) — stays fixed

"^5.2.1" means: install 5.x.x (any minor/patch), but NOT 6.0.0
```

---

## YOUR CURRENT PACKAGES

| Package | Version | Purpose | Require Statement |
|---------|---------|---------|-------------------|
| `express` | ^5.2.1 | Web framework — routes, middleware, server | `require('express')` |
| `mongoose` | ^9.6.2 | MongoDB ODM — models, queries | `require('mongoose')` |
| `ejs` | ^5.0.2 | Template engine — HTML with JavaScript | Auto-used by Express |
| `ejs-mate` | ^4.0.0 | Layout/boilerplate support for EJS | `require('ejs-mate')` |
| `method-override` | ^3.0.0 | Support PUT/DELETE from HTML forms | `require('method-override')` |
| `joi` | ^18.2.1 | Data validation (server-side) | `require('joi')` |

### Where each is used:

#### Express (the foundation):
```js
// app.js
const express = require('express');
const app = express();
app.listen(3000, () => { ... });
app.get('/path', handler);
app.use(middleware);
```

#### Mongoose (database):
```js
// app.js — Connection
const mongoose = require('mongoose');
await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

// models/listing.js — Schema & Model
const mongoose = require('mongoose');
const schema = new mongoose.Schema({ ... });
const Listing = mongoose.model('Listing', schema);
```

#### EJS (templates):
```js
// app.js — Config (ejs itself doesn't need require, Express handles it)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));

// In routes
res.render('listings/index.ejs', { data });
```

#### ejs-mate (layouts):
```js
// app.js
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

// In templates
<%- layout('layouts/boilerplate') %>
```

#### method-override:
```js
// app.js
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// In forms (edit.ejs, show.ejs)
// <form action="/listings/<%= id %>?_method=PUT" method="POST">
// <form action="/listings/<%= id %>?_method=DELETE" method="POST">
```

#### Joi (validation):
```js
// schema.js
const Joi = require('joi');
module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    // ...
});

// app.js
const { listingSchema } = require('./schema.js');
let { error } = listingSchema.validate(req.body);
```

---

## HOW TO INSTALL/REMOVE PACKAGES

### Install a package:
```bash
npm install package-name              # Install and save to dependencies
npm install package-name --save-dev   # Install as dev dependency (not for production)
npm install -g package-name           # Install globally (available everywhere)
npm i package-name                    # Shorthand for install
```

### Remove a package:
```bash
npm uninstall package-name
```

### Install all dependencies (from package.json):
```bash
npm install    # Run this after cloning a project
```

### node_modules folder:
- Contains ALL installed packages and their dependencies
- **NEVER** push to Git (add to .gitignore)
- Can be recreated with `npm install`

---

## FUTURE PACKAGES YOU'LL NEED

| Package | Purpose | When you'll need it |
|---------|---------|-------------------|
| `passport` | Authentication framework | Login/Signup |
| `passport-local` | Username/password auth strategy | Login/Signup |
| `passport-local-mongoose` | Simplifies passport + mongoose integration | Login/Signup |
| `express-session` | Session management | Login persistence |
| `connect-flash` | Flash messages (success/error notifications) | After CRUD operations |
| `multer` | File upload handling | Image uploads |
| `cloudinary` | Cloud image storage | Store uploaded images |
| `multer-storage-cloudinary` | Connect multer to cloudinary | Image upload pipeline |
| `dotenv` | Load environment variables from .env file | API keys, secrets |
| `connect-mongo` | Store sessions in MongoDB | Production session storage |
| `@mapbox/mapbox-sdk` | Maps and geocoding | Show listings on map |
| `helmet` | Security middleware | Production security |

### Install command for next phase (Reviews + Auth):
```bash
npm install passport passport-local passport-local-mongoose express-session connect-flash
```

---

## NODEMON — AUTO-RESTART

### What is it?
- Automatically restarts your server when you change files
- No more manually stopping and running `node app.js` every time

### Install:
```bash
npm install -g nodemon    # Install globally (recommended)
# OR
npm install --save-dev nodemon    # Install as dev dependency
```

### Use:
```bash
nodemon app.js    # Instead of 'node app.js'
# Now every time you save a file, server auto-restarts!
```

### Add to package.json scripts:
```json
"scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
}
```
Then run: `npm run dev`

---

## GITIGNORE

### Create a `.gitignore` file in your project root:
```
# Dependencies
node_modules/

# Environment variables
.env

# OS files
.DS_Store
Thumbs.db

# IDE settings
.vscode/
.idea/

# Logs
*.log
npm-debug.log*
```

### Why?
- `node_modules/` is HUGE (hundreds of MB) — can be recreated with `npm install`
- `.env` contains secrets (passwords, API keys) — NEVER share
- OS/IDE files are personal settings — not relevant to code

---

## ENVIRONMENT VARIABLES (FUTURE)

### What are they?
- Secret values (API keys, database passwords, secret keys)
- Should NOT be hardcoded in your code
- Stored in a `.env` file (not pushed to Git)

### Setup (when you need it):
```bash
npm install dotenv
```

### Create `.env` file:
```
# .env (in project root)
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/wanderlust
SECRET=mysupersecretkey
CLOUDINARY_CLOUD_NAME=mycloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdefgh
MAP_TOKEN=pk.abc123def456
PORT=3000
```

### Use in code:
```js
// At the TOP of app.js
require('dotenv').config();

// Access variables
const dbUrl = process.env.MONGODB_URL;
const secret = process.env.SECRET;
const port = process.env.PORT || 3000;

// Use in connection
await mongoose.connect(dbUrl);
app.listen(port);
```

> 📝 You'll set this up when you're ready to deploy!

---

## 🧠 USEFUL NPM COMMANDS

```bash
npm init -y                    # Initialize new project
npm install <package>          # Install package
npm install                    # Install all from package.json
npm uninstall <package>        # Remove package
npm update                     # Update all packages
npm list                       # Show installed packages
npm list --depth=0             # Show only top-level packages
npm outdated                   # Show outdated packages
npm run <script>               # Run a script from package.json
```

---

> 📝 **This file will be updated as you add more packages!**

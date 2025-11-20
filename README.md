# Full-Stack E-Commerce Store

A complete e-commerce web application built from scratch with a vanilla JavaScript frontend and a Node.js/Express backend, deployed to a live cloud database on MongoDB Atlas.

## Features
- **Full-Stack Architecture:** Separate frontend and backend codebases.
- **Database Integration:** Products are fetched from a MongoDB database.
- **Live Product Search:** A dynamic search bar that filters products in real-time.
- **Secure User Authentication:** Users can register and log in. Passwords are fully encrypted (hashed) using `bcryptjs`, and sessions are managed with JSON Web Tokens (JWT).
- **Database-Driven Shopping Cart:** The user's cart is saved to their account and persists across sessions and devices.
- **Multi-Step Checkout:** A complete checkout flow for address and payment simulation.
- **Order History:** Successful orders are saved to the database and can be viewed by the user.

## Technologies Used
- **Frontend:** HTML, Tailwind CSS, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose (hosted on MongoDB Atlas)
- **Authentication:** `bcryptjs` for password hashing, `jsonwebtoken` for sessions.
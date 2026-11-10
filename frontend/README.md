# Bangels Verse Frontend

A modern React frontend for the Bangels Verse jewelry e-commerce platform.

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **React Icons** for icons
- **Socket.io Client** for real-time updates
- **Razorpay** for payments

## Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000` and proxies API calls to `http://localhost:5002`.

## Features

### Customer
- Browse products with search & category filters
- Add to cart & checkout
- Online payments via Razorpay
- Credit (buy now, pay later) system
- Order history & tracking
- Product reviews & ratings

### Shop Owner
- Dashboard with sales analytics
- Add/delete products
- View transactions & credit ledger

### Admin
- View all orders
- Transaction overview
- Revenue tracking

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── App.jsx         # Main app with routing
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

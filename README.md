# Mini Project E-commerce

A full-stack e-commerce application built with Encore.ts backend and React frontend.

## Features

- **Product Management**: Browse products with category and price filters
- **Authentication**: User registration, login with JWT authentication
- **Shopping Cart**: Add products to cart and checkout
- **Order Management**: View order history and details
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Tech Stack

- **Backend**: Encore.ts (TypeScript)
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT with Clerk
- **UI**: Tailwind CSS, shadcn/ui components

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- Encore CLI (`npm install -g @encore/cli`)

### Backend Setup

1. Install Encore CLI if you haven't:
```bash
npm install -g @encore/cli
```

2. The backend uses PostgreSQL and requires these secrets to be set:
   - `ClerkSecretKey`: Your Clerk secret key for authentication

3. Set up secrets in the Leap UI Infrastructure tab:
   - Go to Infrastructure tab
   - Add `ClerkSecretKey` with your Clerk secret key

### Frontend Setup

1. Update the frontend configuration:
   - Edit `frontend/config.ts`
   - Set your Clerk publishable key

### Running the Application

1. Start the development server:
```bash
encore run
```

2. The application will be available at:
   - Backend API: `http://localhost:4000`
   - Frontend: `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Products
- `GET /products` - List products with filters
- `GET /products/:id` - Get product details

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details

## Project Structure

```
├── backend/
│   ├── auth/           # Authentication service
│   ├── products/       # Products service  
│   ├── orders/         # Orders service
│   └── shared/         # Shared types and utilities
├── frontend/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   └── types/          # TypeScript types
└── README.md
```

## Development

### Backend Development

The backend is built with Encore.ts and automatically handles:
- Database migrations
- API routing
- Type safety between services
- Authentication middleware

### Frontend Development

The frontend uses:
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui for components
- React Query for API state management

### Testing

Tests are automatically executed using vitest for both frontend and backend.

## Deployment

The application can be deployed using Encore's built-in deployment system. See Encore documentation for deployment instructions.

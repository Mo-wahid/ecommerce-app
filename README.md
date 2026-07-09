# Full-Stack E-Commerce Application

A modern, responsive, full-stack e-commerce application built with Next.js (App Router), MongoDB, and Tailwind CSS. This project serves as a comprehensive example of a functional web store complete with user authentication, product management, cart functionality, and order processing.

## 🌟 Features

- **Modern UI & Design:** Sleek, responsive design built with Tailwind CSS, including a seamless **Dark Mode**.
- **Authentication:** Secure user login and registration powered by `next-auth` (Credentials provider) and `bcryptjs`.
- **Role-Based Access Control:** Distinct roles for regular users and administrators.
- **Product Management (Admin):** Dedicated admin dashboard to view, add, edit, and delete products. Includes Cloudinary integration for product image uploads.
- **Product Catalog:** Browse products, filter by category, and view detailed product pages.
- **Shopping Cart:** Add, remove, and update quantities of items in the cart.
- **Checkout Process:** Functional checkout flow capturing customer shipping information.
- **Order Tracking:** Users can view their order history and status.
- **Data Validation:** Robust schema validation using `zod` and `react-hook-form`.

## 💻 Tech Stack

- **Framework:** [Next.js 15+ (App Router)](https://nextjs.org/)
- **Language:** TypeScript
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ORM
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Form Validation:** `react-hook-form` & `zod`
- **Image Hosting:** [Cloudinary](https://cloudinary.com/)
- **Icons:** `lucide-react`
- **UI Notifications:** `react-hot-toast`

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js 18.x or higher
- A MongoDB database (local instance or MongoDB Atlas)
- A Cloudinary account (for image hosting)

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ecommerce-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# MongoDB Connection String
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"

# NextAuth Configuration
NEXTAUTH_SECRET="your_generated_secret_here" # Generate one using: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔐 Managing Users and Roles

By default, newly registered users are given the `user` role.

To grant a user **admin** privileges (allowing them to access the `/admin` dashboard and manage products):
1. Register an account normally through the application.
2. Access your MongoDB database (e.g., via MongoDB Compass or Atlas).
3. Find the user document in the `users` collection.
4. Change the `role` field from `"user"` to `"admin"`.
5. Log out and log back in to apply the new permissions.

## 📁 Project Structure Highlights

- `src/app/` - Next.js App Router pages (Home, Auth, Cart, Checkout, Orders, Admin).
- `src/app/api/` - Next.js API Routes for backend functionality (Auth, Products, Cart, Orders, Upload).
- `src/components/` - Reusable React components (Navbar, Product Cards, ThemeProvider, etc.).
- `src/lib/` - Utility functions and configurations (MongoDB connection, NextAuth options, Cloudinary setup).
- `src/models/` - Mongoose schemas (User, Product, Order).
- `src/types/` - TypeScript interface definitions.

## 📝 License

This project is open-source and available under the MIT License.

# Full-Stack E-Commerce Application

A modern, high-performance, full-stack e-commerce application built with **Next.js 16 (App Router)**, **MongoDB**, **Tailwind CSS v4**, and **shadcn/ui**. Complete with authentication, role-based admin dashboard, cart management, checkout workflow, automated Playwright E2E tests, and Storybook component documentation.

---

## 🌟 Features

- **Modern UI & Design System:** Built with `shadcn/ui` primitives, Tailwind CSS v4, Lucide icons, and modern micro-animations including Light/Dark mode.
- **Image Optimization:** Leveraging Next.js `<Image />` for dynamic WebP conversion, responsive sizing (`srcset`), lazy loading, and layout stability.
- **Code Splitting & Lazy Loading:** Dynamic imports (`next/dynamic`) for non-critical modals and dialogs, reducing initial JavaScript bundle sizes.
- **Separated API Layer:** Clean decoupling of network requests from UI presentation via a centralized `apiClient` (`src/lib/api-client.ts`).
- **Resilient Error Boundaries:** Next.js `error.tsx` boundaries implemented globally, for the admin portal, and across product pages.
- **Authentication & RBAC:** Secure JWT sessions via `NextAuth.js` with role-based authorization for admin dashboards.
- **Product & Category Management (Admin):** CRUD operations with Cloudinary image upload integrations.
- **End-to-End Testing:** Automated Playwright test suite covering authentication, product catalog browsing, cart operations, checkout flow, and admin actions.
- **Component Documentation:** Interactive Storybook workspace containing isolated stories for reusable UI components (`npm run storybook`).

---

## 💻 Tech Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Language:** TypeScript
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ORM
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **State & Form Validation:** `react-hook-form` & `zod`
- **Testing:** [Playwright](https://playwright.dev/) (E2E) & [Vitest](https://vitest.dev/)
- **Documentation:** [Storybook](https://storybook.js.org/)
- **Image Hosting:** Cloudinary

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.x` or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection string

### 1. Clone & Install Dependencies

```bash
git clone <your-repository-url>
cd ecommerce-app
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI="mongodb://localhost:27017/ecommerce-app"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret_key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (Optional for uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

### Run End-to-End Tests (Playwright)
```bash
npm run test:e2e
# Or open Playwright UI mode:
npx playwright test --ui
```

### Build & View Component Storybook
```bash
npm run storybook
# Build static storybook:
npm run build-storybook
```

### Performance Production Build Benchmark
```bash
npm run build
npm run start
```

---

## 📁 Architecture & File Structure

```
├── .storybook/           # Storybook configuration & presets
├── playwright.config.ts  # Playwright E2E test configuration
├── src/
│   ├── app/              # Next.js App Router (pages, layouts, error & loading states)
│   │   ├── admin/        # Admin dashboard & management routes
│   │   ├── api/          # Serverless REST API endpoints
│   │   ├── cart/         # Shopping cart page
│   │   ├── checkout/     # Dual-column responsive checkout page
│   │   ├── products/     # Product catalog & details pages
│   │   ├── error.tsx     # Global Error Boundary fallback
│   │   └── loading.tsx   # Global loading fallback skeleton
│   ├── components/       # Core UI components
│   │   └── ui/           # Reusable shadcn/ui primitives (Button, Card, Input, Dialog, etc.)
│   ├── lib/              # Decoupled utility libraries
│   │   ├── api-client.ts # Centralized network API layer
│   │   ├── authOptions.ts# NextAuth configuration options
│   │   └── dbConnect.ts  # Mongoose database connection singleton
│   ├── models/           # Mongoose Database Schemas (User, Product, Category)
│   ├── stories/          # Storybook component stories
│   └── types/            # TypeScript type declarations & interfaces
└── tests/
    └── e2e/              # E2E test specifications
```

---

## 📝 License

Distributed under the MIT License.

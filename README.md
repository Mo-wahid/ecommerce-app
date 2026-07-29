<div align="center">
  
  # 🛍️ Next.js Full-Stack E-Commerce Platform
  
  *A high-performance, enterprise-grade e-commerce application built for scale and speed.*
  
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  
</div>

---

## 📸 Showcase

> **👋 Note to developer**: *Replace these placeholder URLs with your actual Imgur or GitHub Assets links to show off your UI!*

<div align="center">
  <img src="https://placehold.co/800x400/18181b/ffffff?text=Replace+with+Homepage+Screenshot" alt="Homepage Preview" width="100%" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
  <p><i>The modern, responsive storefront built with shadcn/ui.</i></p>
</div>

### 갤️ Gallery

<details>
<summary><b>Click to expand and view more screenshots!</b></summary>
<br>

| Admin Dashboard | Product Catalog |
|:---:|:---:|
| <img src="https://placehold.co/400x250/18181b/ffffff?text=Admin+Dashboard" width="100%" style="border-radius: 6px;"> | <img src="https://placehold.co/400x250/18181b/ffffff?text=Product+Catalog" width="100%" style="border-radius: 6px;"> |
| *Role-based CMS for managing products & categories.* | *Server-side paginated catalog with full-text search.* |

| Swagger API Docs | Shopping Cart |
|:---:|:---:|
| <img src="https://placehold.co/400x250/18181b/ffffff?text=Swagger+API+UI" width="100%" style="border-radius: 6px;"> | <img src="https://placehold.co/400x250/18181b/ffffff?text=Shopping+Cart" width="100%" style="border-radius: 6px;"> |
| *Interactive API documentation auto-generated via JSDoc.* | *Persistent cart state across sessions.* |

</details>

---

## 🌟 Key Features

- 🎨 **Modern UI & Design System:** Built with `shadcn/ui` primitives, Tailwind CSS v4, Lucide icons, and modern micro-animations (including Light/Dark mode).
- ⚡ **Redis Caching Layer:** Millisecond API response times via `Upstash Redis`. Implements Write-Around caching with automatic invalidation.
- 🔍 **Optimized Database Queries:** Native MongoDB `$text` indexing and aggressive pagination (`.skip()` / `.limit()`) rather than heavy regex lookups.
- 🖼️ **Image Optimization:** Dynamic WebP conversion, responsive sizing (`srcset`), and lazy loading via Next.js `<Image />` & Cloudinary.
- 🛡️ **Authentication & RBAC:** Secure JWT sessions via `NextAuth.js` with role-based authorization for the admin portal.
- 📦 **Separated API Layer:** Clean decoupling of network requests from UI presentation via a centralized `apiClient`.
- 📖 **Interactive API Docs:** Fully documented REST endpoints via `swagger-ui-react`.
- 🧪 **Automated Testing:** Playwright E2E tests and isolated component documentation via Storybook.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection string
- *(Optional)* **Upstash Redis**: For extreme API performance

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

# Cloudinary (Optional for admin uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Upstash Redis (Optional for caching API responses)
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 API Documentation & Postman

The project uses `swagger-ui-react` to automatically generate API documentation from OpenAPI JSDoc comments.
- **View API Docs**: Navigate to `http://localhost:3000/api-docs` while the dev server is running.
- **Postman Collection**: Import the `ecommerce-api.postman_collection.json` file at the root of the repository into Postman to instantly test all endpoints.

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

## 📁 Architecture

```
├── .storybook/           # Component library configuration
├── playwright.config.ts  # E2E test configuration
├── src/
│   ├── app/              # Next.js App Router (pages, API routes, layout)
│   │   ├── admin/        # RBAC Dashboard routes
│   │   ├── api/          # Serverless REST endpoints
│   │   ├── api-docs/     # Swagger UI viewer
│   ├── components/       # Reusable UI components & shadcn primitives
│   ├── lib/              # Utilities (API Client, Redis, Mongoose)
│   ├── models/           # Database Schemas
│   └── types/            # TypeScript interfaces
└── tests/                # Playwright spec files
```

---

<div align="center">
  <p>Built with ❤️ using Next.js & Tailwind CSS.</p>
</div>

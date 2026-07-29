export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { redis, hasRedis } from "@/lib/redis";
import { measureTime } from "@/lib/measure";

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of products
 *     description: Fetch products with pagination, sorting, and full-text search.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price_asc, price_desc]
 *           default: newest
 *         description: Sorting method
 *     responses:
 *       200:
 *         description: A paginated list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalCount:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Server error
 */
// GET: Fetch all products (Public)
export async function GET(request: Request) {
  return await measureTime("GET /api/products", async () => {
    try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const sort = searchParams.get("sort") || "newest";

    const query: any = {};
    
    if (search) {
      // Use MongoDB text index for optimized search
      query.$text = { $search: search };
    }
    
    if (category && category !== "All" && category !== "All Categories") {
      query.category = category;
    }

    // Determine sort object
    let sortObj: any = { createdAt: -1 }; // Default: newest
    if (sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "price_desc") sortObj = { price: -1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };

    const skip = (page - 1) * limit;

    const isDefaultQuery = !search && (!category || category === "All" || category === "All Categories") && page === 1 && limit === 8 && sort === "newest";

    if (hasRedis && isDefaultQuery) {
      const cached = await redis.get("products_default_page");
      if (cached) {
        return NextResponse.json(cached, { status: 200 });
      }
    }

    // Fetch products and total count in parallel
    const [products, totalCount] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    const responseData = { 
      success: true, 
      data: products, 
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    };

    if (hasRedis && isDefaultQuery) {
      await redis.set("products_default_page", responseData, { ex: 3600 });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch products." }, { status: 500 });
  }
  });
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin)
 *     description: Creates a new product and invalidates the product cache.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       500:
 *         description: Server error
 */
// POST: Create a new product (Admin)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Note: In a fully secure production app, you would extract the user's token here 
    // and verify their role === "Admin" before allowing creation.
    
    const product = await Product.create(body);

    if (hasRedis) {
      await redis.del("products_default_page");
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create product.", error: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}
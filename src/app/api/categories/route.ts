import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { redis, hasRedis } from "@/lib/redis";
import { measureTime } from "@/lib/measure";

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve all categories
 *     description: Fetch all categories, including a computed product count for each category. Includes caching.
 *     responses:
 *       200:
 *         description: A list of categories with product counts
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
 *       500:
 *         description: Server error
 */
// GET: Fetch all categories with product count
export async function GET(request: Request) {
  return await measureTime("GET /api/categories", async () => {
    try {
      if (hasRedis) {
        const cached = await redis.get("categories_list");
        if (cached) {
          return NextResponse.json({ success: true, data: cached }, { status: 200 });
        }
      }

      await dbConnect();

    let categories = await Category.find({}).sort({ createdAt: -1 });

    // Seed default categories if collection is empty
    if (categories.length === 0) {
      const DEFAULT_SEED_CATEGORIES = [
        { name: "Electronics", description: "Gadgets, devices, and electronic accessories.", image: "/images/cat_electronics.png" },
        { name: "Clothing", description: "Apparel, footwear, and fashion items.", image: "/images/cat_clothing.png" },
        { name: "Books", description: "Fiction, non-fiction, textbooks, and literature.", image: "/images/cat_books.png" },
        { name: "Home & Garden", description: "Furniture, decor, and home tools.", image: "/images/cat_home.png" },
        { name: "Toys", description: "Games, toys, and entertainment for all ages.", image: "/images/cat_toys.png" },
        { name: "Sports & Outdoors", description: "Fitness equipment, sportswear, and outdoor gear.", image: "/images/cat_sports.png" },
        { name: "Beauty & Personal Care", description: "Skincare, cosmetics, and self-care products.", image: "/images/cat_beauty.png" },
        { name: "Automotive", description: "Car parts, accessories, and maintenance items.", image: "/images/cat_auto.png" },
      ];
      await Category.insertMany(DEFAULT_SEED_CATEGORIES);
      categories = await Category.find({}).sort({ createdAt: -1 });
    }

    // Compute product counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const itemCount = await Product.countDocuments({ category: cat.name });
        return {
          ...cat.toObject(),
          itemCount,
        };
      })
    );

    if (hasRedis) {
      // Cache for 1 hour
      await redis.set("categories_list", categoriesWithCount, { ex: 3600 });
    }

    return NextResponse.json({ success: true, data: categoriesWithCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories.", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
  });
}

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (Admin)
 *     description: Creates a new category and invalidates the category cache.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Category name is required or already exists
 *       500:
 *         description: Server error
 */
// POST: Create a new category (Admin)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { name, description, image } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, message: "Category name is required." }, { status: 400 });
    }

    // Check if category already exists
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Category with this name already exists." }, { status: 400 });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      image: image || "",
    });

    if (hasRedis) {
      await redis.del("categories_list");
    }

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create category.", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

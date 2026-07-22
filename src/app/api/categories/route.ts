import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";

// GET: Fetch all categories with product count
export async function GET(request: Request) {
  try {
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

    return NextResponse.json({ success: true, data: categoriesWithCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories.", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

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

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create category.", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

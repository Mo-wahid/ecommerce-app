import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { redis, hasRedis } from "@/lib/redis";

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Retrieve a single category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
// GET: Fetch a single category by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }
    const itemCount = await Product.countDocuments({ category: category.name });
    return NextResponse.json(
      { success: true, data: { ...category.toObject(), itemCount } },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch category." },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category by ID (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Category name already exists
 *       404:
 *         description: Category not found
 */
// PUT: Update a category by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    const oldName = existingCategory.name;
    const newName = body.name ? body.name.trim() : oldName;

    // Check if renaming to a name that already exists elsewhere
    if (newName !== oldName) {
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${newName}$`, "i") },
      });
      if (duplicate) {
        return NextResponse.json({ success: false, message: "Category with this name already exists." }, { status: 400 });
      }
    }

    existingCategory.name = newName;
    if (body.description !== undefined) existingCategory.description = body.description;
    if (body.image !== undefined) existingCategory.image = body.image;

    const updatedCategory = await existingCategory.save();

    // If category name changed, update all products that used oldName
    if (newName !== oldName) {
      await Product.updateMany({ category: oldName }, { category: newName });
    }

    if (hasRedis) {
      await redis.del("categories_list");
    }

    return NextResponse.json({ success: true, data: updatedCategory }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update category.", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category by ID (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
// DELETE: Delete a category by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    await Category.findByIdAndDelete(id);

    if (hasRedis) {
      await redis.del("categories_list");
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete category." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // 1. Extract the formData from the incoming request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded." }, { status: 400 });
    }

    // 2. Convert the Web File object to a Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Convert the Buffer to a Base64 string so Cloudinary can process it over HTTP
    const mimeType = file.type;
    const encoding = "base64";
    const base64Data = buffer.toString("base64");
    const fileUri = `data:${mimeType};${encoding},${base64Data}`;

    // 4. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: "ecommerce-products", // Organizes your images in a specific folder
    });

    // 5. Return the secure URL to the frontend
    return NextResponse.json(
      { success: true, url: result.secure_url },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json(
      { message: "Failed to upload image." },
      { status: 500 }
    );
  }
}   
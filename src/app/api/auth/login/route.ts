import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { 
        message: "Login successful.", 
        user: { id: user._id, name: user.name, email: user.email, role: user.role } 
      },
      { status: 200 }
    );
    // Attach an HTTP-only cookie for the Middleware to read securely
    response.cookies.set("userRole", user.role, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Only uses HTTPS in production
      path: "/", // Available across the entire site
      maxAge: 60 * 60 * 24 * 7, // Expires in 1 week
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred during login." },
      { status: 500 }
    );
  }
}
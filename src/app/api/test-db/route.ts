import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  try {
    // 1. Establish the connection using your cached utility
    await dbConnect();

    // 2. Interact via Mongoose Abstraction (Write Operation)
    // We use a timestamp for the email to ensure it is unique on every page refresh
    const testEmail = `test_${Date.now()}@example.com`;
    const newUser = await User.create({
      name: "Connection Test User",
      email: testEmail,
      password: "dummy_hashed_password", 
      role: "user"
    });

    // 3. Interact via Mongoose Abstraction (Read Operation)
    // Fetching the user back, explicitly excluding the password field from the result
    const fetchedUser = await User.findOne({ email: testEmail }).select("-password");

    // 4. Return the success state
    return NextResponse.json({
      success: true,
      message: "MongoDB connected and Mongoose abstractions are working!",
      data: fetchedUser
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Database operation failed.",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
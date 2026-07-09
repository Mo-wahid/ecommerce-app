import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Overwrite the cookie with an empty value and set maxAge to 0
    // This forces the browser to immediately delete it
    response.cookies.set("userRole", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0, 
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred during logout." },
      { status: 500 }
    );
  }
}
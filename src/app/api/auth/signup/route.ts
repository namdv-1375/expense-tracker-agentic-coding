import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: data.user.id,
          full_name: fullName,
          email: email,
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Signup successful. Check your email for verification.",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

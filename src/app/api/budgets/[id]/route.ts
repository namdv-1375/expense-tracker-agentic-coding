import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// DELETE - Remove budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    // Validate id
    if (!id) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if budget exists and belongs to user
    const { data: budget, error: fetchError } = await supabase
      .from("budgets")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !budget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (budget.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - Budget does not belong to you" },
        { status: 403 }
      );
    }

    // Delete budget
    const { error: deleteError } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json(
      { success: true, message: "Budget deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/budgets/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

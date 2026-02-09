import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST - Create new budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category_id, amount, month } = body;

    // Validation
    if (!category_id || !amount || !month) {
      return NextResponse.json(
        { error: "Missing required fields: category_id, amount, month" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Month must be in YYYY-MM format" },
        { status: 400 }
      );
    }

    // Convert to DATE (first day of month)
    const budgetDate = `${month}-01`;

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

    // Verify category exists and belongs to user
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category_id)
      .eq("user_id", user.id)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Category not found or invalid" },
        { status: 400 }
      );
    }

    // Insert budget
    const { data, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        category_id: category_id,
        amount: amount,
        month: budgetDate,
      })
      .select()
      .single();

    if (error) {
      // Check for duplicate (user already has budget for this category in this month)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Budget already exists for this category in this month" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/budgets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Retrieve user's budgets
export async function GET(request: NextRequest) {
  try {
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

    // Get query parameter for month filter (optional)
    const { searchParams } = new URL(request.url);
    const monthFilter = searchParams.get("month");

    // Build query
    let query = supabase
      .from("budgets")
      .select(
        `
        id,
        user_id,
        category_id,
        amount,
        month,
        created_at,
        updated_at,
        categories (
          id,
          name,
          color
        )
      `
      )
      .eq("user_id", user.id)
      .order("month", { ascending: false });

    // Filter by month if provided
    if (monthFilter) {
      const startDate = `${monthFilter}-01`;
      const endDate = `${monthFilter}-31`;
      query = query.gte("month", startDate).lte("month", endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate spent amount and percentage for each budget
    const budgetsWithSpending = await Promise.all(
      data.map(async (budget) => {
        const { data: transactions, error: txError } = await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", user.id)
          .eq("category_id", budget.category_id)
          .eq("type", "expense")
          .gte("transaction_date", budget.month)
          .lt("transaction_date", new Date(budget.month).getFullYear() + "-" +
            (new Date(budget.month).getMonth() + 2).toString().padStart(2, "0") + "-01");

        const spent = txError
          ? 0
          : transactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);

        const percentage = Math.round((spent / budget.amount) * 100);

        return {
          ...budget,
          spent: spent,
          percentage: percentage,
          status: percentage >= 80 ? "WARNING" : "OK",
        };
      })
    );

    return NextResponse.json(budgetsWithSpending, { status: 200 });
  } catch (error) {
    console.error("GET /api/budgets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

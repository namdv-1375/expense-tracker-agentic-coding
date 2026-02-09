"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import BudgetProgressBar from "./BudgetProgressBar";

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month: string;
  spent: number;
  percentage: number;
  status: string;
  categories: {
    name: string;
    color: string;
  };
}

interface BudgetListProps {
  refreshTrigger: number;
}

export default function BudgetList({ refreshTrigger }: BudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().split("T")[0].slice(0, 7)
  );

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/budgets?month=${selectedMonth}`);
      const data = await response.json();

      if (response.ok) {
        setBudgets(data);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, refreshTrigger]);

  const handleDelete = async (budgetId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa budget này?")) {
      return;
    }

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBudgets(budgets.filter((b) => b.id !== budgetId));
      } else {
        alert("Lỗi khi xóa budget");
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("Lỗi khi xóa budget");
    }
  };

  // Format month for display
  const getMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Budget Theo Tháng
        </h2>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có budget nào cho tháng {getMonthDisplay(selectedMonth)}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {/* Header with Category and Delete */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`${budget.categories.color} w-4 h-4 rounded-full`}
                  />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {budget.categories.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <BudgetProgressBar spent={budget.spent} total={budget.amount} />

              {/* Budget Info */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p>Budget:</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {budget.amount.toLocaleString("vi-VN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div>
                  <p>Còn lại:</p>
                  <p
                    className={`font-bold ${
                      budget.amount - budget.spent >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(budget.amount - budget.spent).toLocaleString("vi-VN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

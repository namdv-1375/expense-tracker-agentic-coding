"use client";

import { useState } from "react";
import { Category } from "@/types";
import { Plus } from "lucide-react";

interface BudgetFormProps {
  categories: Category[];
  onBudgetCreated: () => void;
}

export default function BudgetForm({
  categories,
  onBudgetCreated,
}: BudgetFormProps) {
  const [formData, setFormData] = useState({
    category_id: categories[0]?.id || "",
    amount: "",
    month: new Date().toISOString().split("T")[0].slice(0, 7), // YYYY-MM format
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validation
      if (!formData.category_id || !formData.amount || !formData.month) {
        setMessage({
          type: "error",
          text: "Vui lòng điền đầy đủ thông tin",
        });
        setLoading(false);
        return;
      }

      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        setMessage({
          type: "error",
          text: "Số tiền phải lớn hơn 0",
        });
        setLoading(false);
        return;
      }

      // Send to API
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: formData.category_id,
          amount: amount,
          month: formData.month,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Lỗi khi tạo budget",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Budget tạo thành công!",
      });

      // Reset form
      setFormData({
        category_id: categories[0]?.id || "",
        amount: "",
        month: new Date().toISOString().split("T")[0].slice(0, 7),
      });

      // Notify parent to refresh
      onBudgetCreated();
    } catch (error) {
      console.error("Error creating budget:", error);
      setMessage({
        type: "error",
        text: "Lỗi: Không thể tạo budget",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Tạo Budget
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Danh mục
          </label>
          <select
            value={formData.category_id}
            onChange={(e) =>
              setFormData({ ...formData, category_id: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Số tiền (VND)
          </label>
          <input
            type="number"
            step="1000"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="Ví dụ: 5000000"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Month Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tháng
          </label>
          <input
            type="month"
            value={formData.month}
            onChange={(e) =>
              setFormData({ ...formData, month: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          <Plus className="w-5 h-5" />
          {loading ? "Đang tạo..." : "Tạo Budget"}
        </button>
      </form>
    </div>
  );
}

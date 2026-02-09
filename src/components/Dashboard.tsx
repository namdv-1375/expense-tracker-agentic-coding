"use client";

import { Transaction, Category } from "@/types";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function Dashboard({ transactions, categories }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  const getCategoryColor = (index: number) => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#84cc16",
      "#22c55e",
      "#10b981",
      "#14b8a6",
      "#06b6d4",
      "#0ea5e9",
      "#3b82f6",
      "#6366f1",
      "#8b5cf6",
      "#a855f7",
      "#d946ef",
      "#ec4899",
    ];
    return colors[index % colors.length];
  };

  const filterTransactionsByTimeRange = (txns: Transaction[]) => {
    const now = new Date();
    const startDate = new Date();

    if (timeRange === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      startDate.setMonth(now.getMonth() - 1);
    }

    return txns.filter((t) => {
      if (timeRange === "all") return true;
      const txDate = new Date(t.date);
      return txDate >= startDate && txDate <= now;
    });
  };

  const filteredTransactions = filterTransactionsByTimeRange(transactions);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    return { income, expenses, balance };
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const groupedByCategory = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          const category = categories.find((c) => c.id === t.categoryId);
          const categoryName = category?.name || "Khác";
          const existing = acc.find((item) => item.name === categoryName);
          if (existing) {
            existing.value += t.amount;
          } else {
            acc.push({ name: categoryName, value: t.amount });
          }
          return acc;
        },
        [] as Array<{ name: string; value: number }>
      );
    return groupedByCategory;
  }, [filteredTransactions, categories]);

  const dailyData = useMemo(() => {
    const dailyMap = new Map<string, { date: string; income: number; expense: number }>();

    filteredTransactions.forEach((t) => {
      const existing = dailyMap.get(t.date) || { date: t.date, income: 0, expense: 0 };
      if (t.type === "income") {
        existing.income += t.amount;
      } else {
        existing.expense += t.amount;
      }
      dailyMap.set(t.date, existing);
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions]);

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex gap-4">
        {(["week", "month", "all"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              timeRange === range
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {range === "week" ? "7 ngày" : range === "month" ? "30 ngày" : "Tất cả"}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Thu nhập
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.income.toLocaleString("vi-VN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Chi tiêu
              </p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats.expenses.toLocaleString("vi-VN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Số dư
              </p>
              <p
                className={`text-3xl font-bold mt-2 ${
                  stats.balance >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {stats.balance.toLocaleString("vi-VN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <Wallet className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Xu hướng thu/chi theo ngày
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e" }}
                name="Thu nhập"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444" }}
                name="Chi tiêu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Chi tiêu theo danh mục
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: ${value.toLocaleString("vi-VN", {
                      minimumFractionDigits: 0,
                    })}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              Không có dữ liệu chi tiêu
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      {dailyData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Chi tiêu theo ngày
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Thu nhập" />
              <Bar dataKey="expense" fill="#ef4444" name="Chi tiêu" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

"use client";

import { Transaction, Category } from "@/types";
import { Trash2, Download } from "lucide-react";
import { useState } from "react";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
}

export default function TransactionList({
  transactions,
  categories,
  onDeleteTransaction,
}: TransactionListProps) {
  const [filter, setFilter] = useState("all");

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "bg-gray-500";
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Không xác định";
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  const exportToCSV = () => {
    const headers = ["Ngày", "Loại", "Số tiền", "Danh mục", "Mô tả"];
    const rows = transactions.map((t) => [
      t.date,
      t.type === "income" ? "Thu" : "Chi",
      t.amount,
      getCategoryName(t.categoryId),
      t.description,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `expense-tracker-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Danh sách giao dịch
        </h2>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        {["all", "income", "expense"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === type
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {type === "all" ? "Tất cả" : type === "income" ? "Thu nhập" : "Chi tiêu"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Chưa có giao dịch nào</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`${getCategoryColor(
                      transaction.categoryId
                    )} w-3 h-3 rounded-full`}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getCategoryName(transaction.categoryId)} - {transaction.date}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-lg font-bold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {transaction.amount.toLocaleString("vi-VN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

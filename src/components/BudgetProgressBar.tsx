"use client";

interface BudgetProgressBarProps {
  spent: number;
  total: number;
}

export default function BudgetProgressBar({
  spent,
  total,
}: BudgetProgressBarProps) {
  const percentage = Math.round((spent / total) * 100);
  const isWarning = percentage >= 80;

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isWarning ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Text Info */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {spent.toLocaleString("vi-VN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}{" "}
          /{" "}
          {total.toLocaleString("vi-VN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </span>
        <span
          className={`text-sm font-bold ${
            isWarning
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {percentage}%
        </span>
      </div>

      {/* Warning Message */}
      {isWarning && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          ⚠️ Chi tiêu vượt 80% budget!
        </p>
      )}
    </div>
  );
}

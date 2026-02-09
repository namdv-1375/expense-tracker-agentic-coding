import { BarChart3, Wallet, FolderOpen } from "lucide-react";

interface NavigationProps {
  activeTab: "dashboard" | "transactions" | "categories";
  onTabChange: (tab: "dashboard" | "transactions" | "categories") => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "transactions", label: "Giao dịch", icon: Wallet },
    { id: "categories", label: "Danh mục", icon: FolderOpen },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Expense Tracker
            </h1>
          </div>
          
          <div className="flex gap-4">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

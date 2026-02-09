"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import CategoryManager from "@/components/CategoryManager";
import { Transaction, Category } from "@/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "categories">("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Ăn uống", color: "bg-red-500" },
    { id: "2", name: "Di chuyển", color: "bg-blue-500" },
    { id: "3", name: "Giải trí", color: "bg-purple-500" },
  ]);

  const handleAddTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleAddCategory = (categoryName: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: categoryName,
      color: color,
    };
    setCategories([...categories, newCategory]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    setTransactions(
      transactions.filter((t) => t.categoryId !== id)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <Dashboard transactions={transactions} categories={categories} />
        )}
        
        {activeTab === "transactions" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <TransactionForm 
                categories={categories} 
                onAddTransaction={handleAddTransaction}
              />
            </div>
            <div className="lg:col-span-2">
              <TransactionList 
                transactions={transactions}
                categories={categories}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          </div>
        )}
        
        {activeTab === "categories" && (
          <CategoryManager 
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </main>
    </div>
  );
}

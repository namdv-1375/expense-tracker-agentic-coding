"use client";

import { Category } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

const colorOptions = [
  { name: "Đỏ", value: "bg-red-500" },
  { name: "Cam", value: "bg-orange-500" },
  { name: "Vàng", value: "bg-yellow-500" },
  { name: "Xanh nhạt", value: "bg-green-500" },
  { name: "Xanh lá", value: "bg-emerald-500" },
  { name: "Xanh dương", value: "bg-cyan-500" },
  { name: "Xanh", value: "bg-blue-500" },
  { name: "Tím", value: "bg-purple-500" },
  { name: "Hồng", value: "bg-pink-500" },
];

export default function CategoryManager({
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    onAddCategory(newCategoryName, selectedColor);
    setNewCategoryName("");
    setSelectedColor(colorOptions[0].value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Add Category Form */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Thêm danh mục
          </h2>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên danh mục
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Màu sắc
              </label>
              <div className="grid grid-cols-3 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-full h-10 rounded-lg transition-all duration-200 border-2 ${
                      selectedColor === color.value
                        ? "border-gray-800 dark:border-white shadow-lg"
                        : "border-transparent"
                    } ${color.value}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm danh mục
            </button>
          </form>
        </div>
      </div>

      {/* Categories List */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Danh mục hiện có
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Chưa có danh mục nào</p>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${category.color} w-4 h-4 rounded-full`} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

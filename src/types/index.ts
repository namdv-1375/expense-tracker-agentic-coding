export interface Transaction {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  type: "income" | "expense";
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

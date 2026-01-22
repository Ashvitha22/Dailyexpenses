import { useEffect, useState } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import FilterBar from "./components/FilterBar";
import Analytics from "./components/Analytics";
import { getExpenses } from "./services/expenseService";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load expenses (with optional filters)
  const loadExpenses = async (params = {}) => {
    try {
      setLoading(true);
      const res = await getExpenses(params);
      setExpenses(res.data);
    } catch (error) {
      console.error("Failed to load expenses", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-center">
          Daily Expense Categorizer
        </h1>

        {/* Analytics Section */}
        <Analytics />

        {/* Filter Section */}
        <FilterBar onFilter={loadExpenses} />

        {/* Add Expense */}
        <ExpenseForm refresh={loadExpenses} />

        {/* Expense List */}
        {loading ? (
          <div className="text-center text-gray-500">
            Loading expenses...
          </div>
        ) : (
          <ExpenseList expenses={expenses} refresh={loadExpenses} />
        )}

      </div>
    </div>
  );
}

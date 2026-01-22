import { useState } from "react";
import { deleteExpense, updateExpense } from "../services/expenseService";

export default function ExpenseList({ expenses = [], refresh }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    amount: "",
    category: "Food"
  });

  const startEdit = (expense) => {
    setEditingId(expense._id);
    setEditData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category
    });
  };

  const saveEdit = async (id) => {
    try {
      await updateExpense(id, {
        ...editData,
        amount: Number(editData.amount)
      });
      setEditingId(null);
      refresh();
    } catch (error) {
      alert("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    await deleteExpense(id);
    refresh();
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow text-center text-gray-500">
        No expenses found
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h2 className="text-xl font-bold">Expense List</h2>

      {expenses.map((exp) => (
        <div
          key={exp._id}
          className="flex justify-between items-center border-b pb-2"
        >
          {editingId === exp._id ? (
            <div className="flex-1 space-y-1">
              <input
                className="border p-1 w-full"
                value={editData.title}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
              />
              <input
                type="number"
                className="border p-1 w-full"
                value={editData.amount}
                onChange={(e) =>
                  setEditData({ ...editData, amount: e.target.value })
                }
              />
              <select
                className="border p-1 w-full"
                value={editData.category}
                onChange={(e) =>
                  setEditData({ ...editData, category: e.target.value })
                }
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Other</option>
              </select>
            </div>
          ) : (
            <div>
              <p className="font-semibold">{exp.title}</p>
              <p className="text-sm text-gray-500">
                {exp.category} • ₹{exp.amount}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {editingId === exp._id ? (
              <button
                onClick={() => saveEdit(exp._id)}
                className="bg-green-500 text-white px-2 rounded"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => startEdit(exp)}
                className="bg-blue-500 text-white px-2 rounded"
              >
                Edit
              </button>
            )}

            <button
              onClick={() => handleDelete(exp._id)}
              className="bg-red-500 text-white px-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

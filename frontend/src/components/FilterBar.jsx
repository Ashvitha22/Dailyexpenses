import { useState } from "react";

export default function FilterBar({ onFilter }) {
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const applyFilters = () => {
    const params = {};
    if (category) params.category = category;
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    onFilter(params);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4">
      <select
        className="border p-2 rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        <option>Food</option>
        <option>Travel</option>
        <option>Shopping</option>
        <option>Bills</option>
        <option>Other</option>
      </select>

      <input
        type="date"
        className="border p-2 rounded"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <input
        type="date"
        className="border p-2 rounded"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <button
        onClick={applyFilters}
        className="bg-black text-white px-4 rounded"
      >
        Apply
      </button>
    </div>
  );
}

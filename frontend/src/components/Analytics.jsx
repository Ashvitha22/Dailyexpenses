import { useEffect, useState } from "react";
import { getAnalytics } from "../services/expenseService";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#4f46e5", "#16a34a", "#f97316", "#dc2626", "#0ea5e9"];

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-6">
      <h2 className="text-xl font-bold">
        Total Spent: ₹{data.overallTotal}
      </h2>

      <div className="grid md:grid-cols-2 gap-6 h-64">
        {/* Pie Chart */}
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data.categoryAnalytics}
              dataKey="totalAmount"
              nameKey="_id"
              outerRadius={80}
              label
            >
              {data.categoryAnalytics.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Bar Chart */}
        <ResponsiveContainer>
          <BarChart data={data.categoryAnalytics}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalAmount" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

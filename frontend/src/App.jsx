import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home         from "./pages/Home";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Dashboard    from "./pages/Dashboard";
import Analytics    from "./pages/Analytics";
import Budget       from "./pages/Budget";
import Goals        from "./pages/Goals";
import AddExpense   from "./pages/AddExpense";
import Profile      from "./pages/Profile";
import Achievements from "./pages/Achievements";
import NetWorth     from "./pages/NetWorth";
import Income from "./pages/Income";
// inside your routes:


const Protected = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
      <Route path="/analytics"    element={<Protected><Analytics /></Protected>} />
      <Route path="/budgets"      element={<Protected><Budget /></Protected>} />
      <Route path="/goals"        element={<Protected><Goals /></Protected>} />
      <Route path="/add-expense"  element={<Protected><AddExpense /></Protected>} />
      <Route path="/profile"      element={<Protected><Profile /></Protected>} />
      <Route path="/achievements" element={<Protected><Achievements /></Protected>} />
      <Route path="/networth"     element={<Protected><NetWorth /></Protected>} />
      <Route path="/income" element={<Income />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
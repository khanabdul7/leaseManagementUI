import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Customers from "./pages/Customers";
import Items from "./pages/Items";
import Leases from "./pages/Leases";
import Login from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes";
import { AuthProvider } from "./context/AuthContext";
import Register from "./pages/RegisterPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/customers" />} />
          <Route path="customers" element={<Customers />} />
          <Route path="items" element={<Items />} />
          <Route path="leases" element={<Leases />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

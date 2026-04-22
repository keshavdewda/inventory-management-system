import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AddProduct from "../pages/AddProduct";
import AddSupplier from "../pages/AddSupplier";
import AddUser from "../pages/AddUser";
import CreateOrder from "../pages/CreateOrder";
import Dashboard from "../pages/Dashboard";
import InventoryReport from "../pages/InventoryReport";
import Login from "../pages/Login";
import OrdersList from "../pages/OrdersList";
import ProductCategories from "../pages/ProductCategories";
import ProductList from "../pages/ProductList";
import SalesReport from "../pages/SalesReport";
import Settings from "../pages/Settings";
import SupplierList from "../pages/SupplierList";
import UserList from "../pages/UserList";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/categories" element={<ProductCategories />} />
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/reports/sales" element={<SalesReport />} />
            <Route path="/reports/inventory" element={<InventoryReport />} />
            <Route path="/settings" element={<Settings />} />

            <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
              <Route path="/products/new" element={<AddProduct />} />
              <Route path="/suppliers/new" element={<AddSupplier />} />
              <Route path="/orders/new" element={<CreateOrder />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/users" element={<UserList />} />
              <Route path="/users/new" element={<AddUser />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

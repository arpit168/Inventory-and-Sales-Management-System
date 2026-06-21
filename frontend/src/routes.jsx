import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductPage';
import AddProductPage from './pages/products/AddProductPage';
import EditProductPage from './pages/products/EditProductPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import InventoryPage from './pages/inventory/InventoryPage';
import LowStockPage from './pages/inventory/LowStockPage';
import OutOfStockPage from './pages/inventory/OutOfStockPage';
import POSPage from './pages/posPage/POSPage';
import SalesPage from './pages/sales/SalesPage';
import InvoicePage from './pages/sales/InvoicePage';
import CustomersPage from './pages/customers/CustomersPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import profile from "./pages/auth/ProfilePage"
import ReportsPage from './pages/reports/ReportsPage';
import useAuthStore from './store/authStore';
import ProfilePage from './pages/auth/ProfilePage';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Products */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/add" element={<AddProductPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/edit" element={<EditProductPage />} />

        {/* Categories */}
        <Route path="/categories" element={<CategoriesPage />} />

        {/* Inventory */}
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/low-stock" element={<LowStockPage />} />
        <Route path="/inventory/out-of-stock" element={<OutOfStockPage />} />

        {/* POS & Sales */}
        <Route path="/pos" element={<POSPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/:id/invoice" element={<InvoicePage />} />

        {/* Customers */}
        <Route path="/customers" element={<CustomersPage />} />

        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Reports */}
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
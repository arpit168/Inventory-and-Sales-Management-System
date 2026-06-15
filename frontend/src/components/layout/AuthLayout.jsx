import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AuthLayout = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary-600 items-center justify-center p-12">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Inventory Management System
            </h1>
            <p className="text-primary-100 text-lg">
              Manage your inventory, sales, and billing all in one place.
              Streamline your business operations with our comprehensive solution.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-primary-500 rounded-lg p-4">
                <p className="text-2xl font-bold text-white">1000+</p>
                <p className="text-primary-100 text-sm">Products Managed</p>
              </div>
              <div className="bg-primary-500 rounded-lg p-4">
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-primary-100 text-sm">Daily Transactions</p>
              </div>
              <div className="bg-primary-500 rounded-lg p-4">
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-primary-100 text-sm">Uptime</p>
              </div>
              <div className="bg-primary-500 rounded-lg p-4">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-primary-100 text-sm">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
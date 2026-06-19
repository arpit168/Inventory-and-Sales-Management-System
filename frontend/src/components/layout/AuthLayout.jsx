import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
  Package,
  BarChart3,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const AuthLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-secondary-950">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary-700/20 blur-3xl" />

      <div className="relative flex min-h-screen">
        {/* Left Section */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-xl">
            {/* Logo */}
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-600 shadow-soft">
                <Package size={32} className="text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">
                  InventoryPro
                </h2>
                <p className="text-secondary-600 dark:text-secondary-300">
                  Smart Inventory Solution
                </p>
              </div>
            </div>

            {/* Hero Text */}
            <h1 className="text-5xl font-bold leading-tight text-secondary-900 dark:text-white">
              Manage Your
              <span className="block text-primary-600">
                Inventory Smarter
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-secondary-600 dark:text-secondary-300">
              Track products, monitor stock levels, generate invoices,
              manage sales and grow your business from one powerful platform.
            </p>

            {/* Features */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-secondary-200 bg-white/80 p-5 shadow-soft backdrop-blur-sm dark:border-secondary-800 dark:bg-secondary-900/70">
                <BarChart3
                  size={24}
                  className="mb-3 text-primary-600"
                />
                <h3 className="font-semibold text-secondary-900 dark:text-white">
                  Analytics
                </h3>
                <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                  Business insights in real time.
                </p>
              </div>

              <div className="rounded-2xl border border-secondary-200 bg-white/80 p-5 shadow-soft backdrop-blur-sm dark:border-secondary-800 dark:bg-secondary-900/70">
                <ShieldCheck
                  size={24}
                  className="mb-3 text-success-500"
                />
                <h3 className="font-semibold text-secondary-900 dark:text-white">
                  Secure
                </h3>
                <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                  Enterprise-grade security.
                </p>
              </div>

              <div className="rounded-2xl border border-secondary-200 bg-white/80 p-5 shadow-soft backdrop-blur-sm dark:border-secondary-800 dark:bg-secondary-900/70">
                <Zap
                  size={24}
                  className="mb-3 text-warning-500"
                />
                <h3 className="font-semibold text-secondary-900 dark:text-white">
                  Fast
                </h3>
                <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                  Lightning-fast operations.
                </p>
              </div>

              <div className="rounded-2xl border border-secondary-200 bg-white/80 p-5 shadow-soft backdrop-blur-sm dark:border-secondary-800 dark:bg-secondary-900/70">
                <Package
                  size={24}
                  className="mb-3 text-info-500"
                />
                <h3 className="font-semibold text-secondary-900 dark:text-white">
                  Inventory
                </h3>
                <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                  Complete stock control.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-4 gap-4">
              <div>
                <h3 className="text-3xl font-bold text-primary-600">
                  10K+
                </h3>
                <p className="text-sm text-secondary-500">
                  Products
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-success-500">
                  5K+
                </h3>
                <p className="text-sm text-secondary-500">
                  Sales
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-warning-500">
                  99.9%
                </h3>
                <p className="text-sm text-secondary-500">
                  Uptime
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-info-500">
                  24/7
                </h3>
                <p className="text-sm text-secondary-500">
                  Support
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-secondary-200 bg-white/90 p-8 shadow-soft backdrop-blur-xl dark:border-secondary-800 dark:bg-secondary-900/80">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
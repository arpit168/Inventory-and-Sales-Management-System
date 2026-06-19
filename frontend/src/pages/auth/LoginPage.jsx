import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
} from 'lucide-react';

import useAuthStore from '../../store/authStore';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Login failed'
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-600 shadow-soft">
          <Lock className="text-white" size={28} />
        </div>

        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
          Welcome Back 👋
        </h1>

        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Sign in to your account to continue
        </p>

        <p className="mt-4 text-sm text-secondary-500 dark:text-secondary-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            Create Account
          </Link>
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400"
            />

            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value:
                    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-2xl border border-secondary-300 bg-white py-3 pl-12 pr-4 text-secondary-900 outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:border-secondary-700 dark:bg-secondary-900 dark:text-white dark:focus:ring-primary-900/40"
            />
          </div>

          {errors.email && (
            <p className="mt-1 text-sm text-danger-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400"
            />

            <input
              {...register('password', {
                required: 'Password is required',
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-secondary-300 bg-white py-3 pl-12 pr-14 text-secondary-900 outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:border-secondary-700 dark:bg-secondary-900 dark:text-white dark:focus:ring-primary-900/40"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-500 transition-colors hover:text-primary-600"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-sm text-danger-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />

            <span className="text-sm text-secondary-600 dark:text-secondary-400">
              Remember me
            </span>
          </label>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 font-semibold text-white shadow-soft transition-all duration-300 hover:bg-primary-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 border-t border-secondary-200 pt-6 text-center dark:border-secondary-800">
        <p className="text-xs text-secondary-500">
          Secure login powered by enterprise-grade security.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
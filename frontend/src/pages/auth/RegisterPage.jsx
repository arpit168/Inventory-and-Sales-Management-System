import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
} from 'lucide-react';

import useAuthStore from '../../store/authStore';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const { register: registerUser, loading } =
    useAuthStore();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'staff',
    },
  });

 const onSubmit = async (data) => {
  try {
    delete data.confirmPassword;

    await registerUser(data);

    toast.success('Registration successful!');
    navigate('/dashboard');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      'Registration failed'
    );
  }
};

  return (
    <div>
      {/* Header */}


      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-soft">
          <UserPlus size={22} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Create Account 🚀
        </h1>

        <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
          Start managing your inventory today
        </p>

        <p className="mt-3 text-sm text-secondary-500 dark:text-secondary-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Sign In
          </Link>
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        {/* Name + Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Full Name
            </label>

            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
              />

              <input
                {...register("name", {
                  required: "Name is required",
                })}
                placeholder="Full Name"
                className="w-full rounded-xl border border-secondary-300 bg-white py-2.5 pl-10 pr-3 text-sm dark:bg-secondary-900 dark:border-secondary-700"
              />
            </div>

            {errors.name && (
              <p className="mt-1 text-xs text-danger-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Phone
            </label>

            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
              />

              <input
                {...register("phone", {
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Invalid phone number",
                  },
                })}
                placeholder="Optional"
                className="w-full rounded-xl border border-secondary-300 bg-white py-2.5 pl-10 pr-3 text-sm dark:bg-secondary-900 dark:border-secondary-700"
              />
            </div>

            {errors.phone && (
              <p className="mt-1 text-xs text-danger-500">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
            />

            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value:
                    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Invalid email address",
                },
              })}
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl border border-secondary-300 bg-white py-2.5 pl-10 pr-3 text-sm dark:bg-secondary-900 dark:border-secondary-700"
            />
          </div>

          {errors.email && (
            <p className="mt-1 text-xs text-danger-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Password
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
              />

              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters",
                  },
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded-xl border border-secondary-300 bg-white py-2.5 pl-10 pr-10 text-sm dark:bg-secondary-900 dark:border-secondary-700"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 text-white top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Confirm Password
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
              />

              <input
                {...register("confirmPassword", {
                  required: "Confirm password",
                  validate: (value) =>
                    value === watch("password") ||
                    "Passwords do not match",
                })}
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm Password"
                className="w-full rounded-xl border border-secondary-300 bg-white py-2.5 pl-10 pr-10 text-sm dark:bg-secondary-900 dark:border-secondary-700"
              />
              

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 text-white top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Role */}
              <div>
                <label className="mb-1 block text-sm font-medium text-secondary-200 dark:text-secondary-300">
                  Role
                </label>

                <select
                  {...register('role', {
                    required: 'Role is required',
                  })}
                  className="w-full rounded-xl border border-secondary-300 bg-white py-2.5 px-3 text-sm text-gray-400 dark:bg-secondary-900 dark:border-secondary-700"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>

                {errors.role && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors.role.message}
                  </p>
                )}
              </div>

        {/* Terms */}
        <label className="flex items-start gap-2 text-xs text-secondary-600 dark:text-secondary-400">
          <input
            type="checkbox"
            required
            className="mt-1"
          />
          <span>
            I agree to the Terms of Service and Privacy Policy
          </span>
        </label>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 font-medium text-white shadow-soft transition-all hover:bg-primary-700"
        >
          {loading ? (
            <>
              <Loader2
                size={16}
                className="animate-spin"
              />
              Creating...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 border-t border-secondary-200 pt-6 text-center dark:border-secondary-800">
        <p className="text-xs text-secondary-500">
          Secure registration powered by enterprise-grade
          security.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
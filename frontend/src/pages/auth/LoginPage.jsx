/**
 * Add these to your index.html <head> (or import via CSS) for the fonts used here:
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const DIAL_TICKS = Array.from({ length: 60 }, (_, i) => i);
const DIAL_NUMERALS = [0, 10, 20, 30, 40, 50];

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-['Inter']">

      {/* Brand panel — collapses to a slim header on mobile, full dial on desktop */}
      <div className="relative w-full lg:w-[42%] bg-[#161B22] flex items-center lg:flex-col lg:items-stretch lg:justify-between gap-3 px-6 py-5 lg:px-14 lg:py-14">

        {/* Wordmark — swap for your actual logo */}
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="1" width="20" height="20" rx="4" stroke="#C68A3E" strokeWidth="1.5" />
            <path d="M7 11h8M11 7v8" stroke="#C68A3E" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="font-['Space_Grotesk'] text-sm tracking-wide text-[#EDE9E0]/90">
            YOURCOMPANY
          </span>
        </div>

        {/* Signature dial — desktop only */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="relative w-64 h-64">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full motion-reduce:animate-none animate-[spin_70s_linear_infinite]"
            >
              <g transform="translate(100,100)">
                {DIAL_TICKS.map((i) => {
                  const angle = i * 6;
                  const isMajor = i % 5 === 0;
                  return (
                    <line
                      key={i}
                      x1="0"
                      y1={isMajor ? -88 : -92}
                      x2="0"
                      y2="-98"
                      transform={`rotate(${angle})`}
                      stroke={isMajor ? '#C68A3E' : '#C68A3E55'}
                      strokeWidth={isMajor ? 2 : 1}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            </svg>

            {/* Static inner ring + numerals (doesn't rotate) */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
              <circle cx="100" cy="100" r="70" fill="none" stroke="#EDE9E0" strokeOpacity="0.12" strokeWidth="1" />
              {DIAL_NUMERALS.map((n, idx) => {
                const angle = (idx * 60 - 90) * (Math.PI / 180);
                const x = 100 + 56 * Math.cos(angle);
                const y = 100 + 56 * Math.sin(angle);
                return (
                  <text
                    key={n}
                    x={x}
                    y={y}
                    fontFamily="Space Grotesk"
                    fontSize="11"
                    fill="#EDE9E0"
                    fillOpacity="0.55"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {n}
                  </text>
                );
              })}
              {/* Notch brightens slightly while the password field is focused */}
              <circle
                cx="100"
                cy="22"
                r="4"
                fill="#C68A3E"
                opacity={passwordFocused ? 1 : 0.6}
                style={{ transition: 'opacity 300ms ease' }}
              />
            </svg>
          </div>
        </div>

        {/* Statement — desktop only */}
        <div className="hidden lg:block max-w-xs">
          <p className="font-['Space_Grotesk'] text-xl leading-snug text-[#EDE9E0]">
            Pick up exactly where you left off.
          </p>
          <p className="mt-2 text-sm text-[#EDE9E0]/55">
            Sign in to access your workspace, projects, and team.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 bg-[#FAF8F4] dark:bg-[#11151C] flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <h1 className="font-['Space_Grotesk'] text-2xl text-[#20242B] dark:text-[#EDE9E0]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Sign in to your workspace.{' '}
            <Link to="/register" className="text-[#C68A3E] hover:text-[#AD7530] font-medium">
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wide text-[#5B6472] dark:text-[#9CA3AF]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Enter a valid email address',
                  },
                })}
                placeholder="you@company.com"
                className={`mt-1.5 w-full rounded-md border bg-white dark:bg-[#1A1F28] px-3.5 py-2.5 text-sm text-[#20242B] dark:text-[#EDE9E0] placeholder-[#A4A9B2] outline-none transition focus:ring-2 focus:ring-[#C68A3E]/40 focus:border-[#C68A3E] ${
                  errors.email ? 'border-[#C1453D]' : 'border-[#E1DED7] dark:border-[#2A3038]'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#C1453D]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wide text-[#5B6472] dark:text-[#9CA3AF]"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  className={`w-full rounded-md border bg-white dark:bg-[#1A1F28] px-3.5 py-2.5 pr-10 text-sm text-[#20242B] dark:text-[#EDE9E0] placeholder-[#A4A9B2] outline-none transition focus:ring-2 focus:ring-[#C68A3E]/40 focus:border-[#C68A3E] ${
                    errors.password ? 'border-[#C1453D]' : 'border-[#E1DED7] dark:border-[#2A3038]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#707684] hover:text-[#20242B] dark:hover:text-[#EDE9E0]"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 3l18 18" strokeLinecap="round" />
                      <path d="M9.88 9.88a3 3 0 104.24 4.24" strokeLinecap="round" strokeLinejoin="round" />
                      <path
                        d="M6.1 6.1C3.6 7.9 2 12 2 12s4 8 10 8c1.7 0 3.2-.4 4.5-1.1M17.9 17.9C20.4 16.1 22 12 22 12s-1.2-2.8-3.5-5.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#C1453D]">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#161B22] hover:bg-[#232938] dark:bg-[#C68A3E] dark:hover:bg-[#AD7530] py-2.5 text-sm font-medium text-[#EDE9E0] dark:text-[#161B22] transition focus:outline-none focus:ring-2 focus:ring-[#C68A3E]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
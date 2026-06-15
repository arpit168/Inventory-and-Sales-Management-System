import { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  icon: Icon,
  helperText,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`
            block w-full rounded-lg border
            ${Icon ? 'pl-10' : 'pl-3'}
            ${type === 'password' ? 'pr-10' : 'pr-3'}
            py-2
            text-gray-900 dark:text-white
            bg-white dark:bg-gray-800
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${className}
          `}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
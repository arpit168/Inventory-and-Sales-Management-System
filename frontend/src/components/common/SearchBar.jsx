import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useDebounce } from '../../hooks/useDebounce';

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounce = true,
  debounceDelay = 300,
  onClear,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounceDelay);

  useEffect(() => {
    if (debounce) {
      onChange?.(debouncedValue);
    }
  }, [debouncedValue, debounce, onChange]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    if (!debounce) {
      onChange?.(e.target.value);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    onClear?.();
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder={placeholder}
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
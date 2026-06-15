import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import AppRoutes from './routes';
import { useThemeStore } from './store/themeStore';
import { useEffect } from 'react';

// Configure QueryClient with production settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply theme class to HTML element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#1e293b' : '#ffffff'
      );
    }
  }, [theme]);

  // Check system preference on first load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-storage');
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      useThemeStore.getState().setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        window.location.href = '/';
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: theme === 'dark' ? '#1e293b' : '#ffffff',
                color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                borderRadius: '10px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
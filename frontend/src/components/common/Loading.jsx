const Loading = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
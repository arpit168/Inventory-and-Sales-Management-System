import { FiPackage } from 'react-icons/fi';

const EmptyState = ({
  Icon = FiPackage,
  title = 'No data found',
  description = 'Get started by creating your first item.',
  action,
  actionText,
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action && (
        <div className="mt-6">
          <button
            onClick={action}
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            {actionText || 'Create New'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
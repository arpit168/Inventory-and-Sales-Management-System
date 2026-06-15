import { useState, useEffect } from 'react';
import { FiPackage, FiShoppingCart, FiUsers, FiAlertCircle } from 'react-icons/fi';
import API from '../../api/axios';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data } = await API.get('/reports/recent-activities');
      setActivities(data.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'product': return FiPackage;
      case 'sale': return FiShoppingCart;
      case 'customer': return FiUsers;
      default: return FiAlertCircle;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'product': return 'text-blue-500';
      case 'sale': return 'text-green-500';
      case 'customer': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading activities...</div>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          
          return (
            <li key={activity._id || index}>
              <div className="relative pb-8">
                {index !== activities.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 bg-gray-100 dark:bg-gray-700 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentActivity;
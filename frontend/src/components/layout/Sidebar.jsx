import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiPackage, 
  FiGrid, 
  FiShoppingCart, 
  FiUsers, 
  FiBell, 
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiTrendingDown,
  FiAlertTriangle
} from 'react-icons/fi';

const menuItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { 
    icon: FiPackage, 
    label: 'Products',
    subItems: [
      { path: '/products', label: 'All Products' },
      { path: '/products/add', label: 'Add Product' },
    ]
  },
  { path: '/categories', icon: FiGrid, label: 'Categories' },
  { 
    icon: FiLayers, 
    label: 'Inventory',
    subItems: [
      { path: '/inventory', label: 'Stock Overview' },
      { path: '/inventory/low-stock', label: 'Low Stock' },
      { path: '/inventory/out-of-stock', label: 'Out of Stock' },
    ]
  },
  { path: '/pos', icon: FiShoppingCart, label: 'POS Billing' },
  { path: '/sales', icon: FiFileText, label: 'Sales' },
  { path: '/customers', icon: FiUsers, label: 'Customers' },
  { path: '/notifications', icon: FiBell, label: 'Notifications' },
  { path: '/reports', icon: FiTrendingDown, label: 'Reports' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const location = useLocation();

  const toggleSubmenu = (label) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (subItems) => 
    subItems?.some(item => location.pathname === item.path);

  return (
    <aside className={`
      bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
      transition-all duration-300 ease-in-out
      ${collapsed ? 'w-20' : 'w-64'}
      h-screen sticky top-0 overflow-y-auto
    `}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Inventory MS
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className="mt-4">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.subItems ? (
              <div>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    isSubmenuActive(item.subItems) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && (
                    <>
                      <span className="ml-3">{item.label}</span>
                      <FiChevronRight className={`ml-auto transition-transform ${
                        expandedItems.includes(item.label) ? 'rotate-90' : ''
                      }`} />
                    </>
                  )}
                </button>
                {!collapsed && expandedItems.includes(item.label) && (
                  <div className="bg-gray-50 dark:bg-gray-900">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center px-4 py-2 pl-12 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isActive(subItem.path) ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  isActive(item.path) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-4 border-primary-500' : ''
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
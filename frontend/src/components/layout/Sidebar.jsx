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
} from 'react-icons/fi';

const menuItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard', section: 'core' },
  {
    icon: FiPackage,
    label: 'Products',
    section: 'core',
    subItems: [
      { path: '/products', label: 'All Products' },
      { path: '/products/add', label: 'Add Product' },
    ]
  },
  { path: '/categories', icon: FiGrid, label: 'Categories', section: 'core' },
  {
    icon: FiLayers,
    label: 'Inventory',
    section: 'operations',
    subItems: [
      { path: '/inventory', label: 'Stock Overview' },
      { path: '/inventory/low-stock', label: 'Low Stock', badge: 'alert' },
      { path: '/inventory/out-of-stock', label: 'Out of Stock' },
    ]
  },
  { path: '/pos', icon: FiShoppingCart, label: 'POS Billing', section: 'operations' },
  { path: '/sales', icon: FiFileText, label: 'Sales', section: 'operations' },
  { path: '/customers', icon: FiUsers, label: 'Customers', section: 'operations' },
  { path: '/notifications', icon: FiBell, label: 'Notifications', section: 'insights', badge: 'notification' },
  { path: '/reports', icon: FiTrendingDown, label: 'Reports', section: 'insights' },
];

// Section headers for visual grouping
const sections = {
  core: 'Main',
  operations: 'Operations',
  insights: 'Insights'
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState(['Products']);
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

  // Group items by section
  const groupedItems = Object.entries(sections).reduce((acc, [key, label]) => {
    acc[key] = menuItems.filter(item => item.section === key);
    return acc;
  }, {});

  return (
    <aside className={`
      bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
      transition-all duration-300 ease-in-out
      ${collapsed ? 'w-20' : 'w-64'}
      h-screen sticky top-0 overflow-y-auto flex flex-col
    `}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Inventory
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">MANAGEMENT</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {Object.entries(groupedItems).map(([sectionKey, items]) =>
          items.length > 0 && (
            <div key={sectionKey} className="mb-6">
              {/* Section Header */}
              {!collapsed && (
                <div className="px-3 py-2 mb-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {sections[sectionKey]}
                  </p>
                </div>
              )}

              {/* Menu Items */}
              <div className="space-y-1">
                {items.map((item) => (
                  <div key={item.label}>
                    {item.subItems ? (
                      <>
                        {/* Parent Item with Submenu */}
                        <button
                          onClick={() => toggleSubmenu(item.label)}
                          className={`
                            w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                            transition-all duration-200 relative group
                            ${isSubmenuActive(item.subItems)
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <div className="flex items-center min-w-0">
                            <item.icon className="w-5 h-5 shrink-0" />
                            {!collapsed && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
                          </div>

                          {!collapsed && (
                            <FiChevronRight
                              size={16}
                              className={`shrink-0 ml-2 transition-transform duration-200 ${expandedItems.includes(item.label) ? 'rotate-90' : ''
                                }`}
                            />
                          )}
                        </button>

                        {/* Submenu Items */}
                        {!collapsed && expandedItems.includes(item.label) && (
                          <div className="mt-1 ml-2 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className={`
                                  flex items-center justify-between px-3 py-2 pl-4 rounded-lg text-sm
                                  transition-colors duration-150
                                  ${isActive(subItem.path)
                                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                  }
                                `}
                              >
                                <span className="truncate">{subItem.label}</span>
                                {subItem.badge && (
                                  <span className={`ml-2 h-2 w-2 rounded-full shrink-0 ${subItem.badge === 'alert' ? 'bg-red-500' : 'bg-amber-500'
                                    }`} />
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      /* Simple Menu Item */
                      <Link
                        to={item.path}
                        className={`
                          flex items-center justify-between px-3 py-2.5 rounded-lg
                          transition-all duration-200
                          ${isActive(item.path)
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <div className="flex items-center min-w-0">
                          <item.icon className="w-5 h-5 shrink-0" />
                          {!collapsed && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
                        </div>

                        {item.badge && (
                          <span className={`shrink-0 h-2 w-2 rounded-full ml-2 ${item.badge === 'notification' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </nav>

      {/* Footer - Optional: User info or settings */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-4">
        <div className={`
          flex items-center gap-3 p-3 rounded-lg
          ${collapsed
            ? 'justify-center'
            : 'bg-gray-50 dark:bg-gray-800/50'
          }
        `}>
          {!collapsed && (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Admin</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Online</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
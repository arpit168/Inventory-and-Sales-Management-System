import { useState, useEffect, useCallback } from 'react';
import { 
  FiSearch, 
  FiTrash2, 
  FiPrinter, 
  FiPlus, 
  FiMinus, 
  FiShoppingCart,
  FiUser,
  FiPhone,
  FiCreditCard,
  FiTag,
  FiPackage,
  FiZap,
  FiX,
  FiCheck,
  FiClock
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';

const POSPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [discount, setDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    if (debouncedSearch) {
      searchProducts();
      setShowSearchResults(true);
    } else {
      setProducts([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (customerMobile.length === 10) {
      fetchCustomer();
    }
  }, [customerMobile]);

  const searchProducts = async () => {
    try {
      const { data } = await API.get('/products', { 
        params: { search: debouncedSearch, limit: 10 } 
      });
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to search products:', error);
    }
  };

  const fetchCustomer = async () => {
    try {
      const { data } = await API.get('/customers/search', { 
        params: { mobile: customerMobile } 
      });
      if (data) {
        setCustomer(data);
        setCustomerName(data.name);
      }
    } catch (error) {
      // Customer not found, ignore
    }
  };

  const addToCart = (product) => {
    if (product.quantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    const existingItem = cart.find(item => item.product === product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast.error('Cannot add more than available stock');
        return;
      }
      updateCartItemQuantity(product._id, existingItem.quantity + 1);
    } else {
      setCart([...cart, {
        product: product._id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.sellingPrice,
        quantity: 1,
        discount: 0,
        tax: (product.sellingPrice * product.taxPercentage) / 100,
        total: product.sellingPrice + (product.sellingPrice * product.taxPercentage) / 100
      }]);
    }
    
    toast.success(`${product.name} added to cart`);
    setSearch('');
    setShowSearchResults(false);
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    setCart(cart.map(item => {
      if (item.product === productId) {
        const newTotal = (item.unitPrice * newQuantity) - item.discount;
        const newTax = (newTotal * (item.tax / item.total) * 100) / 100;
        return {
          ...item,
          quantity: newQuantity,
          tax: newTax,
          total: newTotal + newTax
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product !== productId));
    toast.success('Item removed from cart');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const calculateTotalDiscount = () => {
    return cart.reduce((sum, item) => sum + item.discount, 0) + Number(discount);
  };

  const calculateTotalTax = () => {
    return cart.reduce((sum, item) => sum + item.tax, 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const totalDiscount = calculateTotalDiscount();
    const totalTax = calculateTotalTax();
    return subtotal - totalDiscount + totalTax;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setProcessing(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          product: item.product,
          quantity: item.quantity,
          discount: item.discount / item.quantity
        })),
        customer: customer?._id,
        customerName: customerName || 'Walk-in Customer',
        customerMobile: customerMobile || 'N/A',
        paymentMethod,
        paymentDetails
      };

      await API.post('/sales', saleData);
      
      toast.success('Sale completed successfully!');
      // Reset cart
      setCart([]);
      setCustomer(null);
      setCustomerName('');
      setCustomerMobile('');
      setDiscount(0);
      setPaymentDetails({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete sale');
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: '💵', color: 'from-green-400 to-emerald-500' },
    { id: 'upi', label: 'UPI', icon: '📱', color: 'from-purple-400 to-violet-500' },
    { id: 'card', label: 'Card', icon: '💳', color: 'from-blue-400 to-cyan-500' },
    { id: 'mixed', label: 'Mixed', icon: '🔄', color: 'from-amber-400 to-orange-500' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-400 to-purple-500 rounded-2xl shadow-lg">
            <FiShoppingCart className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-purple-600 dark:from-green-400 dark:to-purple-400 bg-clip-text text-transparent">
              Point of Sale
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <FiZap className="text-green-500" />
              Quick Sale Terminal
            </p>
          </div>
        </div>
        
        {cart.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-purple-50 dark:from-green-900/20 dark:to-purple-900/20 rounded-xl border border-green-200 dark:border-green-800"
          >
            <FiShoppingCart className="text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-700 dark:text-green-300">
              {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
            </span>
            <span className="text-green-600 dark:text-green-400">•</span>
            <span className="font-bold text-green-700 dark:text-green-300">
              ₹{calculateGrandTotal().toFixed(2)}
            </span>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search & Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Products */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  autoFocus
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {showSearchResults && products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100 dark:border-gray-700"
                >
                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map((product, index) => (
                      <motion.button
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => addToCart(product)}
                        disabled={product.quantity === 0}
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                          product.quantity === 0
                            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:shadow-lg hover:scale-105 cursor-pointer'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`p-3 rounded-xl mb-3 ${
                            product.quantity === 0
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : 'bg-gradient-to-br from-green-50 to-purple-50 dark:from-green-900/20 dark:to-purple-900/20'
                          }`}>
                            <FiPackage className={`text-2xl ${
                              product.quantity === 0
                                ? 'text-red-500'
                                : 'text-green-600 dark:text-green-400'
                            }`} />
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {product.name}
                          </p>
                          <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-purple-600 dark:from-green-400 dark:to-purple-400 bg-clip-text text-transparent">
                            ₹{product.sellingPrice}
                          </p>
                          <p className={`text-xs mt-2 px-2 py-1 rounded-full ${
                            product.quantity > 10
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : product.quantity > 0
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} in stock`}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {showSearchResults && search && products.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                  No products found
                </h3>
                <p className="text-gray-400 dark:text-gray-500 mt-2">
                  Try searching with a different term
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Cart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-purple-50 dark:from-green-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiShoppingCart className="text-green-600 dark:text-green-400" />
                  Shopping Cart
                </h2>
                {cart.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCart([]);
                      toast.success('Cart cleared');
                    }}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </motion.button>
                )}
              </div>
            </div>
            
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center"
              >
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                  Your cart is empty
                </h3>
                <p className="text-gray-400 dark:text-gray-500 mt-2">
                  Search and add products to get started
                </p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {cart.map((item, index) => (
                      <motion.tr
                        key={item.product}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.productName}
                            </p>
                            {item.sku && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                SKU: {item.sku}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateCartItemQuantity(item.product, Math.max(1, item.quantity - 1))}
                              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 transition-colors"
                            >
                              <FiMinus size={16} />
                            </motion.button>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateCartItemQuantity(item.product, item.quantity + 1)}
                              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-100 hover:text-green-600 transition-colors"
                            >
                              <FiPlus size={16} />
                            </motion.button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                          ₹{item.unitPrice}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold bg-gradient-to-r from-green-600 to-purple-600 dark:from-green-400 dark:to-purple-400 bg-clip-text text-transparent">
                            ₹{item.total.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.product)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <FiTrash2 size={18} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Checkout Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiCreditCard className="text-purple-600 dark:text-purple-400" />
              Checkout
            </h2>

            {/* Customer Info */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FiUser className="text-green-500" size={16} />
                Customer Details
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="Mobile number (optional)"
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                {customerMobile && !customer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer name"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </motion.div>
                )}
                {customer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-purple-50 dark:from-green-900/20 dark:to-purple-900/20 rounded-xl border border-green-200 dark:border-green-800"
                  >
                    <FiCheck className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {customer.name}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FiTag className="text-green-500" size={16} />
                Order Summary
              </h3>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ₹{calculateSubtotal().toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600 dark:text-gray-400">Discount</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">₹</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-24 text-right px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ₹{calculateTotalTax().toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-200 dark:border-gray-600">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Grand Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-purple-600 dark:from-green-400 dark:to-purple-400 bg-clip-text text-transparent">
                  ₹{calculateGrandTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      paymentMethod === method.id
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-purple-50 dark:from-green-900/30 dark:to-purple-900/30 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <p className={`text-sm font-semibold ${
                      paymentMethod === method.id
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {method.label}
                    </p>
                    {paymentMethod === method.id && (
                      <motion.div
                        layoutId="paymentIndicator"
                        className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Checkout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={cart.length === 0 || processing}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 ${
                cart.length === 0 || processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiClock size={20} />
                  </motion.div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiZap size={20} />
                  Complete Sale • ₹{calculateGrandTotal().toFixed(2)}
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default POSPage;
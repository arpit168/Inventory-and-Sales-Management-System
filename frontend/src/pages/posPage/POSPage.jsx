import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiTrash2, FiPrinter, FiPlus, FiMinus } from 'react-icons/fi';
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
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    if (debouncedSearch) {
      searchProducts();
    } else {
      setProducts([]);
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Point of Sale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search & Cart */}
        <div className="lg:col-span-2">
          {/* Search Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
            </div>

            {/* Search Results */}
            {search && products.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">₹{product.sellingPrice}</p>
                    <p className="text-xs text-gray-400">{product.quantity} in stock</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shopping Cart</h2>
            </div>
            
            {cart.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Cart is empty. Search and add products.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Product</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Total</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cart.map((item) => (
                      <tr key={item.product}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.productName}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => updateCartItemQuantity(item.product, Math.max(1, item.quantity - 1))}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            >
                              <FiMinus />
                            </button>
                            <span className="text-sm text-gray-900 dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItemQuantity(item.product, item.quantity + 1)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">₹{item.unitPrice}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">₹{item.total.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeFromCart(item.product)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Checkout Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Checkout</h2>

            {/* Customer Info */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer Mobile (Optional)
              </label>
              <input
                type="text"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {customerMobile && !customer && (
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              )}
              {customer && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Customer: {customer.name}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Discount</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-20 text-right px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-gray-900 dark:text-white">₹{calculateTotalTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Grand Total</span>
                <span className="text-primary-600 dark:text-primary-400">₹{calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['cash', 'upi', 'card', 'mixed'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`px-3 py-2 text-sm rounded-lg border ${
                      paymentMethod === method
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {method.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || processing}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {processing ? 'Processing...' : `Checkout - ₹${calculateGrandTotal().toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
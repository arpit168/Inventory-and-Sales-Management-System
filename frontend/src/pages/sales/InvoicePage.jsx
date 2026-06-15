import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiDownload } from 'react-icons/fi';
import { salesApi } from '../../api/salesApi';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const InvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const { data } = await salesApi.getInvoice(id);
      setSale(data);
    } catch (error) {
      toast.error('Failed to load invoice');
      navigate('/sales');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loading fullScreen />;
  if (!sale) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Actions - Hidden when printing */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate('/sales')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <FiArrowLeft className="mr-2" /> Back to Sales
        </button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint} icon={FiPrinter}>
            Print
          </Button>
          <Button variant="primary" icon={FiDownload}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">INVOICE</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{sale.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Company Name</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">123 Business Street</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">City, State - 123456</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">GST: 22AAAAA0000A1Z5</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Bill To:</h3>
            <p className="text-gray-900 dark:text-white font-medium">{sale.customerName}</p>
            <p className="text-gray-600 dark:text-gray-400">{sale.customerMobile}</p>
            {sale.customer?.email && (
              <p className="text-gray-600 dark:text-gray-400">{sale.customer.email}</p>
            )}
            {sale.customer?.address && (
              <p className="text-gray-600 dark:text-gray-400">{sale.customer.address}</p>
            )}
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Invoice Date:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(sale.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Payment Method:</span>
              <span className="ml-2 text-gray-900 dark:text-white capitalize">{sale.paymentMethod}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Sold By:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{sale.soldBy?.name}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-600">
              <th className="text-left py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Item</th>
              <th className="text-center py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Qty</th>
              <th className="text-right py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Price</th>
              <th className="text-right py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Discount</th>
              <th className="text-right py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Tax</th>
              <th className="text-right py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-3">
                  <p className="text-gray-900 dark:text-white font-medium">{item.productName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.sku}</p>
                </td>
                <td className="py-3 text-center text-gray-900 dark:text-white">{item.quantity}</td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400">₹{item.unitPrice.toFixed(2)}</td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400">₹{item.discount.toFixed(2)}</td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400">₹{item.tax.toFixed(2)}</td>
                <td className="py-3 text-right text-gray-900 dark:text-white font-medium">₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">₹{sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Discount</span>
              <span className="text-red-600 dark:text-red-400">-₹{sale.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="text-gray-900 dark:text-white">₹{sale.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-300 dark:border-gray-600">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Grand Total</span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                ₹{sale.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Thank you for your purchase!</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This is a computer-generated invoice</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .bg-white, .dark\\:bg-gray-800 {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .bg-white *, .dark\\:bg-gray-800 * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePage;
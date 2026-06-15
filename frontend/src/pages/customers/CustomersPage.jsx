import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { customerApi } from '../../api/customerApi';
import { useDebounce } from '../../hooks/useDebounce';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const debouncedSearch = useDebounce(search);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchCustomers();
  }, [debouncedSearch, page]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;

      const { data } = await customerApi.getCustomers(params);
      setCustomers(data.customers);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    reset({ name: '', mobile: '', email: '', address: '' });
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    reset({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || '',
      address: customer.address || ''
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingCustomer) {
        await customerApi.updateCustomer(editingCustomer._id, data);
        toast.success('Customer updated successfully');
      } else {
        await customerApi.createCustomer(data);
        toast.success('Customer created successfully');
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;

    try {
      await customerApi.deleteCustomer(id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const viewDetails = async (customer) => {
    try {
      const { data } = await customerApi.getCustomerPurchases(customer._id);
      setSelectedCustomer(data);
      setShowDetails(true);
    } catch (error) {
      toast.error('Failed to load customer details');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <Button onClick={openCreateModal} icon={FiPlus}>
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={FiUser}
          title="No customers yet"
          description="Add your first customer."
          action={openCreateModal}
          actionText="Add Customer"
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Purchases</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewDetails(customer)}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600"
                      >
                        {customer.name}
                      </button>
                      {customer.address && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{customer.address}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{customer.mobile}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{customer.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      ₹{customer.totalPurchases?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded dark:hover:bg-blue-900/20"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id, customer.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <Input
            label="Mobile"
            {...register('mobile', {
              required: 'Mobile number is required',
              pattern: { value: /^[0-9]{10}$/, message: 'Invalid mobile number' }
            })}
            error={errors.mobile?.message}
          />
          <Input
            label="Email (Optional)"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address (Optional)
            </label>
            <textarea
              {...register('address')}
              rows={2}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCustomer ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={`Customer Details - ${selectedCustomer?.name}`}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-gray-900 dark:text-white font-medium">{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
                <p className="text-gray-900 dark:text-white font-medium">{selectedCustomer.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Purchases</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  ₹{selectedCustomer.totalPurchases?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Count</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedCustomer.purchaseHistory?.length || 0}
                </p>
              </div>
            </div>

            {selectedCustomer.purchaseHistory?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recent Purchases</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">Date</th>
                        <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.purchaseHistory.slice(0, 10).map((purchase, index) => (
                        <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {new Date(purchase.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            ₹{purchase.amount?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;
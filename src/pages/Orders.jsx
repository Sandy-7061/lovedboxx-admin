import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, FileText, ChevronDown } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async (search = '') => {
    setLoading(true);
    try {
      const response = await getAllOrders({ search });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchOrders(searchTerm);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      fetchOrders(searchTerm);
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      case 'SHIPPED': return 'bg-blue-100 text-blue-700';
      case 'OUT_FOR_DELIVERY': return 'bg-indigo-100 text-indigo-700';
      case 'PROCESSING': return 'bg-purple-100 text-purple-700';
      case 'PENDING': return 'bg-orange-100 text-orange-700';
      case 'CONFIRMED': return 'bg-teal-100 text-teal-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'RETURNED': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Orders History</h1>
          <p className="text-gray-500 mt-1 font-medium">Track and process your customer orders.</p>
        </div>
        <button className="bg-white border border-gray-100 px-8 py-4 rounded-2xl font-bold text-gray-700 shadow-soft flex items-center gap-2 hover:bg-gray-50 transition-all">
          <Download size={20} className="text-primary-600" />
          Export Report
        </button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-soft border border-gray-50">
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by customer name or email (Press enter)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-gray-50 border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary-600/20 transition-all outline-none font-medium"
            />
          </div>
          <div className="flex gap-4">
            <button onClick={() => fetchOrders(searchTerm)} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-primary-700 transition-all">
              Search
            </button>
            <button className="flex items-center gap-2 bg-gray-50 px-6 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-50 font-bold text-xs uppercase tracking-widest">
                  <th className="pb-6 pl-4 pr-4">Order ID</th>
                  <th className="pb-6 pr-4">Customer</th>
                  <th className="pb-6 pr-4">Date</th>
                  <th className="pb-6 pr-4">Total</th>
                  <th className="pb-6 pr-4">Status</th>
                  <th className="pb-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium">
                {orders && orders.length > 0 ? (
                  orders.map((o) => (
                    <tr key={o.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 pl-4 pr-4 font-bold text-gray-900 tracking-tight">#{o.id.substring(0, 8).toUpperCase()}</td>
                      <td className="py-6 pr-4 text-gray-600">
                        <div className="font-bold">{o.user?.name || 'Guest'}</div>
                        <div className="text-xs text-gray-400 font-medium">{o.user?.email}</div>
                      </td>
                      <td className="py-6 pr-4 text-gray-400 font-medium whitespace-nowrap">{format(new Date(o.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                      <td className="py-6 pr-4 text-gray-900 font-black">₹{(o.totalPrice || 0).toLocaleString()}</td>
                      <td className="py-6 pr-4">
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === o.id ? null : o.id)}
                            className={`flex items-center justify-between w-32 px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest leading-none ${getStatusPill(o.status)}`}
                          >
                            <span>{o.status.replace(/_/g, ' ')}</span>
                            <ChevronDown size={14} />
                          </button>
                          {activeDropdown === o.id && (
                            <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                              {statusOptions.map(status => (
                                <button 
                                  key={status}
                                  onClick={() => handleStatusChange(o.id, status)}
                                  className={`block w-full text-left px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${o.status === status ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                  {status.replace(/_/g, ' ')}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-xl shadow-sm transition-all" title="View Order">
                            <Eye size={18} />
                          </button>
                          {o.invoice?.pdfUrl && (
                            <a href={`${import.meta.env.VITE_BASE_URL}${o.invoice.pdfUrl}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl shadow-sm transition-all" title="View Invoice">
                              <FileText size={18} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

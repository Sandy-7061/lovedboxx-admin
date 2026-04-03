import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, CreditCard, ChevronRight, Package, Clock } from 'lucide-react';
import { getDashboardStats } from '../services/api';
import { format } from 'date-fns';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setData(response.data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { totalRevenue, totalOrders, activeCustomers, productsInStock, recentOrders = [] } = data;

  const stats = [
    { label: 'Total Revenue', value: `₹${(totalRevenue || 0).toLocaleString()}`, change: '+12.5%', icon: <CreditCard className="text-white" />, color: 'bg-primary-600' },
    { label: 'Total Orders', value: totalOrders || 0, change: '+5.2%', icon: <ShoppingBag className="text-white" />, color: 'bg-indigo-600' },
    { label: 'Active Customers', value: activeCustomers || 0, change: '+18.7%', icon: <Users className="text-white" />, color: 'bg-fuchsia-600' },
    { label: 'Products In Stock', value: productsInStock || 0, change: '+2.1%', icon: <Package className="text-white" />, color: 'bg-blue-600' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 font-medium">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <button className="bg-white border border-gray-100 px-6 py-3 rounded-2xl font-bold text-gray-700 shadow-soft flex items-center gap-2 hover:bg-gray-50 transition-all">
          <Clock size={20} className="text-primary-600" />
          Last 24 Hours
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-50 group hover:shadow-premium transition-all duration-500">
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-gray-200 transition-transform group-hover:rotate-6`}>
              {stat.icon}
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
              <div className="flex items-center gap-1 text-green-500 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">
                <TrendingUp size={14} />
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-soft border border-gray-50">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recent Orders</h2>
            <button className="text-primary-600 font-bold text-sm hover:underline flex items-center gap-1">
              View All <ChevronRight size={18} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-50 font-bold text-xs uppercase tracking-widest">
                  <th className="pb-6 pr-4">Order ID</th>
                  <th className="pb-6 pr-4">Customer</th>
                  <th className="pb-6 pr-4">Status</th>
                  <th className="pb-6 pr-4">Amount</th>
                  <th className="pb-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders && recentOrders.map((order, idx) => (
                  <tr key={order.id || idx} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-6 font-bold text-gray-900 pr-4">#{order.id?.substring(0, 8).toUpperCase() || 'N/A'}</td>
                    <td className="py-6 text-gray-600 font-medium pr-4">{order.user?.name || 'Guest'}</td>
                    <td className="py-6 pr-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-6 font-black text-gray-900 pr-4">₹{(order.total || 0).toLocaleString()}</td>
                    <td className="py-6 text-gray-400 font-medium text-xs whitespace-nowrap">
                      {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                  </tr>
                ))}
                {!recentOrders || recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Progress Info */}
        <div className="bg-admin-sidebar text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-[80px] rounded-full"></div>
          <h3 className="text-xl font-bold mb-8 relative z-10">Monthly Goal</h3>
          <div className="space-y-8 relative z-10">
            <div>
              <div className="flex justify-between text-sm font-bold mb-3">
                <span className="text-gray-400">Target Reached</span>
                <span className="text-primary-400">85%</span>
              </div>
              <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                <div className="bg-primary-500 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                You're ahead of your sales target by <span className="text-white font-bold">12%</span> compared to last month. Keep it up!
              </p>
            </div>
            <button className="w-full bg-white text-gray-900 py-4 rounded-2xl font-bold hover:bg-primary-50 transition-all shadow-lg shadow-black/20">
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

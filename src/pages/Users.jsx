import { useState, useEffect } from 'react';
import { Search, User as UserIcon, Shield, Mail } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (search = '') => {
    setLoading(true);
    try {
      // Assuming we'll add a simple user fetch to admin APIs later
      const response = await api.get('/admin/users', { params: { search } });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchUsers(searchTerm);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
        <p className="text-gray-500 mt-1 font-medium">View and manage system users and roles.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-50">
        <div className="relative mb-10 w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search users by name or email... (Press Enter)" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-gray-50 border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary-600/20 transition-all outline-none font-medium"
          />
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
                  <th className="pb-6 pl-4 pr-4">User</th>
                  <th className="pb-6 pr-4 text-center">Role</th>
                  <th className="pb-6 pr-4">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-900">
                {users && users.length > 0 ? users.map((u) => (
                  <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-6 pl-4 pr-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center font-black">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                             {u.name}
                             {u.role === 'ADMIN' && <Shield size={14} className="text-amber-500" />}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail size={12} /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 pr-4 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-6 pr-4 text-gray-400 font-medium">
                      {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-gray-500 font-medium font-sans">
                      No users found.
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

export default Users;

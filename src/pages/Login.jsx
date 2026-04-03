import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.role !== 'ADMIN') {
        toast.error('Access denied. Admin only.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Welcome back, Admin!');
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-sidebar flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-white/10 relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-600/20 rotate-6 hover:rotate-0 transition-transform duration-500">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Admin Portal</h2>
          <p className="text-gray-400 mt-2 font-medium">Secure login for Lovedboxx panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lovedboxx.com" 
                className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-primary-600 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-primary-600 transition-all outline-none"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2 group active:scale-95 disabled:bg-gray-600"
          >
            {loading ? 'Authenticating...' : 'Secure Access'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-10 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Forgot access? Contact system admin</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, ChevronRight, LayoutGrid, Image as ImageIcon } from 'lucide-react';

const Sidebar = ({ setIsAuthenticated }) => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
  };

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { title: 'Categories', icon: <LayoutGrid size={20} />, path: '/categories' },
    { title: 'Banners', icon: <ImageIcon size={20} />, path: '/banners' },
    { title: 'Products', icon: <Package size={20} />, path: '/products' },
    { title: 'Orders', icon: <ShoppingBag size={20} />, path: '/orders' },
    { title: 'Customers', icon: <Users size={20} />, path: '/users' },
  ];

  return (
    <div className="w-72 bg-admin-sidebar text-white min-h-screen p-6 flex flex-col sticky top-0 h-screen">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="bg-admin-primary p-2 rounded-xl">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none">Lovedboxx</h1>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              location.pathname === item.path 
                ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20 scale-[1.02]' 
                : 'text-gray-400 hover:bg-admin-sidebarHover hover:text-white hover:translate-x-1'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`${location.pathname === item.path ? 'text-white' : 'text-gray-500 group-hover:text-admin-primary'} transition-colors`}>
                {item.icon}
              </span>
              <span className="font-extrabold text-sm tracking-wide">{item.title}</span>
            </div>
            {location.pathname === item.path && <ChevronRight size={16} />}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all w-full font-bold text-sm"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

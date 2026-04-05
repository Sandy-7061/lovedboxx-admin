import api, { getProducts, addProduct, deleteProduct, getCategoriesAdmin, uploadImage } from '../services/api';
import { toast } from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, ExternalLink, X, Image as ImageIcon, Upload, Zap } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', slug: '', description: '', price: '', mrp: '', stock: '', categoryId: '', imageUrl: ''
  });
  const [offerData, setOfferData] = useState({
    discountPercent: '', label: 'Limited Time Offer', startDate: new Date().toISOString().split('T')[0], endDate: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (search = '') => {
    setLoading(true);
    try {
      const response = await getProducts({ search, limit: 100 });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesAdmin();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product', error);
      toast.error('Failed to delete product');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setNewProduct({ ...newProduct, name: value, slug });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await uploadImage(formData);
      // Construct full URL so it works on front-end
      const fullUrl = `${import.meta.env.VITE_BASE_URL}${data.imageUrl}`;
      setNewProduct(prev => ({ ...prev, imageUrl: fullUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (!newProduct.categoryId) {
        toast.error('Please select a category');
        return;
      }
      
      const payload = {
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        mrp: parseFloat(newProduct.mrp) || parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        categoryId: newProduct.categoryId,
        images: newProduct.imageUrl ? [newProduct.imageUrl] : [],
        isFeatured: false,
        isActive: true
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await addProduct(payload);
        toast.success('Product added successfully');
      }
      
      fetchProducts();
      setIsModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: '', slug: '', description: '', price: '', mrp: '', stock: '', categoryId: '', imageUrl: '' });
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error?.response?.data?.error || 'Failed to save product');
    }
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setNewProduct({
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: p.price,
      mrp: p.mrp || p.price,
      stock: p.stock,
      categoryId: p.categoryId,
      imageUrl: p.images?.[0] || ''
    });
    setIsModalOpen(true);
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/products/${selectedProduct.id}/offer`, {
        ...offerData,
        discountPercent: parseFloat(offerData.discountPercent),
        startDate: new Date(offerData.startDate).toISOString(),
        endDate: new Date(offerData.endDate).toISOString()
      });
      toast.success('Offer added successfully');
      setIsOfferModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add offer');
    }
  };

  const openOfferModal = (product) => {
    setSelectedProduct(product);
    setIsOfferModalOpen(true);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchProducts(searchTerm);
    }
  };

  const getStatus = (stock) => {
    if (stock > 50) return { text: 'In Stock', className: 'bg-green-100 text-green-700' };
    if (stock > 0) return { text: 'Low Stock', className: 'bg-orange-100 text-orange-700' };
    return { text: 'Out of Stock', className: 'bg-red-100 text-red-700' };
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Product Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your inventory, pricing, and product listings.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary-600/20 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={24} />
          Add New Product
        </button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-soft border border-gray-50">
        {/* Table Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products by name... (Press Enter)" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-gray-50 border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary-600/20 transition-all outline-none font-medium"
            />
          </div>
          <button onClick={() => fetchProducts(searchTerm)} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-primary-700 transition-all">
            Search
          </button>
          <button className="flex items-center gap-2 bg-gray-50 px-6 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all">
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-50 font-bold text-[10px] uppercase tracking-widest">
                  <th className="pb-6 pl-4">Product Info</th>
                  <th className="pb-6">Category</th>
                  <th className="pb-6">Price & MRP</th>
                  <th className="pb-6">Inventory</th>
                  <th className="pb-6">Status</th>
                  <th className="pb-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium">
                {products && products.length > 0 ? products.map((p) => {
                  const status = getStatus(p.stock);
                  return (
                    <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 pl-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden flex-shrink-0 p-1">
                            {(() => {
                              const images = p.images || [];
                              return images[0] ? (
                                <img src={images[0]} alt={p.name} className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 rounded-xl"><ImageIcon size={24} /></div>
                              );
                            })()}
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold max-w-[200px] truncate">{p.name}</p>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1 font-bold">ID: {p.id.substring(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-gray-600 font-bold text-xs uppercase tracking-widest">{p.category?.name || 'Uncategorized'}</td>
                      <td className="py-6">
                        <div className="text-gray-900 font-black">₹{p.price.toLocaleString()}</div>
                        {p.mrp > p.price && <div className="text-gray-400 font-bold text-xs line-through">₹{p.mrp.toLocaleString()}</div>}
                      </td>
                      <td className="py-6 text-gray-500 font-bold">{p.stock} Units</td>
                      <td className="py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black leading-none ${status.className}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(p)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-xl shadow-sm transition-colors cursor-pointer">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm transition-colors cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                          <button 
                             onClick={() => openOfferModal(p)}
                             className="p-2 text-gray-400 hover:text-orange-500 hover:bg-white rounded-xl shadow-sm transition-colors cursor-pointer"
                           >
                            <Zap size={16} />
                          </button>
                          <a href={`http://localhost:5173/product/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl shadow-sm transition-colors cursor-pointer">
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            <div className="p-8 bg-white border-b border-gray-100 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Add New Product</h2>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Create a new listing in your store</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-8 overflow-y-auto z-0 flex-1 relative bg-gray-50/30">
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Product Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" placeholder="e.g. Wireless Headphones" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">URL Slug (Auto-generated)</label>
                    <input type="text" name="slug" value={newProduct.slug} onChange={handleInputChange} className="w-full border-gray-200 bg-gray-50 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-500 outline-none transition-colors" placeholder="wireless-headphones" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Category <span className="text-red-500">*</span></label>
                    <select name="categoryId" value={newProduct.categoryId} onChange={handleInputChange} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors appearance-none bg-white" required>
                      <option value="">Select a Category...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Product Images</label>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className="text-[10px] font-bold text-primary-600 flex items-center gap-1 hover:underline disabled:text-gray-400"
                      >
                        <Upload size={12} /> {uploading ? 'Uploading...' : 'Upload File'}
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    <div className="flex gap-4 items-center">
                      <input 
                        type="url" 
                        name="imageUrl" 
                        value={newProduct.imageUrl} 
                        onChange={handleInputChange} 
                        className="flex-1 border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" 
                        placeholder="Paste URL or upload..." 
                      />
                      {newProduct.imageUrl && (
                        <div className="w-14 h-14 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
                          <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Selling Price (₹) <span className="text-red-500">*</span></label>
                    <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} min="0" className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-black text-gray-900 outline-none transition-colors" placeholder="0" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Original MRP (₹)</label>
                    <input type="number" name="mrp" value={newProduct.mrp} onChange={handleInputChange} min="0" className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-black text-gray-900 outline-none transition-colors" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Initial Stock <span className="text-red-500">*</span></label>
                    <input type="number" name="stock" value={newProduct.stock} onChange={handleInputChange} min="0" className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-black text-gray-900 outline-none transition-colors" placeholder="0" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Rich Description</label>
                  <textarea name="description" value={newProduct.description} onChange={handleInputChange} rows="4" className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-medium text-gray-900 outline-none transition-colors" placeholder="Describe the product details and features..."></textarea>
                </div>
                
              </div>
              
              <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-xl font-black text-[10px] tracking-widest uppercase text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">Cancel</button>
                <button type="submit" className="px-10 py-4 rounded-xl font-black text-[10px] tracking-widest uppercase text-white bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-600/20 active:scale-95 transition-all">Publish Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Offer Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900">Add Promotion</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">For {selectedProduct?.name}</p>
              </div>
              <button onClick={() => setIsOfferModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddOffer} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Discount (%)</label>
                <input type="number" required value={offerData.discountPercent} onChange={e=>setOfferData({...offerData, discountPercent: e.target.value})} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-black text-gray-900 outline-none transition-colors" placeholder="e.g. 15" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Offer Label</label>
                <input type="text" required value={offerData.label} onChange={e=>setOfferData({...offerData, label: e.target.value})} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" placeholder="e.g. Flash Sale" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Start Date</label>
                  <input type="date" required value={offerData.startDate} onChange={e=>setOfferData({...offerData, startDate: e.target.value})} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">End Date</label>
                  <input type="date" required value={offerData.endDate} onChange={e=>setOfferData({...offerData, endDate: e.target.value})} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" />
                </div>
              </div>

              <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all">Launch Offer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

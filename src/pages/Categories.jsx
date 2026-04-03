import { useState, useEffect, useRef } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import api, { uploadImage } from '../services/api';
import { toast } from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    image: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData({ ...formData, name: value, slug });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploading(true);
    try {
      const { data } = await uploadImage(uploadData);
      const fullUrl = `http://localhost:5000${data.imageUrl}`;
      setFormData(prev => ({ ...prev, icon: fullUrl, image: fullUrl }));
      toast.success('Icon uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, formData);
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', formData);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will affect products in this category.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '',
      image: cat.image || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', icon: '', image: '' });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Category Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Create and organize your product types.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus size={20} /> Add New Category
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-50">
        <div className="relative mb-10 w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary-600/20 transition-all outline-none font-medium"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((cat) => (
              <div key={cat.id} className="group p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-xl transition-all relative">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 overflow-hidden border border-gray-100">
                    {cat.icon ? (
                      <img src={cat.icon} alt={cat.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <ImageIcon className="text-gray-300" size={32} />
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(cat)} className="p-2 bg-white text-gray-400 hover:text-primary-600 rounded-xl shadow-sm border border-gray-100"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 bg-white text-gray-400 hover:text-red-600 rounded-xl shadow-sm border border-gray-100"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{cat.name}</h3>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">/{cat.slug}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Category Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" placeholder="Electronics, Fashion..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Slug</label>
                  <input required name="slug" value={formData.slug} onChange={handleInputChange} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" placeholder="electronics-accessories" />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Category Icon / Image</label>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className="text-[10px] font-bold text-primary-600 flex items-center gap-1 hover:underline disabled:text-gray-400"
                      >
                        <Upload size={12} /> {uploading ? 'Uploading...' : 'Upload Icon'}
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    <div className="flex gap-4 items-center">
                      <input 
                        type="url" 
                        name="icon" 
                        value={formData.icon} 
                        onChange={handleInputChange} 
                        className="flex-1 border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" 
                        placeholder="Paste icon URL or upload..." 
                      />
                      {formData.icon && (
                        <div className="w-14 h-14 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center">
                          <img src={formData.icon} alt="Preview" className="w-10 h-10 object-contain" />
                        </div>
                      )}
                    </div>
                </div>
              </div>

              <button disabled={uploading} className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 disabled:bg-gray-400 disabled:shadow-none mt-4">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

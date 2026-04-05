import { useState, useEffect, useRef } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, X, Upload, ExternalLink, Layout as LayoutIcon } from 'lucide-react';
import api, { uploadImage } from '../services/api';
import { toast } from 'react-hot-toast';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/banners');
      setBanners(response.data || []);
    } catch (error) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploading(true);
    try {
      const { data } = await uploadImage(uploadData);
      const fullUrl = `${import.meta.env.VITE_BASE_URL}${data.imageUrl}`;
      setFormData(prev => ({ ...prev, imageUrl: fullUrl }));
      toast.success('Banner image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData, order: parseInt(formData.order) };
    try {
      if (editingBanner) {
        await api.put(`/admin/banners/${editingBanner.id}`, dataToSend);
        toast.success('Banner updated');
      } else {
        await api.post('/admin/banners', dataToSend);
        toast.success('Banner created');
      }
      setIsModalOpen(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl || '',
      ctaText: banner.ctaText || 'Shop Now',
      ctaLink: banner.ctaLink || '/products',
      isActive: banner.isActive,
      order: banner.order
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({ title: '', subtitle: '', imageUrl: '', ctaText: 'Shop Now', ctaLink: '/products', isActive: true, order: 0 });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Hero Banners</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage home page promotional sliders.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus size={20} /> Add New Slide
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-50">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {banners.length > 0 ? banners.map((banner) => (
              <div key={banner.id} className="group p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-primary-100 transition-all relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-80 h-44 rounded-2xl bg-gray-200 overflow-hidden shrink-0 border border-gray-100 shadow-sm relative">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-white text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Inactive</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">{banner.title || 'No Title'}</h3>
                  <p className="text-gray-500 font-medium line-clamp-2 max-w-lg">{banner.subtitle || 'No Subtitle'}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary-100 text-primary-600 px-3 py-1.5 rounded-full border border-primary-200">Order: {banner.order}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-1"><ExternalLink size={10} /> {banner.ctaLink}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEditModal(banner)} className="p-4 bg-white text-gray-400 hover:text-primary-600 rounded-2xl shadow-sm border border-gray-100 transition-all"><Edit2 size={20} /></button>
                  <button onClick={() => handleDelete(banner.id)} className="p-4 bg-white text-gray-400 hover:text-red-600 rounded-2xl shadow-sm border border-gray-100 transition-all"><Trash2 size={20} /></button>
                </div>
              </div>
            )) : (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <LayoutIcon className="mx-auto text-gray-200 mb-4" size={64} />
                    <p className="text-gray-400 font-bold">No hero banners found. Create one to start.</p>
                </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">{editingBanner ? 'Edit Banner' : 'New Banner Slide'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Main Heading (Title)</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" placeholder="Upgrade Your Lifestyle." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Subtext (Subtitle)</label>
                  <textarea name="subtitle" value={formData.subtitle} onChange={handleInputChange} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors resize-none h-24" placeholder="Up to 60% off on premium electronics..." />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Background Image</label>
                      <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="text-[10px] font-bold text-primary-600 flex items-center gap-1 hover:underline disabled:text-gray-400">
                        <Upload size={12} /> {uploading ? 'Uploading...' : 'Upload Image'}
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" placeholder="Image URL..." />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Button Text</label>
                  <input name="ctaText" value={formData.ctaText} onChange={handleInputChange} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" placeholder="Shop Now" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Link URL</label>
                  <input name="ctaLink" value={formData.ctaLink} onChange={handleInputChange} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" placeholder="/products" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Display Order</label>
                  <input type="number" name="order" value={formData.order} onChange={handleInputChange} className="w-full border-gray-200 border-2 focus:border-primary-600 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none transition-colors" />
                </div>
                <div className="flex items-center gap-3 md:pt-10">
                    <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-6 h-6 rounded-lg text-primary-600 focus:ring-primary-600 border-gray-300" />
                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Display this slide</label>
                </div>
              </div>

              <button disabled={uploading || !formData.imageUrl} className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 disabled:bg-gray-400 disabled:shadow-none mt-4">
                {editingBanner ? 'Update Slide' : 'Launch Slide'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;

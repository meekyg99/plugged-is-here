import { useEffect, useState, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Save, Image as ImageIcon, Eye, Plus, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  banner_type: string;
  position: string | null;
  cta_text: string | null;
  cta_url: string | null;
  background_type: string | null;
  gradient_from: string | null;
  gradient_via: string | null;
  gradient_to: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
}

export default function ContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroMain, setHeroMain] = useState<Banner | null>(null);
  const [categoryBanners, setCategoryBanners] = useState<Banner[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const heroImageRef = useRef<HTMLInputElement>(null);
  const categoryImageRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);

      // Fetch or create hero_main banner
      let { data: heroData } = await supabase
        .from('banners')
        .select('*')
        .eq('banner_type', 'hero_main')
        .eq('position', 'main')
        .maybeSingle();

      if (!heroData) {
        // Create default hero_main banner
        const { data: newHero, error: heroError } = await supabase
          .from('banners')
          .insert({
            title: 'Summer 2025',
            subtitle: 'New Collection',
            banner_type: 'hero_main',
            position: 'main',
            cta_text: 'Shop Now',
            cta_url: '/category/all',
            background_type: 'gradient',
            gradient_from: '#fef3c7',
            gradient_via: '#fed7aa',
            gradient_to: '#fecdd3',
            image_url: '',
            is_active: true,
            display_order: 0,
          })
          .select()
          .single();

        if (heroError) {
          console.error('Error creating hero banner:', heroError);
        } else {
          heroData = newHero;
        }
      }

      if (heroData) {
        setHeroMain(heroData);
      }

      // Fetch category banners
      let { data: categoryData } = await supabase
        .from('banners')
        .select('*')
        .eq('banner_type', 'hero_category')
        .in('position', ['men', 'women', 'accessories'])
        .order('display_order');

      // Create missing category banners
      const positions = ['men', 'women', 'accessories'];
      const existingPositions = (categoryData || []).map((b) => b.position);
      const missingPositions = positions.filter((p) => !existingPositions.includes(p));

      if (missingPositions.length > 0) {
        const newBanners = missingPositions.map((pos, idx) => ({
          title: pos.charAt(0).toUpperCase() + pos.slice(1),
          subtitle: null,
          banner_type: 'hero_category',
          position: pos,
          image_url: '',
          link_url: `/category/${pos === 'accessories' ? 'accessories' : 'all'}?gender=${pos === 'accessories' ? '' : pos}`,
          is_active: true,
          display_order: existingPositions.length + idx,
        }));

        const { data: insertedBanners, error: insertError } = await supabase
          .from('banners')
          .insert(newBanners)
          .select();

        if (insertError) {
          console.error('Error creating category banners:', insertError);
        } else if (insertedBanners) {
          categoryData = [...(categoryData || []), ...insertedBanners].sort(
            (a, b) => a.display_order - b.display_order
          );
        }
      }

      if (categoryData) {
        setCategoryBanners(categoryData);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setMessage({ type: 'error', text: 'Failed to load content' });
    } finally {
      setLoading(false);
    }
  };

  const saveHeroMain = async () => {
    if (!heroMain) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('banners')
        .update({
          title: heroMain.title,
          subtitle: heroMain.subtitle,
          cta_text: heroMain.cta_text,
          cta_url: heroMain.cta_url,
          background_type: heroMain.background_type,
          gradient_from: heroMain.gradient_from,
          gradient_via: heroMain.gradient_via,
          gradient_to: heroMain.gradient_to,
          image_url: heroMain.image_url,
          is_active: heroMain.is_active,
        })
        .eq('id', heroMain.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Hero section updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving hero:', error);
      setMessage({ type: 'error', text: 'Failed to save hero section' });
    } finally {
      setSaving(false);
    }
  };

  const saveCategoryBanner = async (banner: Banner) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('banners')
        .update({
          title: banner.title,
          subtitle: banner.subtitle,
          image_url: banner.image_url,
          link_url: banner.link_url,
          is_active: banner.is_active,
        })
        .eq('id', banner.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Category banner updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving banner:', error);
      setMessage({ type: 'error', text: 'Failed to save category banner' });
    } finally {
      setSaving(false);
    }
  };

  const updateCategoryBanner = (index: number, field: keyof Banner, value: any) => {
    const updated = [...categoryBanners];
    updated[index] = { ...updated[index], [field]: value };
    setCategoryBanners(updated);
  };

  const uploadImage = async (file: File, folder: string = 'hero'): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please upload an image file' });
        return null;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return null;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('banners')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !heroMain) return;

    const imageUrl = await uploadImage(file, 'hero-main');
    if (imageUrl) {
      setHeroMain({ ...heroMain, image_url: imageUrl });
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const banner = categoryBanners[index];
    const imageUrl = await uploadImage(file, `category-${banner.position}`);
    
    if (imageUrl) {
      updateCategoryBanner(index, 'image_url', imageUrl);
      setMessage({ type: 'success', text: 'Category image uploaded successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <AdminLayout activePage="content">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="content">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl tracking-wider uppercase font-light">Content Management</h1>
          <p className="text-gray-600 mt-2">Manage homepage hero section and category banners</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {heroMain && (
          <div className="bg-white shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl tracking-wider uppercase font-light">Hero Main Section</h2>
              <button
                onClick={saveHeroMain}
                disabled={saving}
                className="px-6 py-2 bg-black text-white uppercase tracking-wider text-sm hover:bg-gray-800 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Hero
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                    Main Headline
                  </label>
                  <input
                    type="text"
                    value={heroMain.title}
                    onChange={(e) => setHeroMain({ ...heroMain, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={heroMain.subtitle || ''}
                    onChange={(e) => setHeroMain({ ...heroMain, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroMain.cta_text || ''}
                    onChange={(e) => setHeroMain({ ...heroMain, cta_text: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                    CTA Button URL
                  </label>
                  <input
                    type="text"
                    value={heroMain.cta_url || ''}
                    onChange={(e) => setHeroMain({ ...heroMain, cta_url: e.target.value })}
                    placeholder="/category/all"
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                    Background Type
                  </label>
                  <select
                    value={heroMain.background_type || 'gradient'}
                    onChange={(e) => setHeroMain({ ...heroMain, background_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  >
                    <option value="gradient">Gradient</option>
                    <option value="image">Image</option>
                  </select>
                </div>

                {heroMain.background_type === 'gradient' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                        Gradient From Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={heroMain.gradient_from || '#fef3c7'}
                          onChange={(e) => setHeroMain({ ...heroMain, gradient_from: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                        />
                        <input
                          type="color"
                          value={heroMain.gradient_from || '#fef3c7'}
                          onChange={(e) => setHeroMain({ ...heroMain, gradient_from: e.target.value })}
                          className="w-16 h-10 border border-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                        Gradient Via Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={heroMain.gradient_via || '#fed7aa'}
                          onChange={(e) => setHeroMain({ ...heroMain, gradient_via: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                        />
                        <input
                          type="color"
                          value={heroMain.gradient_via || '#fed7aa'}
                          onChange={(e) => setHeroMain({ ...heroMain, gradient_via: e.target.value })}
                          className="w-16 h-10 border border-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                        Gradient To Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={heroMain.gradient_to || '#fecdd3'}
                          onChange={(e) => setHeroMain({ ...heroMain, gradient_to: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                        />
                        <input
                          type="color"
                          value={heroMain.gradient_to || '#fecdd3'}
                          onChange={(e) => setHeroMain({ ...heroMain, gradient_to: e.target.value })}
                          className="w-16 h-10 border border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                        Background Image URL
                      </label>
                      <input
                        type="url"
                        value={heroMain.image_url || ''}
                        onChange={(e) => setHeroMain({ ...heroMain, image_url: e.target.value })}
                        placeholder="https://images.pexels.com/..."
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                        Or Upload Image
                      </label>
                      <input
                        ref={heroImageRef}
                        type="file"
                        accept="image/*"
                        onChange={handleHeroImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => heroImageRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-white border border-black text-black uppercase tracking-wider text-sm hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </button>
                      <p className="text-xs text-gray-500 mt-2">Max 5MB. Recommended: 1920x1080px</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={heroMain.is_active}
                      onChange={(e) => setHeroMain({ ...heroMain, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm uppercase tracking-wider text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                  <Eye className="w-4 h-4 inline mr-2" />
                  Preview
                </label>
                <div
                  className="relative h-96 overflow-hidden border border-gray-200"
                  style={{
                    background:
                      heroMain.background_type === 'gradient'
                        ? `linear-gradient(to bottom right, ${heroMain.gradient_from || '#fef3c7'}, ${heroMain.gradient_via || '#fed7aa'}, ${heroMain.gradient_to || '#fecdd3'})`
                        : `url(${heroMain.image_url}) center/cover`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4 px-4">
                      <h1 className="text-4xl font-light tracking-[0.2em] uppercase">
                        {heroMain.title}
                      </h1>
                      {heroMain.subtitle && (
                        <p className="text-lg tracking-[0.3em] uppercase">{heroMain.subtitle}</p>
                      )}
                      {heroMain.cta_text && (
                        <button className="mt-4 px-8 py-2 bg-black text-white text-xs tracking-widest uppercase">
                          {heroMain.cta_text}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm p-6">
          <h2 className="text-xl tracking-wider uppercase font-light mb-6">Category Banners</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryBanners.map((banner, index) => (
              <div key={banner.id} className="border border-gray-200 p-4">
                <div className="mb-4">
                  <div className="relative aspect-[3/4] bg-gray-100 mb-2">
                    {banner.image_url && (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-center text-white px-2">
                        <h3 className="text-xl font-light tracking-wider uppercase">
                          {banner.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-1">Title</label>
                    <input
                      type="text"
                      value={banner.title}
                      onChange={(e) => updateCategoryBanner(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={banner.image_url}
                      onChange={(e) => updateCategoryBanner(index, 'image_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-1">Upload Image</label>
                    <input
                      ref={(el) => categoryImageRefs.current[banner.id] = el}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCategoryImageUpload(e, index)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => categoryImageRefs.current[banner.id]?.click()}
                      disabled={uploading}
                      className="w-full py-2 bg-white border border-black text-black text-xs uppercase tracking-wider hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-3 h-3" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Max 5MB. Recommended: 800x1200px</p>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-1">Link URL</label>
                    <input
                      type="text"
                      value={banner.link_url || ''}
                      onChange={(e) => updateCategoryBanner(index, 'link_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={banner.is_active}
                        onChange={(e) => updateCategoryBanner(index, 'is_active', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-xs uppercase text-gray-600">Active</span>
                    </label>
                  </div>

                  <button
                    onClick={() => saveCategoryBanner(banner)}
                    disabled={saving}
                    className="w-full py-2 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50"
                  >
                    Save Banner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

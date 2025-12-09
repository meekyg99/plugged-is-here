import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_url: string | null;
  background_type: string | null;
  gradient_from: string | null;
  gradient_via: string | null;
  gradient_to: string | null;
  image_url: string;
  is_active: boolean;
}

interface CategoryBanner {
  id: string;
  title: string;
  subtitle: string | null;
  position: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
}

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [heroMain, setHeroMain] = useState<HeroBanner | null>(null);
  const [categoryBanners, setCategoryBanners] = useState<CategoryBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [fallbackProductImages, setFallbackProductImages] = useState<{ men?: string; women?: string; accessories?: string; hero?: string }>({});

  const heroImage = fallbackProductImages.hero || heroMain?.image_url;
  const menImage = fallbackProductImages.men || categoryBanners.find((b) => b.position === 'men')?.image_url;
  const womenImage = fallbackProductImages.women || categoryBanners.find((b) => b.position === 'women')?.image_url;
  const accessoriesImage = fallbackProductImages.accessories || categoryBanners.find((b) => b.position === 'accessories')?.image_url;

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    fetchHeroContent();
    fetchFallbackImages();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchFallbackImages = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`id, gender, category:categories(name), images:product_images(image_url, display_order)`) // assuming RLS allows
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading fallback product images:', error);
        return;
      }

      const heroCandidate = data?.find((p) => p.images && p.images.length > 0);
      const menCandidate = data?.find((p) => (p.gender === 'men' || p.gender === 'unisex') && p.images?.length);
      const womenCandidate = data?.find((p) => (p.gender === 'women' || p.gender === 'unisex') && p.images?.length);
      const accessoriesCandidate = data?.find((p) => p.category?.name?.toLowerCase() === 'accessories' && p.images?.length);

      const firstImage = (item?: any) => item?.images?.sort((a: any, b: any) => a.display_order - b.display_order)[0]?.image_url;

      setFallbackProductImages({
        hero: firstImage(heroCandidate),
        men: firstImage(menCandidate),
        women: firstImage(womenCandidate),
        accessories: firstImage(accessoriesCandidate),
      });
    } catch (err) {
      console.error('Unexpected error loading fallback images:', err);
    }
  };

  const fetchHeroContent = async () => {
    try {
      const { data: heroData } = await supabase
        .from('banners')
        .select('*')
        .eq('banner_type', 'hero_main')
        .eq('position', 'main')
        .eq('is_active', true)
        .maybeSingle();

      if (heroData) {
        setHeroMain(heroData);
      }

      const { data: categoryData } = await supabase
        .from('banners')
        .select('*')
        .eq('banner_type', 'hero_category')
        .eq('is_active', true)
        .order('display_order');

      if (categoryData) {
        setCategoryBanners(categoryData);
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundStyle = () => {
    if (!heroMain && heroImage) {
      return {
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    if (heroImage) {
      return {
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }

    const from = heroMain.gradient_from || '#fef3c7';
    const via = heroMain.gradient_via || '#fed7aa';
    const to = heroMain.gradient_to || '#fecdd3';
    return { background: `linear-gradient(to bottom right, ${from}, ${via}, ${to})` };
  };

  const menBanner = categoryBanners.find(b => b.position === 'men');
  const womenBanner = categoryBanners.find(b => b.position === 'women');
  const accessoriesBanner = categoryBanners.find(b => b.position === 'accessories');

  const heroTitle = (heroMain?.title || 'Spring Summer 2025 Collection').replace(/2024/g, '2025');
  const heroSubtitle = (heroMain?.subtitle || 'New season, new silhouettes').replace(/2024/g, '2025');

  return (
    <section className="relative pt-16">
      {/* Main Hero */}
      <div className="relative h-screen overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            ...getBackgroundStyle(),
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-8 px-4">
              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              ) : (
                <>
                  <h1
                    className={`text-5xl sm:text-7xl lg:text-9xl font-light tracking-[0.2em] uppercase transition-all duration-1500 ${
                      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{
                      transform: `translateY(${isLoaded ? 0 : 40}px) scale(${1 - scrollY * 0.0005})`,
                      opacity: 1 - scrollY * 0.002,
                    }}
                  >
                    {heroMain?.title || 'Summer 2025'}
                                      {heroTitle}
                  </h1>
                  {heroMain?.subtitle && (
                                      {heroSubtitle}
                    <p
                      className={`text-xl sm:text-2xl tracking-[0.3em] uppercase transition-all duration-1500 delay-300 ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{
                        opacity: 1 - scrollY * 0.003,
                      }}
                    >
                      {heroMain.subtitle || 'New season, new silhouettes'}
                    </p>
                  )}
                  {heroMain?.cta_text && (
                    <Link
                      to={heroMain.cta_url || '/products'}
                      className={`mt-8 inline-block px-12 py-3 bg-black text-white text-sm tracking-widest uppercase hover:bg-gray-800 transition-all duration-500 delay-600 shadow-lg hover:shadow-2xl hover:scale-105 ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{
                        opacity: 1 - scrollY * 0.003,
                      }}
                    >
                      {heroMain.cta_text}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3" data-categories-section>
        {(menBanner || menImage) && (
          <div className="relative h-[60vh] lg:h-[80vh] overflow-hidden group">
            <img
              src={menImage || ''}
              alt={menBanner?.title || 'Men'}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-500"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center px-4 transform transition-all duration-500 group-hover:-translate-y-2">
                <h2 className="text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase mb-6">
                  {menBanner?.title || 'Men'}
                </h2>
                <Link
                  to={menBanner?.link_url || '/category/all?gender=men'}
                  className="inline-block bg-white text-black px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  Explore
                </Link>
              </div>
            </div>
          </div>
        )}

        {(womenBanner || womenImage) && (
          <div className="relative h-[60vh] lg:h-[80vh] overflow-hidden group">
            <img
              src={womenImage || ''}
              alt={womenBanner?.title || 'Women'}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-500"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center px-4 transform transition-all duration-500 group-hover:-translate-y-2">
                <h2 className="text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase mb-6">
                  {womenBanner?.title || 'Women'}
                </h2>
                <Link
                  to={womenBanner?.link_url || '/category/all?gender=women'}
                  className="inline-block bg-white text-black px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  Explore
                </Link>
              </div>
            </div>
          </div>
        )}

        {(accessoriesBanner || accessoriesImage) && (
          <div className="relative h-[60vh] lg:h-[80vh] overflow-hidden group">
            <img
              src={accessoriesImage || ''}
              alt={accessoriesBanner?.title || 'Accessories'}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-500"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center px-4 transform transition-all duration-500 group-hover:-translate-y-2">
                <h2 className="text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase mb-6">
                  {accessoriesBanner?.title || 'Accessories'}
                </h2>
                <Link
                  to={accessoriesBanner?.link_url || '/category/accessories'}
                  className="inline-block bg-white text-black px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  Explore
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

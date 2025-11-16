import { useEffect, useState } from 'react';

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative pt-16">
      {/* Main Hero */}
      <div className="relative h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100"
          style={{
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
              <h1
                className={`text-5xl sm:text-7xl lg:text-9xl font-light tracking-[0.2em] uppercase transition-all duration-1500 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transform: `translateY(${isLoaded ? 0 : 40}px) scale(${1 - scrollY * 0.0005})`,
                  opacity: 1 - scrollY * 0.002,
                }}
              >
                Spring Summer
              </h1>
              <p
                className={`text-xl sm:text-2xl tracking-[0.3em] uppercase transition-all duration-1500 delay-300 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  opacity: 1 - scrollY * 0.003,
                }}
              >
                2024 Collection
              </p>
              <button
                onClick={() => {
                  const categoriesSection = document.querySelector('[data-categories-section]');
                  if (categoriesSection) {
                    categoriesSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`mt-8 px-12 py-3 bg-black text-white text-sm tracking-widest uppercase hover:bg-gray-800 transition-all duration-500 delay-600 shadow-lg hover:shadow-2xl hover:scale-105 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  opacity: 1 - scrollY * 0.003,
                }}
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3" data-categories-section>
        <div className="relative h-[60vh] lg:h-[80vh] overflow-hidden group">
          <img
            src="https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Men's Collection"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-500"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center px-4 transform transition-all duration-500 group-hover:-translate-y-2">
              <h2 className="text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase mb-6">
                Men's Collection
              </h2>
              <button className="inline-block bg-white text-black px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-2xl">
                Explore
              </button>
            </div>
          </div>
        </div>

        <div className="relative h-[60vh] lg:h-[80vh] overflow-hidden group">
          <img
            src="https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Women's Collection"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-500"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center px-4 transform transition-all duration-500 group-hover:-translate-y-2">
              <h2 className="text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase mb-6">
                Women's Collection
              </h2>
              <button className="inline-block bg-white text-black px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-2xl">
                Explore
              </button>
            </div>
          </div>
        </div>

        <div className="relative h-[60vh] lg:h-[80vh] overflow-hidden group">
          <img
            src="https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Accessories Collection"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-500"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center px-4 transform transition-all duration-500 group-hover:-translate-y-2">
              <h2 className="text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase mb-6">
                Accessories Collection
              </h2>
              <button className="inline-block bg-white text-black px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-2xl">
                Explore
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

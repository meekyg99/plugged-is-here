export default function Hero() {
  return (
    <section className="relative pt-16">
      {/* Main Hero */}
      <div className="relative h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-8 px-4">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-light tracking-[0.2em] uppercase">
                Spring Summer
              </h1>
              <p className="text-xl sm:text-2xl tracking-[0.3em] uppercase">
                2024 Collection
              </p>
              <button className="mt-8 px-10 py-2 bg-black text-white text-sm tracking-widest uppercase rounded-2xl hover:bg-gray-800 transition-colors">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="relative h-[60vh] lg:h-[80vh] bg-gray-900">
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center px-4">
              <h2 className="text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase mb-6">
                Men's Collection
              </h2>
              <a
                href="#"
                className="inline-block bg-black text-white px-8 py-2 text-sm tracking-widest uppercase rounded-2xl hover:bg-gray-800 transition-colors"
              >
                Explore
              </a>
            </div>
          </div>
        </div>

        <div className="relative h-[60vh] lg:h-[80vh] bg-gray-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h2 className="text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase mb-6">
                Women's Collection
              </h2>
              <a
                href="#"
                className="inline-block bg-black text-white px-8 py-2 text-sm tracking-widest uppercase rounded-2xl hover:bg-gray-800 transition-colors"
              >
                Explore
              </a>
            </div>
          </div>
        </div>

        <div className="relative h-[60vh] lg:h-[80vh] bg-gray-800">
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center px-4">
              <h2 className="text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase mb-6">
                Accessories Collection
              </h2>
              <a
                href="#"
                className="inline-block bg-black text-white px-8 py-2 text-sm tracking-widest uppercase rounded-2xl hover:bg-gray-800 transition-colors"
              >
                Explore
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

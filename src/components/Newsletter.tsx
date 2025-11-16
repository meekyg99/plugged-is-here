import { useState, useEffect, useRef } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1549200/pexels-photo-1549200.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Newsletter Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 text-white">
          <h2
            className={`text-3xl sm:text-5xl font-light tracking-[0.2em] uppercase transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Stay Connected
          </h2>
          <p
            className={`text-sm tracking-wider uppercase text-gray-300 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Subscribe to receive updates on new arrivals and exclusive offers
          </p>

          <form
            onSubmit={handleSubmit}
            className={`max-w-md mx-auto transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter your email"
                className={`w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-sm border-2 text-white placeholder-gray-400 focus:outline-none tracking-wider text-sm transition-all ${
                  focused ? 'border-white bg-opacity-20' : 'border-gray-500'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-6 px-12 py-3 bg-white text-black text-sm tracking-widest uppercase hover:bg-gray-200 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

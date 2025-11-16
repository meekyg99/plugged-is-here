import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="py-12 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-light tracking-[0.2em] uppercase">
            Stay Connected
          </h2>
          <p className="text-sm tracking-wider uppercase text-gray-400">
            Subscribe to receive updates on new arrivals and exclusive offers
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter your email"
                className={`w-full px-6 py-4 bg-transparent border-b-2 text-white placeholder-gray-500 focus:outline-none tracking-wider text-sm transition-colors ${
                  focused ? 'border-white' : 'border-gray-600'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-6 px-10 py-2 bg-white text-black text-sm tracking-widest uppercase rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

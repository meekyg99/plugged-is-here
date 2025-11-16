import { Search, Briefcase, Menu, X, Heart, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const [cartCount] = useState(0);
  const [wishlistCount] = useState(0);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [menOpen, setMenOpen] = useState(false);
  const [womenOpen, setWomenOpen] = useState(false);
  const [mobileMenOpen, setMobileMenOpen] = useState(false);
  const [mobileWomenOpen, setMobileWomenOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-black">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 transition-colors rounded-2xl"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Desktop Navigation - Left */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a
                href="#"
                className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity"
              >
                New Arrivals
              </a>
              <div
                className="relative"
                onMouseEnter={() => setMenOpen(true)}
                onMouseLeave={() => setMenOpen(false)}
              >
                <button
                  className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center space-x-1"
                >
                  <span>Men</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {menOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-black shadow-lg min-w-[200px] py-2">
                    <a
                      href="#"
                      className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors"
                    >
                      Shoes
                    </a>
                    <a
                      href="#"
                      className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors"
                    >
                      Accessories
                    </a>
                    <a
                      href="#"
                      className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors"
                    >
                      Clothes
                    </a>
                    <a
                      href="#"
                      className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors"
                    >
                      Natives
                    </a>
                  </div>
                )}
              </div>
              <div
                className="relative"
                onMouseEnter={() => setWomenOpen(true)}
                onMouseLeave={() => setWomenOpen(false)}
              >
                <button
                  className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center space-x-1"
                >
                  <span>Women</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {womenOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-black shadow-lg min-w-[200px] py-2">
                    <a
                      href="#"
                      className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors"
                    >
                      Accessories
                    </a>
                    <a
                      href="#"
                      className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors"
                    >
                      Shoes
                    </a>
                    <a
                      href="#"
                      className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors"
                    >
                      Clothes
                    </a>
                  </div>
                )}
              </div>
              <div
                className="relative"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <button
                  className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center space-x-1"
                >
                  <span>Collections</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {collectionsOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-black shadow-lg min-w-[200px] py-2">
                    <a
                      href="#"
                      className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors"
                    >
                      Accessories
                    </a>
                  </div>
                )}
              </div>
            </nav>

            {/* Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <a href="#" className="text-xl font-bold tracking-[0.15em]">
                PLUGGED BY 212
              </a>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              <button className="relative group p-2 hover:bg-gray-50 rounded-2xl transition-all duration-300">
                <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>

              <button className="relative group p-2 hover:bg-gray-50 rounded-2xl transition-all duration-300 hidden sm:block">
                <Heart className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-black" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button className="relative group p-2 hover:bg-gray-50 rounded-2xl transition-all duration-300">
                <Briefcase className="w-5 h-5 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col pt-24 px-8 space-y-6 pb-8">
          <a
            href="#"
            className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity"
          >
            New Arrivals
          </a>

          <div>
            <button
              onClick={() => setMobileMenOpen(!mobileMenOpen)}
              className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center justify-between w-full"
            >
              <span>Men</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileMenOpen && (
              <div className="space-y-3 mt-3">
                <a
                  href="#"
                  className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4"
                >
                  Shoes
                </a>
                <a
                  href="#"
                  className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4"
                >
                  Accessories
                </a>
                <a
                  href="#"
                  className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4"
                >
                  Clothes
                </a>
                <a
                  href="#"
                  className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4"
                >
                  Natives
                </a>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setMobileWomenOpen(!mobileWomenOpen)}
              className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center justify-between w-full"
            >
              <span>Women</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileWomenOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileWomenOpen && (
              <div className="space-y-3 mt-3">
                <a
                  href="#"
                  className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4"
                >
                  Accessories
                </a>
                <a
                  href="#"
                  className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4"
                >
                  Shoes
                </a>
                <a
                  href="#"
                  className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4"
                >
                  Clothes
                </a>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)}
              className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center justify-between w-full"
            >
              <span>Collections</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileCollectionsOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileCollectionsOpen && (
              <div className="space-y-3 mt-3">
                <a
                  href="#"
                  className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4"
                >
                  Accessories
                </a>
              </div>
            )}
          </div>

          <a
            href="#"
            className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity"
          >
            Account
          </a>
        </nav>
      </div>
    </>
  );
}

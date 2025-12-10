import { Search, Briefcase, Menu, X, Heart, ChevronDown, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import AuthModal from './auth/AuthModal';
import SearchModal from './SearchModal';
import Logo from './Logo';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { items: wishlistItems } = useWishlist();
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [sportOpen, setSportOpen] = useState(false);
  const [menOpen, setMenOpen] = useState(false);
  const [womenOpen, setWomenOpen] = useState(false);
  const [mobileMenOpen, setMobileMenOpen] = useState(false);
  const [mobileWomenOpen, setMobileWomenOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const [mobileSportOpen, setMobileSportOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const { itemCount, toggleCart } = useCart();

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-black">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 transition-colors rounded-2xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="flex items-center">
                <img
                  src="https://res.cloudinary.com/darhndmms/image/upload/v1765207904/WhatsApp_Image_2025-10-28_at_11.51.32_0752b31a_-_Copy_ivmyz2.jpg"
                  alt="Plugged logo"
                  className="h-10 w-auto bg-white mix-blend-multiply"
                />
              </Link>
              <div
                className="relative"
                onMouseEnter={() => setMenOpen(true)}
                onMouseLeave={() => setMenOpen(false)}
              >
                <button
                  onClick={() => setMenOpen(!menOpen)}
                  className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center space-x-1"
                >
                  <span>Men</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {menOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-black shadow-lg min-w-[200px] py-2 z-50">
                    <Link to="/category/shoes?gender=men" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Shoes</Link>
                    <Link to="/category/accessories?gender=men" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Accessories</Link>
                    <Link to="/category/clothes?gender=men" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Clothes</Link>
                    <Link to="/category/natives?gender=men" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Natives</Link>
                  </div>
                )}
              </div>
              <div
                className="relative"
                onMouseEnter={() => setWomenOpen(true)}
                onMouseLeave={() => setWomenOpen(false)}
              >
                <button
                  onClick={() => setWomenOpen(!womenOpen)}
                  className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center space-x-1"
                >
                  <span>Women</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {womenOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-black shadow-lg min-w-[200px] py-2 z-50">
                    <Link to="/category/accessories?gender=women" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Accessories</Link>
                    <Link to="/category/shoes?gender=women" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Shoes</Link>
                    <Link to="/category/clothes?gender=women" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Clothes</Link>
                  </div>
                )}
              </div>
              <div
                className="relative"
                onMouseEnter={() => setSportOpen(true)}
                onMouseLeave={() => setSportOpen(false)}
              >
                <button
                  onClick={() => setSportOpen(!sportOpen)}
                  className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center space-x-1"
                >
                  <span>Sport</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {sportOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-black shadow-lg min-w-[200px] py-2 z-50">
                    <Link to="/category/jersey" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Jersey</Link>
                    <Link to="/category/shorts" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Shorts</Link>
                    <Link to="/category/slides" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Slides</Link>
                  </div>
                )}
              </div>
              <div
                className="relative"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <button
                  onClick={() => setCollectionsOpen(!collectionsOpen)}
                  className="text-sm tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center space-x-1"
                >
                  <span>Collections</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {collectionsOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-black shadow-lg min-w-[200px] py-2 z-50">
                    <Link to="/category/accessories" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Accessories</Link>
                  </div>
                )}
              </div>
            </nav>

            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Logo />
            </div>

            <div className="flex items-center space-x-2 sm:space-x-6 ml-4 sm:ml-0">
              <button onClick={() => setSearchOpen(true)} className="relative group p-2 hover:bg-gray-50 rounded-2xl transition-all duration-300">
                <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>

              <Link to="/wishlist" className="relative group p-2 hover:bg-gray-50 rounded-2xl transition-all duration-300 hidden sm:block">
                <Heart className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:fill-black" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <button onClick={toggleCart} className="relative group p-2 hover:bg-gray-50 rounded-2xl transition-all duration-300">
                <Briefcase className="w-5 h-5 transition-transform group-hover:scale-110" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2 hover:bg-gray-50 rounded-2xl transition-all duration-300">
                    <User className="w-5 h-5" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 bg-white border border-black shadow-lg min-w-[200px] py-2">
                      <div className="px-6 py-3 border-b border-gray-200">
                        <p className="text-xs uppercase tracking-wider text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
                      </div>
                      <Link to="/account" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">My Account</Link>
                      <Link to="/orders" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Orders</Link>
                      <Link to="/track-order" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">Track Order</Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" className="block px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors border-t border-gray-200">Admin Dashboard</Link>
                      )}
                      <button onClick={handleSignOut} className="w-full text-left px-6 py-3 text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors border-t border-gray-200 flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => handleAuthClick('signin')} className="p-2 hover:bg-gray-50 rounded-2xl transition-all duration-300">
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="flex flex-col pt-24 px-8 space-y-6 pb-8">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="inline-flex w-fit">
            <img
              src="https://res.cloudinary.com/darhndmms/image/upload/v1765207904/WhatsApp_Image_2025-10-28_at_11.51.32_0752b31a_-_Copy_ivmyz2.jpg"
              alt="Plugged logo"
              className="h-12 w-auto"
            />
          </Link>

          <div>
            <button onClick={() => setMobileMenOpen(!mobileMenOpen)} className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center justify-between w-full">
              <span>Men</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileMenOpen && (
              <div className="space-y-3 mt-3">
                <Link to="/category/shoes?gender=men" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Shoes</Link>
                <Link to="/category/accessories?gender=men" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Accessories</Link>
                <Link to="/category/clothes?gender=men" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Clothes</Link>
                <Link to="/category/natives?gender=men" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Natives</Link>
              </div>
            )}
          </div>

          <div>
            <button onClick={() => setMobileWomenOpen(!mobileWomenOpen)} className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center justify-between w-full">
              <span>Women</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileWomenOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileWomenOpen && (
              <div className="space-y-3 mt-3">
                <Link to="/category/accessories?gender=women" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Accessories</Link>
                <Link to="/category/shoes?gender=women" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Shoes</Link>
                <Link to="/category/clothes?gender=women" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Clothes</Link>
              </div>
            )}
          </div>

          <div>
            <button onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)} className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center justify-between w-full">
              <span>Collections</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileCollectionsOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileCollectionsOpen && (
              <div className="space-y-3 mt-3">
                <Link to="/category/accessories" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Accessories</Link>
              </div>
            )}
          </div>

          <div>
            <button onClick={() => setMobileSportOpen(!mobileSportOpen)} className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity flex items-center justify-between w-full">
              <span>Sport</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileSportOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileSportOpen && (
              <div className="space-y-3 mt-3">
                <Link to="/category/jersey" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Jersey</Link>
                <Link to="/category/shorts" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Shorts</Link>
                <Link to="/category/slides" onClick={() => setMobileMenuOpen(false)} className="text-base tracking-wider uppercase hover:opacity-60 transition-opacity block pl-4">Slides</Link>
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity">My Account</Link>
              <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity text-left">Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => { handleAuthClick('signin'); setMobileMenuOpen(false); }} className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity text-left">Sign In</button>
              <button onClick={() => { handleAuthClick('signup'); setMobileMenuOpen(false); }} className="text-xl tracking-wider uppercase hover:opacity-60 transition-opacity text-left">Create Account</button>
            </>
          )}
        </nav>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

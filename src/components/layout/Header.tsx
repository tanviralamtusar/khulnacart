import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Home,
  Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartCount, toggleCart } from '@/store/slices/cartSlice';
import { selectWishlistItems } from '@/store/slices/wishlistSlice';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import defaultLogo from '@/assets/site-logo.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const cartCount = useAppSelector(selectCartCount);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const dispatch = useAppDispatch();
  const { user, signOut, isAdmin } = useAuth();

  // Fetch header settings
  const { data: headerSettings } = useQuery({
    queryKey: ['header-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['site_name', 'site_logo', 'shop_logo_url']);

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach(item => {
        settingsMap[item.key] = item.value;
      });

      return settingsMap;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const siteName = headerSettings?.site_name || 'Khulna Cart';
  const siteLogo = headerSettings?.site_logo || headerSettings?.shop_logo_url || defaultLogo;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/95 backdrop-blur-md shadow-md' : 'bg-background'
    }`}>
      {/* Main Header */}
      <div className="container-custom py-3">
        <div className="grid grid-cols-3 items-center justify-between gap-4">
          {/* Left: Mobile Menu Toggle */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-transparent"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Center: Empty */}
          <div className="flex items-center justify-center">
          </div>

          {/* Right: Search */}
          <div className="flex items-center justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-transparent"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Input Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-background overflow-hidden px-4 py-3"
          >
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 rounded-full"
              />
              <Button 
                type="submit"
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation - Desktop (Simplified) */}
      <nav className="hidden md:block border-t border-border">
        <div className="container-custom">
          <ul className="flex items-center justify-center gap-12 py-3">
            <li>
              <Link to="/" className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/products" className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors">Products</Link>
            </li>
            <li>
              <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors">About Us</Link>
            </li>
            <li>
              <Link to="/contact" className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors">Contact Us</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Sidebar-like Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="md:hidden fixed inset-0 z-[60] bg-background"
          >
            <div className="container-custom py-6">
              <div className="flex items-center justify-between mb-8">
                <span className="text-2xl font-bold">{siteName}</span>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="space-y-6">
                <Link to="/" className="block text-xl font-semibold text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                <Link to="/products" className="block text-xl font-semibold text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
                <Link to="/about" className="block text-xl font-semibold text-foreground" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                <Link to="/contact" className="block text-xl font-semibold text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
                <div className="pt-6 border-t border-border">
                  <Link to="/auth" className="block text-xl font-semibold text-primary" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border px-4 py-2 pb-safe">
        <div className="flex items-center justify-between relative">
          <Link to="/" className="flex flex-col items-center gap-1 group">
            <Home className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary">Home</span>
          </Link>
          
          <Link to="/products" className="flex flex-col items-center gap-1 group">
            <Grid className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary">Categories</span>
          </Link>

          {/* Large Cart Button */}
          <div className="relative -mt-8">
            <Button 
              size="icon" 
              className="w-14 h-14 rounded-full bg-primary shadow-lg border-4 border-background hover:bg-primary/90 transition-transform active:scale-95"
              onClick={() => dispatch(toggleCart())}
            >
              <ShoppingCart className="w-6 h-6 text-primary-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-primary shadow-sm">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>

          <Link to="/wishlist" className="flex flex-col items-center gap-1 group">
            <Heart className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary">Wishlist</span>
          </Link>

          <Link to={user ? (isAdmin ? '/admin' : '/my-account') : '/auth'} className="flex flex-col items-center gap-1 group">
            <User className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary">Log In</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

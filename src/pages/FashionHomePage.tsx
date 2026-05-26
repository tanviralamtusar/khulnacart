import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import heroSlide1 from '@/assets/hero-slide-1.jpg';
import heroSlide2 from '@/assets/hero-slide-2.jpg';
import heroSlide3 from '@/assets/hero-slide-3.jpg';
import defaultLogo from '@/assets/site-logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Heart, User, LayoutDashboard, ChevronRight, ChevronLeft,
  Sparkles, Truck, Shield, RotateCcw, Star, ArrowRight, Headphones,
  Search, Menu, X, Eye, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartCount, toggleCart, addToCart, openCart } from '@/store/slices/cartSlice';
import { selectWishlistItems, toggleWishlist } from '@/store/slices/wishlistSlice';
import { toast } from 'sonner';
import { Product as ProductType } from '@/types';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  images: string[];
  slug: string;
  category_id: string | null;
  is_new?: boolean;
  is_featured?: boolean;
  rating?: number;
  review_count?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  productImage?: string | null; // First product image from this category
}

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
}

interface HomePageContent {
  [key: string]: any;
}

export default function FashionHomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [homeContent, setHomeContent] = useState<HomePageContent>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartCount = useAppSelector(selectCartCount);
  const wishlistItems = useAppSelector(selectWishlistItems);

  // Site header settings (logo + name)
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
    const fetchData = async () => {
      try {
        // Run all independent queries in parallel for speed
        const [
          { data: homePageData },
          { data: bannersData },
          { data: categoriesData },
          { data: featuredData },
          { data: newData },
          { data: recentData },
        ] = await Promise.all([
          supabase.from('home_page_content').select('*'),
          supabase.from('banners').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('categories').select('*').order('sort_order', { ascending: true }),
          supabase.from('products').select('*').eq('is_featured', true).eq('is_active', true).limit(8),
          supabase.from('products').select('*').eq('is_new', true).eq('is_active', true).limit(8),
          supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
        ]);

        if (homePageData) {
          const contentMap: HomePageContent = {};
          homePageData.forEach((item: any) => {
            contentMap[item.section_key] = item.content;
          });
          setHomeContent(contentMap);
        }

        if (bannersData && bannersData.length > 0) {
          setBanners(bannersData);
        }

        if (categoriesData) {
          // For categories without images, fetch first product image in parallel
          const catsNeedingImages = categoriesData.filter(cat => !cat.image_url);
          let productImages: Record<string, string | null> = {};
          
          if (catsNeedingImages.length > 0) {
            const imageResults = await Promise.all(
              catsNeedingImages.map(cat =>
                supabase
                  .from('products')
                  .select('images')
                  .eq('category_id', cat.id)
                  .eq('is_active', true)
                  .not('images', 'is', null)
                  .limit(1)
                  .single()
                  .then(({ data }) => ({ catId: cat.id, image: data?.images?.[0] || null }))
              )
            );
            imageResults.forEach(r => { productImages[r.catId] = r.image; });
          }

          setCategories(categoriesData.map(cat => ({
            ...cat,
            productImage: cat.image_url ? null : (productImages[cat.id] || null)
          })));
        }

        if (featuredData) setFeaturedProducts(featuredData);
        if (newData) setNewArrivals(newData);
        if (recentData) setRecentProducts(recentData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-slide for hero carousel
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString('bn-BD')}`;
  };

  // Get icon component from string name
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = { Truck, RotateCcw, Shield, Headphones };
    return icons[iconName] || Truck;
  };

  // Features from home content or defaults
  const featuresBarItems = homeContent.features_bar?.items || [
    { icon: 'Truck', title: 'দ্রুত ডেলিভারি', desc: 'সারাদেশে ফ্রি ডেলিভারি' },
    { icon: 'RotateCcw', title: 'ইনস্ট্যান্ট চেক', desc: 'রিটার্ন পলিসি' },
    { icon: 'Shield', title: 'ক্যাশ অন ডেলিভারি', desc: 'পণ্য হাতে পেয়ে পেমেন্ট' },
    { icon: 'Headphones', title: '২৪/৭ সাপোর্ট', desc: 'যেকোনো সময় যোগাযোগ' },
  ];

  // Header promo text from home content
  const headerPromoText = homeContent.header_promo?.text || '৳২০০০+ অর্ডারে সারাদেশে ফ্রি ডেলিভারি | ৭ দিনের ইজি রিটার্ন';
  const headerPromoEnabled = homeContent.header_promo?.enabled !== false;

  // Hero slides from home content, banners, or defaults
  const defaultSlides = [
    {
      id: '1',
      title: 'নতুন টু পিস কালেকশন',
      subtitle: 'এক্সক্লুসিভ ডিজাইন, প্রিমিয়াম কোয়ালিটি - ৩০% পর্যন্ত ছাড়',
      image: heroSlide1,
      link: '/products?category=two-piece',
      badge: '৩০% ছাড়'
    },
    {
      id: '2',
      title: 'থ্রি পিস স্পেশাল',
      subtitle: 'প্রিমিয়াম ফেব্রিক, এলিগ্যান্ট ডিজাইন - নতুন আগমন',
      image: heroSlide2,
      link: '/products?category=three-piece',
      badge: 'নতুন'
    },
    {
      id: '3',
      title: 'সামার কালেকশন ২০২৬',
      subtitle: 'কমফোর্টেবল এবং স্টাইলিশ - গরমের জন্য পারফেক্ট',
      image: heroSlide3,
      link: '/products',
      badge: 'ট্রেন্ডিং'
    }
  ];

  // Priority: home_page_content hero_slides > banners > defaultSlides
  const getHeroSlides = () => {
    const contentSlides = homeContent.hero_slides?.slides;
    if (contentSlides && contentSlides.length > 0 && contentSlides.some((s: any) => s.image)) {
      return contentSlides.map((s: any, index: number) => ({
        id: s.id || String(index),
        title: s.title || '',
        subtitle: s.subtitle || '',
        image: s.image || defaultSlides[index]?.image || heroSlide1,
        link: s.link || '/products',
        badge: s.badge || ''
      }));
    }
    if (banners.length > 0) {
      return banners.map(b => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || '',
        image: b.image_url,
        link: b.link_url || '/products',
        badge: 'নতুন'
      }));
    }
    return defaultSlides;
  };

  const heroSlides = getHeroSlides();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // Convert to ProductType for cart
    const productForCart: ProductType = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: '',
      price: product.price,
      originalPrice: product.original_price || undefined,
      images: product.images || [],
      category: '',
      rating: product.rating || 0,
      reviewCount: product.review_count || 0,
      stock: 100,
    };
    dispatch(addToCart({ product: productForCart, quantity: 1 }));
    dispatch(openCart());
    toast.success('কার্টে যোগ করা হয়েছে');
  };

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    const productForCart: ProductType = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: '',
      price: product.price,
      originalPrice: product.original_price || undefined,
      images: product.images || [],
      category: '',
      rating: product.rating || 0,
      reviewCount: product.review_count || 0,
      stock: 100,
    };

    dispatch(addToCart({ product: productForCart, quantity: 1 }));
    navigate('/checkout');
  };

  const handleToggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // Convert to ProductType for wishlist
    const productForWishlist: ProductType = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: '',
      price: product.price,
      originalPrice: product.original_price || undefined,
      images: product.images || [],
      category: '',
      rating: product.rating || 0,
      reviewCount: product.review_count || 0,
      stock: 100,
    };
    dispatch(toggleWishlist(productForWishlist));
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item: any) => item.id === productId);
  };

  const getDiscount = (price: number, originalPrice: number | null) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Placeholder products if no data
  const placeholderProducts = [
    { id: '1', name: 'ফ্লোরাল প্রিন্ট টু পিস', price: 2450, original_price: 3200, images: ['https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&q=80'], slug: 'floral-two-pcs' },
    { id: '2', name: 'এমব্রয়ডারি থ্রি পিস', price: 3850, original_price: 4500, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80'], slug: 'embroidery-three-pcs' },
    { id: '3', name: 'কটন টু পিস সেট', price: 1950, original_price: 2400, images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80'], slug: 'cotton-two-pcs' },
    { id: '4', name: 'সিল্ক থ্রি পিস', price: 4250, original_price: 5000, images: ['https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=400&q=80'], slug: 'silk-three-pcs' },
    { id: '5', name: 'প্রিন্টেড টু পিস', price: 2150, original_price: 2800, images: ['https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&q=80'], slug: 'printed-two-pcs' },
    { id: '6', name: 'ডিজাইনার থ্রি পিস', price: 5200, original_price: 6500, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80'], slug: 'designer-three-pcs' },
    { id: '7', name: 'ক্যাজুয়াল টু পিস', price: 1850, original_price: 2200, images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80'], slug: 'casual-two-pcs' },
    { id: '8', name: 'পার্টি থ্রি পিস', price: 4800, original_price: 5800, images: ['https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=400&q=80'], slug: 'party-three-pcs' },
  ];

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : placeholderProducts;
  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : placeholderProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      {headerPromoEnabled && (
        <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
          <div className="container-custom flex items-center justify-center gap-2">
            <Truck className="w-4 h-4" />
            <span>{headerPromoText}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src={siteLogo}
                alt={siteName}
                className="h-10 w-auto object-contain"
                loading="eager"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== defaultLogo) target.src = defaultLogo;
                }}
              />
              {/* Only show text if logo is missing */}
              {!siteLogo && (
                <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                  {siteName}
                </span>
              )}
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  className="pr-12 rounded-full border-2 focus:border-primary"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-primary/10"
                >
                  <Search className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <nav className="container-custom py-4">
                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="পণ্য খুঁজুন..."
                    className="rounded-full"
                  />
                </div>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      to="/" 
                      className="block py-2 text-foreground hover:text-primary font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      হোম
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/products?category=two-piece" 
                      className="block py-2 text-foreground hover:text-primary font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      টু পিস
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/products?category=three-piece" 
                      className="block py-2 text-foreground hover:text-primary font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      থ্রি পিস
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/products" 
                      className="block py-2 text-foreground hover:text-primary font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      সব প্রোডাক্ট
                    </Link>
                  </li>
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-primary font-medium text-sm tracking-wider uppercase">ক্যাটাগরি</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">
                শপ বাই <span className="text-primary">ক্যাটাগরি</span>
              </h2>
            </div>
            <Button variant="ghost" onClick={() => navigate('/products')} className="hidden md:flex">
              সব দেখুন <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>

          <div className={`grid grid-cols-2 gap-4 md:gap-6 ${categories.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
            {/* Dynamic categories from database */}
            {categories.map((category, index) => {
              // Define fallback images for categories - using reliable Unsplash images
              const fallbackImages = [
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
                'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
              ];
              
              const gradientColors = [
                'from-rose-100 to-rose-50',
                'from-violet-100 to-violet-50',
                'from-amber-100 to-amber-50',
                'from-emerald-100 to-emerald-50',
              ];

              // Priority: category image_url > product image > fallback
              const categoryImage = category.image_url || category.productImage || fallbackImages[index % fallbackImages.length];
              
              return (
                <motion.div
                  key={category.id}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/products?category=${category.slug}`)}
                >
                  <div className="bg-card hover:border-primary border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors h-32 md:h-40">
                    <div className="bg-primary/10 text-primary p-3 rounded-full group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="font-semibold text-foreground text-center text-sm md:text-base">{category.name}</span>
                  </div>
                </motion.div>
              );
            })}

            {/* Show placeholders if no categories exist */}
            {categories.length === 0 && (
              <>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                  onClick={() => navigate('/products?category=two-piece')}
                >
                  <div className="bg-card hover:border-primary border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors h-32 md:h-40">
                    <div className="bg-primary/10 text-primary p-3 rounded-full group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="font-semibold text-foreground text-center text-sm md:text-base">টু পিস</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                  onClick={() => navigate('/products?category=three-piece')}
                >
                  <div className="bg-card hover:border-primary border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors h-32 md:h-40">
                    <div className="bg-primary/10 text-primary p-3 rounded-full group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="font-semibold text-foreground text-center text-sm md:text-base">থ্রি পিস</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                  onClick={() => navigate('/products?filter=new')}
                >
                  <div className="bg-card hover:border-primary border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors h-32 md:h-40">
                    <div className="bg-primary/10 text-primary p-3 rounded-full group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="font-semibold text-foreground text-center text-sm md:text-base">নতুন আগমন</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                  onClick={() => navigate('/products?filter=sale')}
                >
                  <div className="bg-card hover:border-primary border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors h-32 md:h-40">
                    <div className="bg-primary/10 text-primary p-3 rounded-full group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="font-semibold text-foreground text-center text-sm md:text-base">সেল 🔥</span>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Recent Products - সাম্প্রতিক প্রোডাক্ট */}
      {recentProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-background">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-primary font-medium text-sm tracking-wider uppercase">নতুন আপলোড</span>
                <h2 className="text-2xl md:text-3xl font-bold mt-1">
                  সাম্প্রতিক <span className="text-primary">প্রোডাক্ট</span>
                </h2>
              </div>
              <Button variant="outline" onClick={() => navigate('/products')} className="rounded-full">
                সব দেখুন <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recentProducts.slice(0, 8).map((product: any, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div 
                    className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => product.slug && navigate(`/product/${product.slug}`)}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={product.images?.[0] || `https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&q=80`}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Discount Badge */}
                      {getDiscount(product.price, product.original_price) && (
                        <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                          -{getDiscount(product.price, product.original_price)}%
                        </Badge>
                      )}

                      {/* New Badge */}
                      {product.is_new && !getDiscount(product.price, product.original_price) && (
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                          নতুন
                        </Badge>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md"
                          onClick={(e) => handleToggleWishlist(product, e)}
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-destructive text-destructive' : ''}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md"
                          onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.slug}`); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">{formatPrice(product.price)}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-muted-foreground text-sm line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-primary font-medium text-sm tracking-wider uppercase">বেস্ট সেলিং</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">
                জনপ্রিয় <span className="text-primary">প্রোডাক্ট</span>
              </h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/products')} className="rounded-full">
              সব দেখুন <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.slice(0, 8).map((product: any, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div 
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => product.slug && navigate(`/product/${product.slug}`)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.images?.[0] || `https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&q=80`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Discount Badge */}
                    {getDiscount(product.price, product.original_price) && (
                      <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                        -{getDiscount(product.price, product.original_price)}%
                      </Badge>
                    )}

                    {/* New Badge */}
                    {product.is_new && !getDiscount(product.price, product.original_price) && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        নতুন
                      </Badge>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md"
                        onClick={(e) => handleToggleWishlist(product, e)}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-destructive text-destructive' : ''}`} />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md"
                        onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.slug}`); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-foreground mb-2 line-clamp-2 min-h-[3rem]">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < (product.rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} 
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({product.review_count || Math.floor(Math.random() * 50) + 10})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-primary font-medium text-sm tracking-wider uppercase">নতুন সংযোজন</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">
                নিউ <span className="text-primary">অ্যারাইভালস</span>
              </h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/products')} className="rounded-full">
              সব দেখুন <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {displayNewArrivals.map((product: any, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => product.slug && navigate(`/product/${product.slug}`)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-card mb-3">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={product.images?.[0] || `https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&q=80`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    নতুন
                  </Badge>

                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/90 hover:bg-white"
                    onClick={(e) => handleToggleWishlist(product, e)}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-destructive text-destructive' : ''}`} />
                  </Button>
                </div>

                <h3 className="font-medium text-foreground mb-1 line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8F5F0] text-foreground pt-12 pb-8 border-t border-border">
        <div className="container-custom">
          {/* Top Promise Bar */}
          <div className="text-center mb-12 max-w-4xl mx-auto px-4">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Never worry about <span className="font-bold text-foreground">quality and authenticity</span>—they are our core promises. We strictly check the <span className="font-bold text-foreground">expiry date</span> of every product before delivery.
            </p>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why We are Best?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 items-start">
            {/* Why We Are Best List */}
            <div className="flex flex-col items-center md:items-start">
              <ul className="space-y-3 text-sm md:text-base font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  Fastest Delivery [Same Day]
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  Verified & Authentic Products
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  Customer Support
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  Easy return policy
                </li>
              </ul>
            </div>

            {/* Customer Support Links */}
            <div className="flex flex-col items-center">
              <h4 className="font-bold text-lg mb-6 tracking-tight uppercase">CUSTOMER SUPPORT</h4>
              <ul className="space-y-4 text-center">
                <li><Link to="/auth" className="text-sm md:text-base hover:text-primary transition-colors">Login</Link></li>
                <li><Link to="/auth" className="text-sm md:text-base hover:text-primary transition-colors">Register</Link></li>
                <li><Link to="/contact" className="text-sm md:text-base hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* About & Branding */}
            <div className="flex flex-col items-center md:items-end text-center md:text-right">
              <p className="text-sm md:text-base text-muted-foreground max-w-xs mb-8 leading-relaxed">
                Just place the order, we will be at your door soon. <span className="font-bold text-foreground">Your parcel is safe</span> until we hand it over to you. We really love your feedback.
              </p>
              
              <div className="flex items-center justify-center md:justify-end">
                <span className="text-5xl md:text-6xl font-extrabold tracking-tighter">
                  khulna<span className="text-primary">Cart</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-xs md:text-sm text-muted-foreground">
            <p>Powered by khulnacart.com, All rights reserved, 2026.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

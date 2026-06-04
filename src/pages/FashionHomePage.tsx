import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Heart, User, ChevronRight, ChevronLeft,
  Truck, Shield, RotateCcw, Star, ArrowRight, Headphones,
  Eye, Home, Grid, Clock, Flame, Sparkles, Percent, Phone, MessageCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartCount, toggleCart, addToCart, openCart } from '@/store/slices/cartSlice';
import { selectWishlistItems, toggleWishlist } from '@/store/slices/wishlistSlice';
import { toast } from 'sonner';
import { Product as ProductType } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from '@/components/ui/carousel';

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

const FALLBACK_BANNERS = [
  {
    id: 'fallback-gadgets',
    title: 'স্মার্ট গ্যাজেট ও ইলেকট্রনিক্স কালেকশন',
    subtitle: 'সেরা সাউন্ড কোয়ালিটির ব্লুটুথ স্পিকার, ওয়্যারলেস নেকব্যান্ড ও প্রিমিয়াম গ্যাজেট',
    gradient: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950',
    textColor: 'text-white',
    badge: 'Smart Gadgets 2026',
    ctaText: 'এক্সপ্লোর করুন',
    link: '/products?category=gadgets',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    glowColor1: 'bg-cyan-500/20',
    glowColor2: 'bg-blue-400/15'
  },
  {
    id: 'fallback-skincare',
    title: 'অরিজিনাল স্কিনকেয়ার ও কসমেটিক্স',
    subtitle: 'নিভিয়া, ওয়াইসি ফেসওয়াশ এবং বিশ্বমানের আসল রূপচর্চা সামগ্রীর সমাহার',
    gradient: 'bg-gradient-to-br from-rose-950 via-pink-900 to-neutral-950',
    textColor: 'text-white',
    badge: 'Authentic Beauty & Skincare',
    ctaText: 'এখনই কিনুন',
    link: '/products?category=skincare',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    glowColor1: 'bg-pink-500/20',
    glowColor2: 'bg-rose-400/15'
  },
  {
    id: 'fallback-discount',
    title: 'অনলাইন পেমেন্টে নিশ্চিত ডিসকাউন্ট',
    subtitle: 'বিকাশ, রকেট বা যেকোনো ব্যাংক কার্ড পেমেন্টে ফ্ল্যাট ২০ টাকা ইনস্ট্যান্ট ছাড়!',
    gradient: 'bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-950',
    textColor: 'text-white',
    badge: 'Special Payment Discount',
    ctaText: 'অর্ডার করুন',
    link: '/products',
    badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
  }
];

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
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Update countdown timer to midnight
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      setTimeLeft({ 
        hours: hours < 0 ? 0 : hours, 
        minutes: minutes < 0 ? 0 : minutes, 
        seconds: seconds < 0 ? 0 : seconds 
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  // Autoplay hero banners
  useEffect(() => {
    const bannerCount = banners.length > 0 ? banners.length : FALLBACK_BANNERS.length;
    if (bannerCount <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerCount);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

   // States and effect for the sliding categories carousel
   const [carouselApi, setCarouselApi] = useState<CarouselApi>();
   const [canScrollPrev, setCanScrollPrev] = useState(false);
   const [canScrollNext, setCanScrollNext] = useState(false);

   useEffect(() => {
     if (!carouselApi) return;

     const onSelect = () => {
       setCanScrollPrev(carouselApi.canScrollPrev());
       setCanScrollNext(carouselApi.canScrollNext());
     };

     onSelect();
     carouselApi.on("select", onSelect);
     carouselApi.on("reInit", onSelect);

     return () => {
       carouselApi.off("select", onSelect);
       carouselApi.off("reInit", onSelect);
     };
   }, [carouselApi]);

   // Auto-scroll for categories carousel
   useEffect(() => {
     if (!carouselApi || categories.length <= 1) return;
     
     const interval = setInterval(() => {
       // Check if we can scroll next before attempting
       if (carouselApi.canScrollNext()) {
         carouselApi.scrollNext();
       } else {
         // If we're at the end, go back to the beginning
         carouselApi.scrollTo(0);
       }
     }, 5000); // Scroll every 5 seconds
     
     return () => clearInterval(interval);
   }, [carouselApi, categories.length]);

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
          const productImages: Record<string, string | null> = {};
          
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

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString('bn-BD')}`;
  };

  // Derived display lists
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : recentProducts;
  const displayNewArrivals = newArrivals;
  const bannerList = banners.length > 0 ? banners : FALLBACK_BANNERS;

  // Compute discount percentage
  const getDiscount = (price: number, originalPrice: number | null): number | null => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Wishlist helpers
  const isInWishlist = (productId: string) =>
    wishlistItems.some((item: any) => item.id === productId);

  const handleToggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      original_price: product.original_price,
      images: product.images,
      slug: product.slug,
    } as any));
    const inWishlist = isInWishlist(product.id);
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 pt-[60px] lg:pt-[72px]">
      <Header />

      {/* Hero Carousel Slider Section */}
      <div className="relative w-full h-[280px] sm:h-[400px] md:h-[480px] lg:h-[550px] overflow-hidden bg-neutral-950">
        <AnimatePresence mode="wait">
          {bannerList.map((banner, index) => {
            if (index !== currentSlide) return null;
            
            // Check if it is a fallback banner
            const isFallback = 'gradient' in banner;
            
            return (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`absolute inset-0 w-full h-full flex items-center ${
                  isFallback ? (banner as any).gradient : ''
                }`}
              >
                {/* Background image for DB banners */}
                {!isFallback && (
                  <>
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
                  </>
                )}

                {/* Decorative glowing orbs for fallback */}
                {isFallback && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 1.5, ease: 'easeOut' }}
                      className={`absolute -top-[30%] -right-[5%] w-[70%] h-[70%] rounded-full ${(banner as any).glowColor1} blur-3xl`}
                    />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 1.5, ease: 'easeOut' }}
                      className={`absolute -bottom-[25%] -left-[15%] w-[55%] h-[55%] rounded-full ${(banner as any).glowColor2} blur-3xl`}
                    />
                    {/* Subtle dot/mesh pattern overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.03)_1px,_transparent_0)] bg-[length:24px_24px]" />
                  </div>
                )}

                {/* Slide Content */}
                <div className="container-custom relative z-10 w-full text-left px-5 sm:px-12 md:px-16 flex flex-col justify-center h-full">
                  <div className="max-w-2xl text-white">
                    {/* Badge */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="mb-3 sm:mb-4 inline-block"
                    >
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border backdrop-blur-sm ${
                        isFallback ? (banner as any).badgeBg : 'bg-white/10 text-white border-white/20'
                      }`}>
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {isFallback ? (banner as any).badge : 'New Launch'}
                      </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3 sm:mb-5 leading-[1.15] [text-shadow:_0_2px_20px_rgba(0,0,0,0.3)]"
                    >
                      {banner.title}
                    </motion.h1>

                    {/* Subtitle */}
                    {banner.subtitle && (
                      <motion.p
                        initial={{ y: 25, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-sm sm:text-base md:text-lg text-white/80 mb-5 sm:mb-7 line-clamp-2 max-w-xl font-medium leading-relaxed"
                      >
                        {banner.subtitle}
                      </motion.p>
                    )}

                    {/* CTA Button */}
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <Button
                        size="lg"
                        className="rounded-full bg-white text-neutral-900 hover:bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-all duration-300 font-bold px-6 sm:px-8 py-5 sm:py-6 group text-sm sm:text-base border-0 hover:scale-[1.03] active:scale-95"
                        onClick={() => {
                          const url = banner.link_url || (isFallback ? (banner as any).link : '/products');
                          navigate(url);
                        }}
                      >
                        {isFallback ? (banner as any).ctaText : 'Shop Now'}
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Indicators/Dots */}
        {bannerList.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-5 left-0 right-0 z-20 flex justify-center gap-2">
            {bannerList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-400 ${
                  idx === currentSlide 
                    ? 'bg-white w-7 sm:w-8 shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
                    : 'bg-white/35 hover:bg-white/60 w-2'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Left/Right Arrows */}
        {bannerList.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerList.length) % bannerList.length)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/25 text-white/70 hover:text-white backdrop-blur-md border border-white/15 hover:border-white/30 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerList.length)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/25 text-white/70 hover:text-white backdrop-blur-md border border-white/15 hover:border-white/30 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}
      </div>

      {/* Brand Promises / USP Trust Grid */}
      <section className="py-4 sm:py-6 bg-card border-b border-border">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {/* Delivery card */}
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/40 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex-shrink-0 bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                <Truck className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-sm font-bold text-foreground">সারাদেশে ডেলিভারি</h4>
                <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">ঢাকা ৬০৳, ঢাকার বাইরে ১২০৳ (ক্যাশ অন ডেলিভারি)</p>
              </div>
            </div>

            {/* Original Products card */}
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/40 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex-shrink-0 bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                <Shield className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-sm font-bold text-foreground">১০০% কোয়ালিটি পণ্য</h4>
                <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">আমাদের নিজস্ব কারিগর দ্বারা নিখুঁত ফিনিশিংয়ে তৈরি</p>
              </div>
            </div>

            {/* Returns card */}
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/40 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex-shrink-0 bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                <RotateCcw className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-sm font-bold text-foreground">৭ দিনের রিটার্ন</h4>
                <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">যেকোনো সাইজ বা কালার সহজেই পরিবর্তনযোগ্য</p>
              </div>
            </div>

            {/* Customer Helpline card */}
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/40 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex-shrink-0 bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                <Phone className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-sm font-bold text-foreground">কাস্টমার হেল্পলাইন</h4>
                <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">কল করুন: <span className="font-bold text-primary">01995909243</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      {displayProducts.length > 0 && (
        <section className="py-6 sm:py-8 bg-gradient-to-b from-red-500/5 to-transparent relative overflow-hidden">
          <div className="container-custom">
            <div className="bg-card border border-red-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider animate-pulse shadow-sm shadow-red-500/20">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Flash Sale</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-lg md:text-2xl font-black text-foreground">আজকের ধামাকা অফার!</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">স্টক ফুরিয়ে যাওয়ার আগেই অর্ডার করুন (আজ রাত ১২টা পর্যন্ত)</p>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">শেষ হতে বাকি:</span>
                  <div className="flex items-center gap-1">
                    <div className="flex flex-col items-center">
                      <div className="bg-red-500 text-white font-mono font-bold text-xs sm:text-sm px-2 py-0.5 rounded shadow-sm w-7 sm:w-9 text-center">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] text-muted-foreground mt-0.5 uppercase font-semibold">Hours</span>
                    </div>
                    <span className="font-bold text-red-500 animate-pulse text-sm">:</span>
                    <div className="flex flex-col items-center">
                      <div className="bg-red-500 text-white font-mono font-bold text-xs sm:text-sm px-2 py-0.5 rounded shadow-sm w-7 sm:w-9 text-center">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] text-muted-foreground mt-0.5 uppercase font-semibold">Min</span>
                    </div>
                    <span className="font-bold text-red-500 animate-pulse text-sm">:</span>
                    <div className="flex flex-col items-center">
                      <div className="bg-red-500 text-white font-mono font-bold text-xs sm:text-sm px-2 py-0.5 rounded shadow-sm w-7 sm:w-9 text-center">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] text-muted-foreground mt-0.5 uppercase font-semibold">Sec</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products in Flash Sale */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {displayProducts.slice(0, 4).map((product, index) => {
                  const remainingStock = (product.id.charCodeAt(0) % 6) + 3;
                  const percentSold = 100 - Math.round((remainingStock / 30) * 100);
                  const isDiscounted = product.original_price && product.original_price > product.price;

                  return (
                    <div
                      key={product.id}
                      className="bg-background rounded-xl sm:rounded-2xl overflow-hidden border border-border/80 hover:border-red-200 hover:shadow-md transition-all duration-300 flex flex-col group relative"
                    >
                      {/* Product Image */}
                      <div 
                        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/product/${product.slug}`)}
                      >
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                          <Badge className="bg-red-500 text-white hover:bg-red-500 border-none font-bold text-[9px] px-1.5 py-0.25">
                            🔥 {percentSold}% Sold
                          </Badge>
                          {isDiscounted && (
                            <Badge className="bg-amber-500 text-white hover:bg-amber-500 border-none font-bold text-[9px] px-1.5 py-0.25">
                              SAVE ৳{(product.original_price! - product.price).toLocaleString()}
                            </Badge>
                          )}
                        </div>

                        {/* Floating actions */}
                        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="w-7 h-7 rounded-full bg-white/95 hover:bg-white shadow-md text-muted-foreground hover:text-red-500"
                            onClick={(e) => handleToggleWishlist(product, e)}
                          >
                            <Heart className={`h-3.5 w-3.5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      {/* Info & Urgency Progress Bar */}
                      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 
                            className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 cursor-pointer hover:text-primary transition-colors mb-1.5 min-h-[2rem] sm:min-h-[2.25rem] leading-tight"
                            onClick={() => navigate(`/product/${product.slug}`)}
                          >
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs sm:text-base font-black text-red-500">{formatPrice(product.price)}</span>
                            {product.original_price && (
                              <span className="text-[9px] sm:text-xs text-muted-foreground line-through">
                                {formatPrice(product.original_price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-1">
                          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-muted-foreground mb-1">
                            <span>স্টক সীমিত: {remainingStock}টি বাকি</span>
                            <span className="text-red-500">{percentSold}% বিক্রি হয়েছে</span>
                          </div>
                          <div className="w-full h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500"
                              style={{ width: `${percentSold}%` }}
                            />
                          </div>

                          {/* Quick Buy Button */}
                          <Button
                            size="sm"
                            className="w-full mt-2.5 rounded-lg sm:rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] sm:text-xs py-3 sm:py-4 flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                            onClick={() => navigate(`/product/${product.slug}`)}
                          >
                            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            এখনই কিনুন
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Floating Support & Chat Helpline */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[90] flex flex-col gap-2.5 items-end">
        {/* Call Helpline */}
        <a 
          href="tel:+8801995909243"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 group border border-blue-500/20"
          title="কল করুন হেল্পলাইনে"
        >
          <Phone className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-white" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-[10px] sm:text-xs font-bold whitespace-nowrap px-0 group-hover:px-1.5">
            হেল্পলাইন কল
          </span>
        </a>
        
        {/* WhatsApp Chat */}
        <a 
          href="https://wa.me/8801995909243" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 group border border-emerald-500/20 relative"
          title="হোয়াটসঅ্যাপে চ্যাট করুন"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />
          <MessageCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-white relative z-10" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-[10px] sm:text-xs font-bold whitespace-nowrap px-0 group-hover:px-1.5 relative z-10">
            WhatsApp চ্যাট
          </span>
        </a>
      </div>

      {/* Categories Section */}
      <section className="py-6 md:py-16 bg-muted/20 relative overflow-hidden">
        {/* Background decorative accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10">
          {/* Section Header - Mobile Optimized */}
          <div className="flex items-center justify-between mb-5 md:mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1 w-5 bg-primary rounded-full animate-pulse" />
                <span className="text-primary font-bold text-[10px] md:text-xs tracking-widest uppercase">Exploring</span>
              </div>
              <h2 className="text-lg md:text-4xl font-extrabold tracking-tight text-foreground">
                Shop By <span className="text-primary relative inline-block">Category<span className="absolute bottom-0.5 md:bottom-1.5 left-0 w-full h-1 md:h-1.5 bg-primary/20 -z-10 rounded-full" /></span>
              </h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/products')} 
              className="text-muted-foreground hover:text-primary text-xs md:text-sm font-semibold flex items-center gap-0.5 group px-2"
            >
              View All 
              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Desktop: Carousel with nav arrows */}
          <div className="hidden md:block">
            <div className="flex items-center justify-end gap-1.5 mb-4">
              <div className="flex items-center gap-1.5 bg-background p-1 rounded-full border border-border shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted hover:text-primary transition-colors disabled:opacity-30"
                  disabled={!canScrollPrev}
                  onClick={() => carouselApi?.scrollPrev()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted hover:text-primary transition-colors disabled:opacity-30"
                  disabled={!canScrollNext}
                  onClick={() => carouselApi?.scrollNext()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {categories.map((category) => {
                  const categoryImage = category.image_url || category.productImage;
                  
                  return (
                    <CarouselItem 
                      key={category.id} 
                      className="pl-4 basis-1/3 lg:basis-1/4"
                    >
                      <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3 }}
                        className="group cursor-pointer h-full"
                        onClick={() => navigate(`/products?category=${category.slug}`)}
                      >
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group-hover:shadow-xl transition-all duration-300 border border-border bg-card">
                          {categoryImage ? (
                            <img 
                              src={categoryImage} 
                              alt={category.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <ShoppingBag className="w-10 h-10 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-2 border border-white/10 rounded-xl pointer-events-none group-hover:border-white/30 transition-all duration-300" />
                          <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center z-10">
                            <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-primary transition-colors drop-shadow-md">
                              {category.name}
                            </h3>
                            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-primary/90 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                              <span>Explore Category</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Mobile: Circular category icons in horizontal scroll */}
          <div className="md:hidden">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {categories.map((category, index) => {
                const categoryImage = category.image_url || category.productImage;
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="flex flex-col items-center gap-2 snap-start flex-shrink-0 cursor-pointer group"
                    style={{ minWidth: '76px' }}
                    onClick={() => navigate(`/products?category=${category.slug}`)}
                  >
                    {/* Circular Image with Gradient Ring */}
                    <div className="relative">
                      <div className="w-[72px] h-[72px] rounded-full p-[2.5px] bg-gradient-to-br from-primary via-primary/60 to-primary/30 shadow-md group-active:scale-95 transition-transform duration-200">
                        <div className="w-full h-full rounded-full overflow-hidden bg-card border-2 border-background">
                          {categoryImage ? (
                            <img 
                              src={categoryImage} 
                              alt={category.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Category Name */}
                    <span className="text-[11px] font-semibold text-foreground text-center leading-tight line-clamp-2 w-full px-0.5">
                      {category.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Products - Recent Products */}
      {recentProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-background">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-primary font-medium text-sm tracking-wider uppercase">New Upload</span>
                <h2 className="text-2xl md:text-3xl font-bold mt-1">
                  Recent <span className="text-primary">Products</span>
                </h2>
              </div>
              <Button variant="outline" onClick={() => navigate('/products')} className="rounded-full">
                View All <ChevronRight className="ml-1 w-4 h-4" />
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
                        src={product.images?.[0]}
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
                          New
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
                    <div className="p-3.5 sm:p-4 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 mb-2 min-h-[2.5rem] leading-snug group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="text-sm sm:text-base font-black text-primary">{formatPrice(product.price)}</span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-xl text-xs font-bold py-3.5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1 mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.slug}`);
                        }}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        বিস্তারিত দেখুন
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Best Selling Section */}
      {displayProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-primary font-medium text-sm tracking-wider uppercase">Best Selling</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">
                Popular <span className="text-primary">Products</span>
              </h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/products')} className="rounded-full">
              View All <ChevronRight className="ml-1 w-4 h-4" />
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
                      src={product.images?.[0]}
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
                        New
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
                  <div className="p-3.5 sm:p-4 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground mb-2 line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      

                      {/* Price */}
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <span className="text-sm sm:text-base font-black text-primary">{formatPrice(product.price)}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-xl text-xs font-bold py-3.5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1 mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.slug}`);
                      }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      বিস্তারিত দেখুন
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {displayNewArrivals.length > 0 && (
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-primary font-medium text-sm tracking-wider uppercase">New Collection</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">
                New <span className="text-primary">Arrivals</span>
              </h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/products')} className="rounded-full">
              View All <ChevronRight className="ml-1 w-4 h-4" />
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
                className="group cursor-pointer bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                onClick={() => product.slug && navigate(`/product/${product.slug}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    New
                  </Badge>

                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/90 hover:bg-white w-8 h-8"
                    onClick={(e) => handleToggleWishlist(product, e)}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-destructive text-destructive' : ''}`} />
                  </Button>
                </div>

                <div className="p-3.5 sm:p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1 mb-1.5 leading-snug group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="text-sm sm:text-base font-black text-primary">{formatPrice(product.price)}</span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-xl text-xs font-bold py-3.5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${product.slug}`);
                    }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    বিস্তারিত দেখুন
                  </Button>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

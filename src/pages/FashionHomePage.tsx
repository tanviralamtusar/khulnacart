import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Heart, ChevronRight, ChevronLeft,
  ArrowRight, Eye, Phone, MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectWishlistItems, toggleWishlist } from '@/store/slices/wishlistSlice';
import { toast } from 'sonner';
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

interface HomePageContent {
  [key: string]: any;
}

export default function FashionHomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [carouselApi, categories.length]);

  const wishlistItems = useAppSelector(selectWishlistItems);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: categoriesData },
          { data: featuredData },
          { data: newData },
          { data: recentData },
        ] = await Promise.all([
          supabase.from('categories').select('*').order('sort_order', { ascending: true }),
          supabase.from('products').select('*').eq('is_featured', true).eq('is_active', true).limit(8),
          supabase.from('products').select('*').eq('is_new', true).eq('is_active', true).limit(8),
          supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
        ]);

        if (categoriesData) {
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
    return `৳${price.toLocaleString('en-BD')}`;
  };

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : recentProducts;
  const displayNewArrivals = newArrivals;

  const getDiscount = (price: number, originalPrice: number | null): number | null => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

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

          {/* Unified Carousel for Desktop & Mobile */}
          <div className="relative">
            {/* Desktop Navigation Controls */}
            <div className="hidden md:flex items-center justify-end gap-1.5 mb-4">
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
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 md:-ml-4">
                {categories.map((category) => {
                  const categoryImage = category.image_url || category.productImage;
                  
                  return (
                    <CarouselItem 
                      key={category.id} 
                      className="pl-3 md:pl-4 basis-1/4 md:basis-1/3 lg:basis-1/4"
                    >
                      {/* Desktop Rectangular Card */}
                      <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3 }}
                        className="hidden md:block group cursor-pointer h-full"
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

                      {/* Mobile Circular Slide */}
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="md:hidden flex flex-col items-center gap-2 cursor-pointer group py-1"
                        onClick={() => navigate(`/products?category=${category.slug}`)}
                      >
                        <div className="relative">
                          {/* Animated/Glowing gradient ring with lucrative visual cues */}
                          <div className="w-[70px] h-[70px] xs:w-[76px] xs:h-[76px] rounded-full p-[2.5px] bg-gradient-to-tr from-primary via-rose-500 to-amber-500 shadow-md group-active:scale-95 transition-transform duration-200">
                            <div className="w-full h-full rounded-full overflow-hidden bg-card border-2 border-background">
                              {categoryImage ? (
                                <img 
                                  src={categoryImage} 
                                  alt={category.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <ShoppingBag className="w-5 h-5 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Title text */}
                        <span className="text-[10px] font-bold text-foreground text-center leading-tight line-clamp-1 w-full px-0.5">
                          {category.name}
                        </span>
                      </motion.div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
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
                    <div className="relative aspect-[3/4] overflow-hidden bg-white p-2 sm:p-4">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
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
                        View Details
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

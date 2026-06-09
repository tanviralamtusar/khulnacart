import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  CheckCircle2,
  Star,
  MessageSquare,
  User
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import ProductCard from '@/components/products/ProductCard';
import { fetchProductBySlug, fetchProducts } from '@/services/productService';
import { Product, ProductVariation } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, openCart } from '@/store/slices/cartSlice';
import { toggleWishlist, selectWishlistItems } from '@/store/slices/wishlistSlice';
import { toast } from 'sonner';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { useServerTracking } from '@/hooks/useServerTracking';
import { useSEO } from '@/hooks/useSEO';
import { supabase } from '@/integrations/supabase/client';
import BackButton from '@/components/ui/BackButton';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  is_verified: boolean;
  created_at: string;
  profile?: { full_name: string | null };
}

const ProductDetailPage = () => {
  const { '*': slug } = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Group variations by option types
  const variationGroups = useMemo(() => {
    if (!product?.variations) return {};
    
    const groups: Record<string, string[]> = {};
    
    product.variations.forEach(v => {
      if (v.option1_name && v.option1_value) {
        if (!groups[v.option1_name]) groups[v.option1_name] = [];
        if (!groups[v.option1_name].includes(v.option1_value)) {
          groups[v.option1_name].push(v.option1_value);
        }
      }
      if (v.option2_name && v.option2_value) {
        if (!groups[v.option2_name]) groups[v.option2_name] = [];
        if (!groups[v.option2_name].includes(v.option2_value)) {
          groups[v.option2_name].push(v.option2_value);
        }
      }
    });
    
    return groups;
  }, [product?.variations]);

  // Update selected variation based on selected options
  useEffect(() => {
    if (!product?.variations) return;
    
    const optionNames = Object.keys(variationGroups);
    if (optionNames.length === 0) return;

    const match = product.variations.find(v => {
      const opt1Name = v.option1_name;
      const opt2Name = v.option2_name;
      
      const match1 = !opt1Name || selectedOptions[opt1Name] === v.option1_value;
      const match2 = !opt2Name || selectedOptions[opt2Name] === v.option2_value;
      
      return match1 && match2;
    });
    
    if (match) {
      setSelectedVariation(match);
    } else {
      setSelectedVariation(undefined);
    }
  }, [selectedOptions, product?.variations, variationGroups]);

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [purchaseCheckLoading, setPurchaseCheckLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(selectWishlistItems);
  const { trackViewContent, trackAddToCartWithEventId, generateEventId, isReady } = useFacebookPixel();
  const { trackAddToCart: trackServerAddToCart, trackViewContent: trackServerViewContent } = useServerTracking();

  // Update SEO tags
  useSEO({
    title: product?.name,
    description: product?.short_description || product?.long_description?.substring(0, 160),
    image: product?.images?.[0],
    type: 'product'
  });

  // Fetch social media settings for Call Now and Messenger buttons
  const { data: socialSettings } = useQuery({
    queryKey: ["product-social-settings"],
    queryFn: async () => {
      const keys = ["messenger_enabled", "messenger_page_id", "call_enabled", "call_number"];
      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", keys);

      if (error) throw error;

      const result = {
        messenger_enabled: false,
        messenger_page_id: "",
        call_enabled: false,
        call_number: "",
      };

      data?.forEach((item) => {
        if (item.key === "messenger_enabled") result.messenger_enabled = item.value === "true";
        if (item.key === "messenger_page_id") result.messenger_page_id = item.value;
        if (item.key === "call_enabled") result.call_enabled = item.value === "true";
        if (item.key === "call_number") result.call_number = item.value;
      });

      return result;
    },
    staleTime: 1000 * 60 * 5,
  });

  const isInWishlist = product ? wishlistItems.some((item) => item.id === product.id) : false;
  const hasVariations = product?.variations && product.variations.length > 0;

  // Track ViewContent when product loads - both browser pixel and CAPI
  useEffect(() => {
    if (product && isReady) {
      console.log('Firing ViewContent for product:', product.name);
      
      // Browser pixel
      trackViewContent({
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'BDT',
      });
      
      // Server-side CAPI
      trackServerViewContent({
        contentId: product.id,
        contentName: product.name,
        value: product.price,
        currency: 'BDT',
      });
    }
  }, [product, isReady, trackViewContent, trackServerViewContent]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const [productData, allProducts] = await Promise.all([
          fetchProductBySlug(slug),
          fetchProducts(),
        ]);
        setProduct(productData);
        // Do NOT auto-select variation - customer should select manually
        setSelectedVariation(undefined);
        if (productData) {
          setRelatedProducts(
            allProducts
              .filter((p) => p.category === productData.category && p.id !== productData.id)
              .slice(0, 4)
          );
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-40 pb-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-40 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => `৳${price.toLocaleString('en-BD')}`;
  
  // Get display price based on selected variation or base product
  const displayPrice = selectedVariation?.price ?? product.price;
  const displayOriginalPrice = selectedVariation?.original_price ?? product.originalPrice;
  const discountAmount = displayOriginalPrice ? displayOriginalPrice - displayPrice : 0;
  const currentStock = selectedVariation?.stock ?? product.stock;

  const handleAddToCart = () => {
    if (hasVariations && !selectedVariation) {
      toast.error('Please select a variation');
      return;
    }
    
    dispatch(addToCart({ product, quantity, variation: selectedVariation }));
    dispatch(openCart());
    // Track AddToCart event - both browser pixel and server CAPI
    const eventId = generateEventId('AddToCart');
    console.log('Firing AddToCart for product:', product.name, 'eventId:', eventId);
    
    // Browser pixel
    trackAddToCartWithEventId({
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: displayPrice * quantity,
      currency: 'BDT',
    }, eventId);
    
    // Server-side CAPI (runs in parallel)
    trackServerAddToCart({
      contentId: product.id,
      contentName: product.name,
      value: displayPrice * quantity,
      quantity: quantity,
      currency: 'BDT',
    });
    
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (hasVariations && !selectedVariation) {
      toast.error('Please select a variation');
      return;
    }
    
    dispatch(addToCart({ product, quantity, variation: selectedVariation }));
    
    // Track AddToCart event - both browser pixel and server CAPI
    const eventId = generateEventId('AddToCart');
    console.log('Firing AddToCart (Buy Now) for product:', product.name, 'eventId:', eventId);
    
    // Browser pixel
    trackAddToCartWithEventId({
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: displayPrice * quantity,
      currency: 'BDT',
    }, eventId);
    
    // Server-side CAPI (runs in parallel)
    trackServerAddToCart({
      contentId: product.id,
      contentName: product.name,
      value: displayPrice * quantity,
      quantity: quantity,
      currency: 'BDT',
    });
    
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product));
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const handleCallNow = () => {
    if (socialSettings?.call_number) {
      window.location.href = `tel:${socialSettings.call_number}`;
    }
  };

  const handleMessenger = () => {
    if (socialSettings?.messenger_page_id) {
      const link = socialSettings.messenger_page_id.trim();
      const url = link.startsWith("http") ? link : `https://${link}`;
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-16 bg-background">
        <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li className="text-muted-foreground/50">›</li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Products</Link></li>
            <li className="text-muted-foreground/50">›</li>
            <li className="text-foreground truncate max-w-[200px]">{product.name}</li>
          </ol>
          <BackButton fallbackPath="/products" className="mt-2" />
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white p-4 sm:p-6 mb-4 border border-border">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => 
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-md"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => 
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-md"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails - Horizontal Scroll Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-5"
          >
            {/* Title with Share Icons */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleToggleWishlist}
                className={`flex-shrink-0 ${isInWishlist ? 'text-secondary' : 'text-muted-foreground hover:text-secondary'}`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* SKU */}
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">SKU:</span> {product.id.slice(0, 8).toUpperCase()}
            </p>

            {/* Variation Selector */}
            {hasVariations && (
              <div className="space-y-4">
                {Object.keys(variationGroups).length > 0 ? (
                  // Multi-variation rendering
                  Object.entries(variationGroups).map(([groupName, values]) => (
                    <div key={groupName} className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {groupName} Select Option: <span className="font-semibold text-foreground">{selectedOptions[groupName] || ''}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => (
                          <button
                            key={value}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [groupName]: value }))}
                            className={`min-w-[60px] px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                              selectedOptions[groupName] === value
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border bg-background text-foreground hover:border-foreground'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  // Legacy/Single variation rendering
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Select Option: <span className="font-semibold text-foreground">{selectedVariation?.name || ''}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.variations!.map((variation) => (
                        <button
                          key={variation.id}
                          onClick={() => setSelectedVariation(variation)}
                          className={`min-w-[60px] px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                            selectedVariation?.id === variation.id
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border bg-background text-foreground hover:border-foreground'
                          }`}
                        >
                          {variation.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price Section */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">PRICE:</span>
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(displayPrice)}
              </span>
              {displayOriginalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(displayOriginalPrice)}
                  </span>
                  <Badge className="bg-[#6B8E23] hover:bg-[#556B2F] text-white border-0 px-2 py-0.5 text-xs">
                    {discountAmount} ৳ off
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">STATUS:</span>
              <span className={`font-bold ${currentStock > 0 ? 'text-[#6B8E23]' : 'text-destructive'}`}>
                {currentStock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Stock Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className={`h-5 w-5 ${currentStock > 0 ? 'text-[#6B8E23]' : 'text-destructive'}`} />
              <span className="font-medium">
                {currentStock > 0 ? `Stock: ${currentStock} পিস বাকি আছে` : 'Stock: স্টক শেষ'}
              </span>
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                variant="outline"
                size="lg" 
                className="w-full h-12 font-semibold border-2 border-foreground text-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
                onClick={handleAddToCart}
                disabled={currentStock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button 
                size="lg" 
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold"
                onClick={handleBuyNow}
                disabled={currentStock === 0}
              >
                Buy Now
              </Button>
            </div>

            {/* Call Now Button */}
            {socialSettings?.call_enabled && socialSettings?.call_number && (
              <Button 
                size="lg" 
                className="w-full h-12 bg-[#6B8E23] hover:bg-[#556B2F] text-white font-semibold"
                onClick={handleCallNow}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now: {socialSettings.call_number}
              </Button>
            )}

            {/* Messenger Button */}
            {socialSettings?.messenger_enabled && socialSettings?.messenger_page_id && (
              <Button 
                variant="outline"
                size="lg" 
                className="w-full h-12 bg-background border-2 border-foreground hover:bg-muted font-semibold"
                onClick={handleMessenger}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-[#0084FF]">
                  <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.27.57l.05 1.78c.02.59.61.98 1.17.78l1.99-.8c.17-.07.36-.08.53-.04.9.24 1.87.37 2.85.37 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm5.89 7.65l-2.83 4.47c-.44.7-1.36.89-2.03.42l-2.25-1.68c-.2-.15-.47-.15-.66 0l-3.04 2.3c-.4.31-.94-.15-.67-.58l2.83-4.47c.44-.7 1.36-.89 2.03-.42l2.25 1.68c.2.15.47.15.66 0l3.04-2.3c.4-.31.94.15.67.58z"/>
                </svg>
                Messenger Order
              </Button>
            )}

          </motion.div>
        </div>

        {/* Product Description Tabs - Only show if long_description exists */}
        {product.long_description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 mb-6">
                <TabsTrigger 
                  value="description" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-base font-medium text-muted-foreground data-[state=active]:text-primary"
                >
                  Product Description
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-0">
                <div className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 rounded-r-lg p-6">
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                    {product.long_description}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* Customer Reviews Section */}
        <ReviewsSection 
          product={product}
          reviews={reviews}
          setReviews={setReviews}
          user={user}
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          reviewHover={reviewHover}
          setReviewHover={setReviewHover}
          submittingReview={submittingReview}
          setSubmittingReview={setSubmittingReview}
          userHasReviewed={userHasReviewed}
          setUserHasReviewed={setUserHasReviewed}
          userHasPurchased={userHasPurchased}
          setUserHasPurchased={setUserHasPurchased}
          purchaseCheckLoading={purchaseCheckLoading}
          setPurchaseCheckLoading={setPurchaseCheckLoading}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl font-display font-bold text-foreground mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
              ))}
            </div>
          </section>
        )}
        </div>
      </div>
    </>
  );
};

// ============ Reviews Section Component ============
interface ReviewsSectionProps {
  product: Product;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  user: any;
  reviewRating: number;
  setReviewRating: React.Dispatch<React.SetStateAction<number>>;
  reviewComment: string;
  setReviewComment: React.Dispatch<React.SetStateAction<string>>;
  reviewHover: number;
  setReviewHover: React.Dispatch<React.SetStateAction<number>>;
  submittingReview: boolean;
  setSubmittingReview: React.Dispatch<React.SetStateAction<boolean>>;
  userHasReviewed: boolean;
  setUserHasReviewed: React.Dispatch<React.SetStateAction<boolean>>;
  userHasPurchased: boolean;
  setUserHasPurchased: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseCheckLoading: boolean;
  setPurchaseCheckLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

function ReviewsSection({
  product, reviews, setReviews, user,
  reviewRating, setReviewRating, reviewComment, setReviewComment,
  reviewHover, setReviewHover, submittingReview, setSubmittingReview,
  userHasReviewed, setUserHasReviewed,
  userHasPurchased, setUserHasPurchased, purchaseCheckLoading, setPurchaseCheckLoading
}: ReviewsSectionProps) {
  const navigate = useNavigate();

  // Fetch reviews for this product
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Fetch profile names for reviewers
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const profileMap: Record<string, string> = {};
        profiles?.forEach(p => { profileMap[p.user_id] = p.full_name || 'Customer'; });

        const enriched = data.map(r => ({
          ...r,
          profile: { full_name: profileMap[r.user_id] || 'Customer' }
        }));
        setReviews(enriched);

        // Check if current user already reviewed
        if (user) {
          setUserHasReviewed(data.some(r => r.user_id === user.id));
        }
      }
    };
    fetchReviews();
  }, [product.id, user]);

  useEffect(() => {
    const checkPurchasedProduct = async () => {
      setUserHasPurchased(false);

      if (!user) return;

      setPurchaseCheckLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_items!inner(id)')
        .eq('user_id', user.id)
        .eq('order_items.product_id', product.id)
        .or('status.eq.delivered,payment_status.eq.paid')
        .limit(1);

      if (error) {
        console.error('Purchase verification error:', error);
        setUserHasPurchased(false);
      } else {
        setUserHasPurchased((data?.length || 0) > 0);
      }

      setPurchaseCheckLoading(false);
    };

    checkPurchasedProduct();
  }, [product.id, user, setPurchaseCheckLoading, setUserHasPurchased]);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) 
    : 0;

  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('অনুগ্রহ করে রিভিউ লিখুন');
      return;
    }

    if (!userHasPurchased) {
      toast.error('Only customers who purchased this product can submit a review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: product.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
          is_verified: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Get profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      setReviews(prev => [{
        ...data,
        profile: { full_name: profile?.full_name || 'Customer' }
      }, ...prev]);
      setReviewComment('');
      setReviewRating(5);
      setUserHasReviewed(true);
      toast.success('রিভিউ সফলভাবে জমা হয়েছে! ধন্যবাদ।');
    } catch (err) {
      console.error('Review submission error:', err);
      toast.error('রিভিউ জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-12"
    >
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
        {/* Header with average rating */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Customer Reviews
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({reviews.length}টি রিভিউ)</span>
              </div>
            )}
          </div>
        </div>

        {/* Write Review Form */}
        {!userHasReviewed && user && !purchaseCheckLoading && !userHasPurchased && (
          <div className="mb-8 p-5 bg-muted/30 border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">
              Only customers who purchased this product can submit a review.
            </p>
          </div>
        )}

        {!userHasReviewed && (!user || userHasPurchased) && (
          <div className="mb-8 p-5 bg-muted/30 border border-border rounded-xl">
            <h3 className="font-semibold text-foreground mb-4">আপনার মতামত দিন</h3>
            
            {/* Star Rating Selector */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-muted-foreground font-medium">রেটিং:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-6 h-6 transition-colors ${
                        star <= (reviewHover || reviewRating) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-muted-foreground/30 hover:text-amber-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviewRating}/5)</span>
            </div>

            {/* Comment */}
            <Textarea
              placeholder={user ? 'আপনার অভিজ্ঞতা শেয়ার করুন...' : 'রিভিউ দিতে লগইন করুন'}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="mb-3 resize-none"
              disabled={!user}
            />

            <Button
              onClick={handleSubmitReview}
              disabled={submittingReview || (!user && false)}
              className="font-semibold"
            >
              {submittingReview ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> জমা হচ্ছে...</>
              ) : user ? (
                'রিভিউ জমা দিন'
              ) : (
                'লগইন করুন'
              )}
            </Button>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">এখনো কোনো রিভিউ নেই। প্রথম রিভিউটি আপনি দিন!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map(review => (
              <div key={review.id} className="flex gap-4 p-4 bg-background rounded-xl border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">
                        {review.customer_name || review.profile?.full_name || 'Customer'}
                      </span>
                      {review.is_verified && (
                        <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded font-medium">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} 
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProductDetailPage;

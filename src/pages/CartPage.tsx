import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag, Tag, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackButton from '@/components/ui/BackButton';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  selectCartItems, 
  selectCartTotal,
  removeFromCart,
  updateQuantity,
  clearCart
} from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AppliedCoupon {
  code: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  calculatedDiscount: number;
}

const CartPage = () => {
  const cartItems = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const dispatch = useAppDispatch();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('applied_coupon');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let discount = 0;
        if (parsed.discount_type === 'percentage') {
          discount = Math.round((total * parsed.discount_value) / 100);
          if (parsed.max_discount_amount && discount > parsed.max_discount_amount) {
            discount = parsed.max_discount_amount;
          }
        } else {
          discount = parsed.discount_value;
        }
        if (discount > total) {
          discount = total;
        }
        
        setAppliedCoupon({
          ...parsed,
          calculatedDiscount: discount
        });
      } catch (e) {
        console.error('Error loading coupon:', e);
      }
    }
  }, [total]);

  const formatPrice = (price: number) => `৳${price.toLocaleString('en-BD')}`;

  const shippingCost = 49;
  const couponDiscount = appliedCoupon?.calculatedDiscount || 0;
  const grandTotal = total + shippingCost - couponDiscount;

  const handleRemove = (productId: string, variationId?: string) => {
    dispatch(removeFromCart({ productId, variationId }));
    toast.success('Item removed from cart');
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error('কুপন কোড লিখুন');
      return;
    }

    setCouponLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        toast.error('ভুল কুপন কোড! এই কুপন পাওয়া যায়নি।');
        return;
      }

      // Check date validity
      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        toast.error('এই কুপনটি এখনও শুরু হয়নি।');
        return;
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        toast.error('এই কুপনের মেয়াদ শেষ হয়ে গেছে।');
        return;
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        toast.error('এই কুপনের ব্যবহার সীমা পূর্ণ হয়ে গেছে।');
        return;
      }

      // Check minimum order amount
      if (coupon.min_order_amount && total < coupon.min_order_amount) {
        toast.error(`সর্বনিম্ন ${formatPrice(coupon.min_order_amount)} অর্ডারে এই কুপন প্রযোজ্য।`);
        return;
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = Math.round((total * coupon.discount_value) / 100);
        if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
          discount = coupon.max_discount_amount;
        }
      } else {
        // fixed amount
        discount = coupon.discount_value;
      }

      // Don't let discount exceed total
      if (discount > total) {
        discount = total;
      }

      const couponData = {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        max_discount_amount: coupon.max_discount_amount == null ? null : Number(coupon.max_discount_amount),
        calculatedDiscount: discount,
      };

      setAppliedCoupon(couponData);
      localStorage.setItem('applied_coupon', JSON.stringify(couponData));

      toast.success(`কুপন "${coupon.code}" সফলভাবে প্রয়োগ হয়েছে! ${formatPrice(discount)} ছাড় পাচ্ছেন।`);
    } catch (err) {
      console.error('Coupon validation error:', err);
      toast.error('কুপন যাচাই করতে সমস্যা হয়েছে।');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    localStorage.removeItem('applied_coupon');
    toast.info('কুপন সরিয়ে দেওয়া হয়েছে।');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-40 pb-16 bg-background">
        <div className="container-custom">
          <BackButton fallbackPath="/" className="mb-4 pl-0" />
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground">
              You have {cartItems.length} items in your cart
            </p>
          </div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-muted-foreground mb-6">
              You haven't added any products yet
            </p>
            <Button asChild>
              <Link to="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start Shopping
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => {
                const itemKey = item.variation?.id ? `${item.product.id}-${item.variation.id}` : item.product.id;
                const displayPrice = item.variation?.price ?? item.product.price;
                const originalPrice = item.variation?.original_price ?? item.product.originalPrice;
                
                return (
                  <motion.div
                    key={itemKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                  >
                    <Link to={`/product/${item.product.slug}`} className="shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.slug}`}>
                        <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      {item.variation && (
                        <p className="text-sm font-medium text-primary mt-0.5">
                          {item.variation.name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.product.category}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(displayPrice)}
                        </span>
                        {originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                        <div className="flex items-center border border-border rounded-lg w-fit">
                          <button
                            onClick={() => dispatch(updateQuantity({ 
                              productId: item.product.id,
                              variationId: item.variation?.id,
                              quantity: item.quantity - 1 
                            }))}
                            className="p-2 hover:bg-muted transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => dispatch(updateQuantity({ 
                              productId: item.product.id,
                              variationId: item.variation?.id,
                              quantity: item.quantity + 1 
                            }))}
                            className="p-2 hover:bg-muted transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <span className="font-semibold text-foreground">
                            {formatPrice(displayPrice * item.quantity)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.product.id, item.variation?.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between pt-4">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link to="/products">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    dispatch(clearCart());
                    setAppliedCoupon(null);
                    setCouponCode('');
                    toast.success('Cart cleared');
                  }}
                  className="text-destructive hover:text-destructive w-full sm:w-auto"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-44">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Order Summary
                </h2>

                {/* Coupon Code Input */}
                <div className="mb-6 pb-5 border-b border-border">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-2">
                    <Tag className="h-4 w-4 text-primary" />
                    কুপন কোড
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <div>
                          <span className="font-bold text-green-700 dark:text-green-400 text-sm">{appliedCoupon.code}</span>
                          <p className="text-[10px] text-green-600 dark:text-green-500">
                            {appliedCoupon.discount_type === 'percentage' 
                              ? `${appliedCoupon.discount_value}% ছাড়` 
                              : `${formatPrice(appliedCoupon.discount_value)} ছাড়`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-green-700 hover:text-destructive hover:bg-destructive/10"
                        onClick={handleRemoveCoupon}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="কুপন কোড লিখুন"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="text-sm font-mono uppercase tracking-wider"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 shrink-0 font-semibold"
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pb-6 border-b border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping (Khulna City)</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between py-6 text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>

                <Button variant="cta" size="lg" className="w-full" asChild>
                  <Link to="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Shipping fee may vary based on delivery zone at checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <Footer />
  </>
  );
};

export default CartPage;

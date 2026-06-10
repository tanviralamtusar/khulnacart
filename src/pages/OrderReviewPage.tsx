import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, Star, MessageSquare, ChevronRight, Home } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  slug?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  user_id: string | null;
  order_items: OrderItem[];
}

const OrderReviewPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (user && orderNumber) {
      fetchOrderDetails();
    }
  }, [user, authLoading, orderNumber, navigate]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // First find the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          user_id,
          order_items (
            id,
            product_id,
            product_name,
            product_image
          )
        `)
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (orderError) throw orderError;

      if (!orderData) {
        setError('Order not found');
        return;
      }

      // Check if order belongs to user
      if (orderData.user_id !== user?.id) {
        setError('You do not have permission to review this order');
        return;
      }

      // Check if order is delivered
      if (orderData.status !== 'delivered' && orderData.status !== 'completed') {
        setError('Reviews can only be left for delivered orders');
      }

      // Fetch slugs for products
      const productIds = orderData.order_items.map((item: any) => item.product_id);
      const { data: products } = await supabase
        .from('products')
        .select('id, slug')
        .in('id', productIds);

      const slugMap: Record<string, string> = {};
      products?.forEach(p => { slugMap[p.id] = p.slug; });

      const enrichedOrder = {
        ...orderData,
        order_items: orderData.order_items.map((item: any) => ({
          ...item,
          slug: slugMap[item.product_id] || ''
        }))
      };

      setOrder(enrichedOrder as Order);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 pt-32 pb-16">
        <div className="container max-w-2xl mx-auto px-4">
          {error ? (
            <Card className="text-center p-8">
              <CardContent className="space-y-4 pt-6">
                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
                  <Package className="h-8 w-8" />
                </div>
                <h1 className="text-xl font-bold">{error}</h1>
                <p className="text-muted-foreground">We couldn't process your review request at this time.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button asChild variant="outline">
                    <Link to="/my-account">My Account</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/">Go to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : order && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Review Your Items</h1>
                <p className="text-muted-foreground">Order #{order.order_number}</p>
                <p className="text-sm">Please select an item below to leave your feedback</p>
              </div>

              <div className="grid gap-4">
                {order.order_items.map((item) => (
                  <Link 
                    key={item.id} 
                    to={`/product/${item.slug}#reviews`}
                    className="block group"
                  >
                    <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                      <div className="flex items-center p-4 gap-4">
                        <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {item.product_image ? (
                            <img 
                              src={item.product_image} 
                              alt={item.product_name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{item.product_name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-4 h-4 text-muted-foreground/30" />
                            ))}
                            <span className="text-xs text-muted-foreground ml-2">Click to rate</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="pt-8 text-center">
                <Button variant="ghost" asChild className="text-muted-foreground">
                  <Link to="/my-account" className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Back to My Account
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderReviewPage;

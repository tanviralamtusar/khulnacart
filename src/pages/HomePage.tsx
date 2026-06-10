import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Truck, Shield, Heart, Check, Star, Loader2, Apple, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { fetchFeaturedProducts, fetchNewProducts, fetchRecentProducts } from '@/services/productService';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import whyChooseBg from '@/assets/why-choose-bg.png';
// Khejur related images removed

// Features data for hero overlay cards
const heroFeatures = [
  { icon: Leaf, title: 'Pure & Natural' },
  { icon: Apple, title: 'Fresh & Delicious' },
  { icon: Heart, title: 'Full of Nutrition' },
  { icon: Truck, title: 'Fast Delivery' },
];

interface HomePageContent {
  hero?: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    badgeTitle: string;
    badgeSubtitle: string;
  };
  about?: {
    tagline: string;
    title: string;
    badge1: string;
    badge2: string;
    paragraph1: string;
    paragraph2: string;
    quote: string;
    experienceYears: string;
    experienceText: string;
  };
  promo_banners?: {
    banner1: {
      image: string;
      tagline: string;
      title: string;
      subtitle: string;
      buttonText: string;
    };
    banner2: {
      image: string;
      tagline: string;
      title: string;
      subtitle: string;
      buttonText: string;
    };
  };
  featured_products?: {
    tagline: string;
    title: string;
    buttonText: string;
  };
  why_choose_us?: {
    tagline: string;
    title: string;
  };
  testimonials?: {
    tagline: string;
    title: string;
    items: Array<{
      name: string;
      location: string;
      text: string;
    }>;
  };
  features?: {
    items: Array<{
      title: string;
      description: string;
    }>;
  };
}

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<HomePageContent>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, newArrivals, recent, contentData] = await Promise.all([
          fetchFeaturedProducts(),
          fetchNewProducts(),
          fetchRecentProducts(8),
          supabase.from('home_page_content').select('*'),
        ]);
        setFeaturedProducts(featured);
        setNewProducts(newArrivals);
        setRecentProducts(recent);
        
        if (contentData.data) {
          const contentMap: HomePageContent = {};
          contentData.data.forEach((item: any) => {
            contentMap[item.section_key as keyof HomePageContent] = item.content;
          });
          setContent(contentMap);
        }
      } catch (error) {
        console.error('Failed to load home page data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Default values
  const hero = content.hero || {
    title: 'Pure Products, Directly',
    subtitle: 'At Your Doorstep.',
    description: 'Collect the best items of the season — fresh and full of natural flavor.',
    buttonText: 'Order Now',
    badgeTitle: '100% Organic',
    badgeSubtitle: 'Pure & Fresh',
  };

  const about = content.about || {
    tagline: 'We sell what we eat.',
    title: 'About Us',
    badge1: 'Fresh & Pure Products',
    badge2: 'Fast Nationwide Delivery',
    paragraph1: 'We believe quality items are not just products — they are a symbol of tradition, nutrition, and blessing. Our journey started from this belief.',
    paragraph2: 'Our goal is simple — to deliver the best quality products to the people of Bangladesh, which will be fresh, pure, and affordable.',
    quote: 'We sell what we eat. Trust, quality, and satisfaction are our true identities.',
    experienceYears: '30+',
    experienceText: 'Years of Experience',
  };

  const promoBanners = content.promo_banners || {
    banner1: {
      image: '/images/promo-bag.png',
      tagline: '100% Organic',
      title: '100% Natural',
      subtitle: 'Best Quality Items',
      buttonText: 'Buy Now',
    },
    banner2: {
      image: '/images/promo-boxes.png',
      tagline: '100% Organic',
      title: 'Daily Healthy &',
      subtitle: 'Nutritious Food',
      buttonText: 'Buy Now',
    },
  };

  const featuredSection = content.featured_products || {
    tagline: 'Our Products',
    title: 'Hand-picked Items Directly from the Farm',
    buttonText: 'View All Products',
  };

  const whyChooseUs = content.why_choose_us || {
    tagline: 'Why Choose Our Products?',
    title: 'Thousands of people are choosing us for the quality and freshness of our items.',
  };

  const testimonials = content.testimonials?.items || [
    {
      name: 'Touhidul Haque',
      location: 'Narayanganj',
      text: "I've been cheated buying items online before, but here I got completely fresh and authentic products. Now I only buy from here.",
    },
    {
      name: 'Shamim Ahmed',
      location: 'Chittagong',
      text: 'Packaging is great. The quality of the products shows they were well-preserved.',
    },
    {
      name: 'Rubina Islam',
      location: 'Dhaka',
      text: 'The items were so fresh and high quality. Perfect for daily needs.',
    },
  ];

  const features = content.features?.items || [
    { title: 'Fresh & Premium Quality Items', description: 'Each item is picked with care' },
    { title: 'Direct Collection from Trusted Source', description: 'Products are collected directly from the source' },
    { title: 'Clean & Safe Packaging', description: 'Products are packed in a hygienic way' },
    { title: 'Affordable & Fair Price', description: 'We provide quality products at a fair price' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-36 md:pt-40">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-muted via-background to-muted">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative">
                <div className="w-full max-w-lg mx-auto aspect-square bg-muted/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
                  <Leaf className="h-16 w-16 text-primary/30" />
                </div>
                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Leaf className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{hero.badgeTitle}</p>
                      <p className="text-xs text-muted-foreground">{hero.badgeSubtitle}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2 text-center lg:text-right"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-secondary leading-tight mb-6">
                {hero.title}
                <br />
                <span className="text-foreground">{hero.subtitle}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl ml-auto">
                {hero.description}
              </p>
              <Button variant="default" size="lg" asChild className="text-base px-8 bg-secondary hover:bg-secondary/90">
                <Link to="/products">
                  {hero.buttonText}
                  <ArrowRight className="h-5 w-5 mr-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 bg-card border-y border-border">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Products - সাম্প্রতিক প্রোডাক্ট */}
      {recentProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-12"
            >
              <div>
                <span className="text-secondary font-medium">New Arrival</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
                  Recent Products
                </h2>
              </div>
              <Button variant="outline" size="lg" asChild>
                <Link to="/products">
                  View All
                  <ArrowRight className="h-5 w-5 mr-2" />
                </Link>
              </Button>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recentProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="w-full max-w-md mx-auto aspect-square bg-muted/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-border shadow-xl">
                 <Heart className="h-16 w-16 text-primary/30" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg">
                <p className="text-3xl font-bold">{about.experienceYears}</p>
                <p className="text-sm opacity-90">{about.experienceText}</p>
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-secondary font-medium">{about.tagline}</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2 mb-6">
                {about.title}
              </h2>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Check className="h-4 w-4" /> {about.badge1}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Check className="h-4 w-4" /> {about.badge2}
                </span>
              </div>

              <p className="text-muted-foreground mb-4">
                {about.paragraph1}
              </p>
              <p className="text-muted-foreground mb-6">
                {about.paragraph2}
              </p>

              <p className="text-sm font-medium text-foreground italic border-r-4 border-primary pr-4">
                {about.quote}
              </p>

              <Button variant="secondary" size="lg" className="mt-6 rounded-full" asChild>
                <Link to="/products">
                  Learn More
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Promotional Banners - Side by Side */}
      <section className="py-12 bg-muted/30">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Banner 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden group"
            >
              <img
                src={promoBanners.banner1.image}
                alt="Organic Dates"
                className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-foreground/70 to-foreground/30" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-right">
                <span className="text-accent font-medium text-sm">{promoBanners.banner1.tagline}</span>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mt-2 mb-4">
                  {promoBanners.banner1.title}<br />{promoBanners.banner1.subtitle}
                </h3>
                <div>
                  <Button variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full" asChild>
                    <Link to="/products">{promoBanners.banner1.buttonText}</Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Banner 2 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden group"
            >
              <img
                src={promoBanners.banner2.image}
                alt="Daily Health"
                className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-foreground/70 to-foreground/30" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-right">
                <span className="text-accent font-medium text-sm">{promoBanners.banner2.tagline}</span>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mt-2 mb-4">
                  {promoBanners.banner2.title}<br />{promoBanners.banner2.subtitle}
                </h3>
                <div>
                  <Button variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full" asChild>
                    <Link to="/products">{promoBanners.banner2.buttonText}</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <span className="text-secondary font-medium">{featuredSection.tagline}</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
                {featuredSection.title}
              </h2>
            </div>
            <Button variant="outline" size="lg" asChild>
              <Link to="/products">
                {featuredSection.buttonText}
                <ArrowRight className="h-5 w-5 mr-2" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Full Width Background Image Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${whyChooseBg})`,
          }}
        />
        <div className="absolute inset-0 bg-foreground/60" />

        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-accent font-medium">{whyChooseUs.tagline}</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mt-2 mb-8 leading-tight">
                {whyChooseUs.title}
              </h2>
            </motion.div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {heroFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-primary p-6 rounded-xl text-center"
                >
                  <div className="w-14 h-14 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-3">
                    <feature.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h4 className="font-semibold text-primary-foreground text-sm">{feature.title}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-secondary/5">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-secondary font-medium">{content.testimonials?.tagline || 'Customer Experience'}</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
              {content.testimonials?.title || 'Satisfaction with Our Products'}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Read what customers are feeling after trying our products. Freshness, taste, and service—these are most important to us.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-2xl border border-border shadow-md"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Order Today
          </h2>
          <p className="text-secondary-foreground/80 mb-8 max-w-md mx-auto">
            Order now to get pure and fresh products. Fast delivery nationwide.
          </p>
          <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90" asChild>
            <Link to="/products">
              Buy Now
              <ArrowRight className="h-5 w-5 mr-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

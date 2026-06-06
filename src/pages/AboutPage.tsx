import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Truck, RefreshCw, MessageCircle, Users, Sparkles, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackButton from '@/components/ui/BackButton';
import { useSEO } from '@/hooks/useSEO';

const AboutPage = () => {
  useSEO({
    title: 'About Us',
    description: 'Learn more about KhulnaCart, your favorite online shop committed to fashion and trust.'
  });
  const features = [
    {
      icon: ShieldCheck,
      title: '100% Authentic Products',
      description: 'We ensure the quality of every product and reject counterfeit items.'
    },
    {
      icon: Sparkles,
      title: 'Best Offers',
      description: 'Check our regular discounts to get the best products at affordable prices.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Your products are delivered within the shortest possible time after ordering.'
    },
    {
      icon: RefreshCw,
      title: 'Easy Return',
      description: 'If there is any defect in the product, you can easily return or exchange it.'
    }
  ];

  const goals = [
    {
      icon: Heart,
      title: 'Customer Satisfaction',
      description: 'Customer satisfaction is at the center of our every activity.'
    },
    {
      icon: Users,
      title: 'A Large Community',
      description: 'We believe that it is possible to grow by moving forward with everyone, not alone.'
    },
    {
      icon: ShieldCheck,
      title: 'Safe Shopping',
      description: 'It is our responsibility to ensure the security of your information and transactions.'
    }
  ];

  return (
    <>
      <Header />
      <div className="pt-32 pb-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container-custom relative z-10">
            <BackButton fallbackPath="/" className="mb-6 pl-0" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-8 border border-primary/20"
              >
                ✨ About Us
              </motion.span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-8 leading-tight">
                KhulnaCart: A Modern Digital
                <span className="block text-primary mt-2">Destination for Fashion & Trust</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Our mission is to deliver the best quality products from Khulna to all over Bangladesh.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Story Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
                  Our Mission & Vision
                </h2>
                
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    <span className="text-primary font-semibold">KhulnaCart</span> is an emerging e-commerce platform committed to making customers' lives easier and more enjoyable. We believe that shopping is not just a necessity, but an experience.
                  </p>
                  
                  <p>
                    Each of our products is selected with great care, so that you get the <span className="text-primary font-semibold">best quality and durability</span>. We collect products directly from manufacturers and reliable distributors, which helps us provide the best products at competitive prices.
                  </p>
                </div>
              </motion.div>

              {/* Highlight Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 md:p-12 border border-primary/10 mb-16"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                    Easy & Reliable Shopping Experience
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                    We don't just sell products, we want to build a long-lasting relationship with our customers—
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <span className="px-5 py-3 bg-primary text-primary-foreground rounded-full font-medium">
                      Nationwide Home Delivery
                    </span>
                    <span className="px-5 py-3 bg-accent text-accent-foreground rounded-full font-medium">
                      Easy Return Policy
                    </span>
                    <span className="px-5 py-3 bg-secondary text-secondary-foreground rounded-full font-medium">
                      24/7 Customer Support
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                🌟 Why are we special?
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Our Features
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border group hover:border-primary/30 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="py-20">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 bg-accent/10 text-accent-foreground rounded-full text-sm font-medium mb-4">
                🎯 Our Goal
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Not just selling products—
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {goals.map((goal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <goal.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {goal.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {goal.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Keep your shopping safe with KhulnaCart
              </h2>
              <p className="text-xl opacity-90 mb-8 leading-relaxed max-w-2xl mx-auto">
                Enjoy the best shopping experience by connecting with us. We are always committed to respecting your trust.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">Inbox us for any questions or orders</span>
                </div>
              </div>
              
              <div className="inline-block px-8 py-5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                <p className="text-xl font-display">
                  🤝 Stay with us—<span className="font-bold">on the path of style and trust</span>
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;

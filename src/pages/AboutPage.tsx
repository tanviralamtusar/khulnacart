import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Truck, RefreshCw, MessageCircle, Users, Sparkles, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const AboutPage = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'শতভাগ খাঁটি পণ্য',
      description: 'আমরা প্রতিটি পণ্যের গুণগত মান নিশ্চিত করি এবং নকল পণ্য বর্জন করি।'
    },
    {
      icon: Sparkles,
      title: 'সেরা অফার',
      description: 'সাশ্রয়ী মূল্যে সেরা পণ্য পেতে আমাদের নিয়মিত ডিসকাউন্ট চেক করুন।'
    },
    {
      icon: Truck,
      title: 'দ্রুত ডেলিভারি',
      description: 'অর্ডার করার পর দ্রুততম সময়ের মধ্যে আপনার পণ্য পৌঁছে দেওয়া হয়।'
    },
    {
      icon: RefreshCw,
      title: 'সহজ রিটার্ন',
      description: 'পণ্যে কোনো ত্রুটি থাকলে খুব সহজেই রিটার্ন বা এক্সচেঞ্জ করতে পারবেন।'
    }
  ];

  const goals = [
    {
      icon: Heart,
      title: 'গ্রাহক সন্তুষ্টি',
      description: 'আমাদের প্রতিটি কার্যক্রমের কেন্দ্রে থাকে গ্রাহকদের সন্তুষ্টি।'
    },
    {
      icon: Users,
      title: 'একটি বড় কমিউনিটি',
      description: 'আমরা বিশ্বাস করি একা নয়, সবাইকে নিয়ে এগিয়ে যাওয়ার মাধ্যমে বড় হওয়া সম্ভব।'
    },
    {
      icon: ShieldCheck,
      title: 'নিরাপদ শপিং',
      description: 'আপনার তথ্য এবং লেনদেনের নিরাপত্তা নিশ্চিত করা আমাদের দায়িত্ব।'
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
                ✨ আমাদের সম্পর্কে
              </motion.span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-8 leading-tight">
                খুলনা কার্ট: ফ্যাশন ও বিশ্বাসের
                <span className="block text-primary mt-2">একটি আধুনিক ডিজিটাল ঠিকানা</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                খুলনা থেকে সারা বাংলাদেশে সেরা মানের পণ্য পৌঁছে দেওয়াই আমাদের লক্ষ্য।
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
                  আমাদের লক্ষ্য ও উদ্দেশ্য
                </h2>
                
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    <span className="text-primary font-semibold">খুলনা কার্ট</span> একটি উদীয়মান ই-কমার্স প্ল্যাটফর্ম যা গ্রাহকদের জীবনযাত্রাকে সহজ এবং আনন্দদায়ক করতে প্রতিশ্রুতিবদ্ধ। আমরা বিশ্বাস করি কেনাকাটা শুধুমাত্র প্রয়োজন নয়, বরং এটি একটি অভিজ্ঞতা।
                  </p>
                  
                  <p>
                    আমাদের প্রতিটি পণ্য অত্যন্ত যত্ন সহকারে নির্বাচন করা হয়, যেন আপনি পান <span className="text-primary font-semibold">সেরা গুণমান এবং স্থায়িত্ব</span>। আমরা সরাসরি উৎপাদনকারী এবং নির্ভরযোগ্য ডিস্ট্রিবিউটরদের থেকে পণ্য সংগ্রহ করি, যা আমাদের প্রতিযোগিতামূলক মূল্যে সেরা পণ্য সরবরাহ করতে সাহায্য করে।
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
                    সহজ ও নির্ভরযোগ্য শপিং অভিজ্ঞতা
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                    আমরা শুধু পণ্য বিক্রি করি না, আমরা গ্রাহকদের সাথে একটি দীর্ঘস্থায়ী সম্পর্ক তৈরি করতে চাই—
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <span className="px-5 py-3 bg-primary text-primary-foreground rounded-full font-medium">
                      সারাদেশে হোম ডেলিভারি
                    </span>
                    <span className="px-5 py-3 bg-accent text-accent-foreground rounded-full font-medium">
                      সহজ রিটার্ন পলিসি
                    </span>
                    <span className="px-5 py-3 bg-secondary text-secondary-foreground rounded-full font-medium">
                      ২৪/৭ কাস্টমার সাপোর্ট
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
                🌟 কেন আমরা বিশেষ?
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                আমাদের বৈশিষ্ট্য
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
                🎯 আমাদের লক্ষ্য
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                শুধু পণ্য বিক্রি করা নয়—
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
                খুলনা কার্টের সাথে আপনার কেনাকাটা হোক নিরাপদ
              </h2>
              <p className="text-xl opacity-90 mb-8 leading-relaxed max-w-2xl mx-auto">
                আমাদের সাথে যুক্ত হয়ে সেরা শপিং অভিজ্ঞতা উপভোগ করুন। আমরা আপনার আস্থার মর্যাদা দিতে সর্বদা সচেষ্ট।
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">যেকোনো প্রশ্ন বা অর্ডারের জন্য ইনবক্স করুন</span>
                </div>
              </div>
              
              <div className="inline-block px-8 py-5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                <p className="text-xl font-display">
                  🤝 আমাদের সাথে থাকুন—<span className="font-bold">স্টাইল আর বিশ্বাসের পথে</span>
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Send, MessageCircle, Truck, Users, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error('Name and message are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          message: formData.message.trim(),
        });

      if (error) throw error;

      toast.success('Your message has been sent!');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: MapPin,
      title: 'Address',
      content: 'Khulna',
      subContent: 'Khulna, Bangladesh',
      color: 'from-red-500 to-rose-600'
    },
    {
      icon: Phone,
      title: 'Mobile / WhatsApp',
      content: '+8801838636425',
      subContent: '10 AM – 10 PM',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Facebook,
      title: 'Facebook Inbox',
      content: 'Message our page',
      subContent: 'Our team will reply quickly',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Clock,
      title: 'Service Hours',
      content: '10 AM - 10 PM',
      subContent: 'Everyday',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  const features = [
    {
      icon: Truck,
      title: 'Delivery',
      description: (
        <div className="space-y-2">
          <p>Cash on Delivery, bkash, Nagad, Rocket</p>
          <p className="font-medium">Delivery area (Inside khulna, Same day delivery)</p>
          <p className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-sm">
            Flat TK 20 off on Online payment (bkash, ngd, rckt) *On Minimum payment (200 Tk)
          </p>
        </div>
      ),
      color: 'bg-orange-500/10 text-orange-600'
    }
  ];

  return (
    <>
      <Header />
      <div className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                📞 Contact Us
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We are always by your side. Contact us for any questions or orders.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 transition-all shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <div className="text-muted-foreground">
                        {feature.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Quick Actions */}
        <section className="py-12">
          <div className="container-custom">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-6"
              >
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Quick Contact
                </h2>

                {/* WhatsApp Button */}
                <a
                  href="https://wa.me/message/7ZV4YUG5ACVGD1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:shadow-xl hover:shadow-green-500/20 transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block font-bold text-lg">Message on WhatsApp</span>
                    <span className="text-white/80 text-sm">+8801838636425</span>
                  </div>
                </a>

                {/* Call Button */}
                <a
                  href="tel:+8801838636425"
                  className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/20 transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-lg">Call Us Directly</span>
                    <span className="text-white/80 text-sm">10 AM – 10 PM</span>
                  </div>
                </a>

                {/* Facebook Button */}
                <a
                  href="https://www.facebook.com/profile.php?id=61589114327578"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-violet-500/20 transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-lg">Facebook Inbox</span>
                    <span className="text-white/80 text-sm">Get a quick reply</span>
                  </div>
                </a>

                {/* Map or Address Card */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Our Location</h3>
                  </div>
                  <p className="text-muted-foreground">
                    <br />
                    Khulna, Bangladesh
                  </p>
                </div>
              </motion.div>

               {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3"
              >
                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    Send a Message
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Fill out the form for any questions or order details
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Your Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your name"
                          className="h-12"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone Number
                        </label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="01XXX-XXXXXX"
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Message *
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Write your message here..."
                        rows={5}
                        required
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full h-12" disabled={isSubmitting}>
                      <Send className="w-5 h-5 mr-2" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;

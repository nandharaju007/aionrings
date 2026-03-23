import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartPanel } from '@/components/CartPanel';
import ringProduct from '@/assets/ring-product.jpg';
import ringHero from '@/assets/ring-hero.jpg';

const sizes = ['6', '7', '8', '9', '10', '11', '12', '13'];
const finishes = ['Midnight Black', 'Titanium Silver'];

const whatsIncluded = [
  'aiOn Ring',
  'Wireless Charging Case',
  'USB-C Charging Cable',
  'Sizing Guide',
];

export default function ShopPage() {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>(finishes[0]);
  const [showSizingGuide, setShowSizingGuide] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!selectedSize) return;
    
    addItem({
      id: 'aion-ring',
      name: 'aiOn Ring',
      price: 399,
      size: selectedSize,
      finish: selectedFinish,
      image: ringProduct,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartPanel />

      <main className="pt-20">
        {/* Hero Video/Image */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <img
            src={ringHero}
            alt="aiOn Ring"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </section>

        {/* Product Details */}
        <section className="container mx-auto px-6 lg:px-12 py-16">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-square rounded-3xl overflow-hidden bg-card">
                <img
                  src={ringProduct}
                  alt="aiOn Ring Product"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail strip */}
              <div className="flex gap-4 mt-6">
                {[ringProduct, ringHero].map((img, i) => (
                  <button
                    key={i}
                    className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-caption uppercase tracking-widest text-primary">
                The Ring
              </span>
              
              <h1 className="text-4xl md:text-5xl font-extralight mt-2 mb-4">
                aiOn Ring
              </h1>

              <p className="text-body mb-8">
                The full circle of health intelligence. Continuous awareness, 
                effortless comfort, endless insights.
              </p>

              {/* Excitement Block */}
              <div className="card-glass p-8 rounded-2xl mb-8 text-center">
                <p className="text-2xl font-extralight text-foreground mb-2">
                  Something extraordinary is coming
                </p>
                <p className="text-body mb-6">
                  The future of health intelligence — crafted for your finger, designed for your life.
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm text-primary font-light tracking-wide">Launching Soon</span>
                </div>
              </div>

              {/* Teaser Highlights */}
              <div className="grid grid-cols-3 gap-6 text-center mb-10">
                <div>
                  <p className="text-2xl font-light text-foreground">7</p>
                  <p className="text-caption">Days Battery</p>
                </div>
                <div>
                  <p className="text-2xl font-light text-foreground">4g</p>
                  <p className="text-caption">Featherlight</p>
                </div>
                <div>
                  <p className="text-2xl font-light text-foreground">100m</p>
                  <p className="text-caption">Water Resistant</p>
                </div>
              </div>

              {/* What's Included */}
              <div className="border-t border-border pt-8">
                <h3 className="font-light mb-4">What's Included</h3>
                <ul className="space-y-3">
                  {whatsIncluded.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's Included */}
              <div className="border-t border-border pt-8">
                <h3 className="font-light mb-4">What's Included</h3>
                <ul className="space-y-3">
                  {whatsIncluded.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Highlights */}
              <div className="border-t border-border pt-8 mt-8">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-light text-foreground">7</p>
                    <p className="text-caption">Days Battery</p>
                  </div>
                  <div>
                    <p className="text-2xl font-light text-foreground">4g</p>
                    <p className="text-caption">Featherlight</p>
                  </div>
                  <div>
                    <p className="text-2xl font-light text-foreground">100m</p>
                    <p className="text-caption">Water Resistant</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

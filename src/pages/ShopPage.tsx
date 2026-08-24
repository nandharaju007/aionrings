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
    <div className="min-h-screen bg-canvas">
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
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-canvas" />
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
              <div className="aspect-square surface-card overflow-hidden">
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
                    className="w-20 h-20 rounded-xl overflow-hidden border border-border hover:border-primary transition-colors bg-white shadow-sm"
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
              <span className="eyebrow">
                The Ring
              </span>
              
              <h1 className="text-4xl md:text-5xl font-extralight mt-2 mb-4 text-ink">
                aiOn Ring
              </h1>

              <p className="text-ink-soft mb-8 leading-relaxed">
                The full circle of everyday wellness. Continuous awareness,
                effortless comfort, endless insight into your habits.
              </p>

              {/* Excitement Block */}
              <div className="surface-card p-8 mb-8 text-center bg-white">
                <p className="text-2xl font-extralight text-ink mb-2">
                  Something extraordinary is coming
                </p>
                <p className="text-ink-soft mb-6">
                  The future of everyday wellness — crafted for your finger, designed for your life.
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm text-primary font-medium tracking-wide">Launching Soon</span>
                </div>
              </div>

              {/* Teaser Highlights */}
              <div className="grid grid-cols-3 gap-6 text-center mb-10">
                <div>
                  <p className="text-2xl font-light text-ink">7</p>
                  <p className="text-[11px] uppercase tracking-wider text-ink-muted">Days Battery</p>
                </div>
                <div>
                  <p className="text-2xl font-light text-ink">4g</p>
                  <p className="text-[11px] uppercase tracking-wider text-ink-muted">Featherlight</p>
                </div>
                <div>
                  <p className="text-2xl font-light text-ink">100m</p>
                  <p className="text-[11px] uppercase tracking-wider text-ink-muted">Water Resistant</p>
                </div>
              </div>

              {/* What's Included */}
              <div className="border-t border-border pt-8 mt-8">
                <h3 className="font-light mb-4 text-ink text-lg">What's Included</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {whatsIncluded.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-ink-soft">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-[15px]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

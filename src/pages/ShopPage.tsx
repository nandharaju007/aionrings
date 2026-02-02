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
              
              <p className="text-3xl font-light text-foreground mb-6">
                $399
              </p>
              
              <p className="text-body mb-8">
                The full circle of health intelligence. Continuous awareness, 
                effortless comfort, endless insights.
              </p>

              {/* Finish Selection */}
              <div className="mb-8">
                <label className="text-sm text-muted-foreground mb-3 block">
                  Finish
                </label>
                <div className="flex gap-3">
                  {finishes.map((finish) => (
                    <button
                      key={finish}
                      onClick={() => setSelectedFinish(finish)}
                      className={`px-6 py-3 rounded-full border transition-all ${
                        selectedFinish === finish
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-muted-foreground'
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-muted-foreground">Size</label>
                  <button
                    onClick={() => setShowSizingGuide(!showSizingGuide)}
                    className="text-sm text-primary hover:underline"
                  >
                    Sizing Guide
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-xl border transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-muted-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Sizing Guide */}
                {showSizingGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-6 rounded-xl bg-card border border-border"
                  >
                    <h3 className="font-light mb-3">Find Your Size</h3>
                    <p className="text-caption mb-4">
                      Measure the inner diameter of a ring that fits comfortably 
                      on your index finger. Match it to our sizing chart below.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-caption">
                      <div>Size 6: 16.5mm</div>
                      <div>Size 7: 17.3mm</div>
                      <div>Size 8: 18.1mm</div>
                      <div>Size 9: 19.0mm</div>
                      <div>Size 10: 19.8mm</div>
                      <div>Size 11: 20.6mm</div>
                      <div>Size 12: 21.4mm</div>
                      <div>Size 13: 22.2mm</div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Add to Cart */}
              <div className="space-y-4 mb-10">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className={`btn-primary w-full ${
                    !selectedSize ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {selectedSize ? 'Add to Cart' : 'Select a Size'}
                </button>
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

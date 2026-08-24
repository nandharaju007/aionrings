import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { CartPanel } from '@/components/CartPanel';
import { AionLogo } from '@/components/AionLogo';
import { SEO } from '@/components/SEO';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingData, setShippingData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    nameOnCard: '',
  });

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmation');
    clearCart();
  };

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-screen bg-canvas">
  <SEO
        title="Checkout — aiOn Smart Wellness Ring"
        description="Complete your aiOn smart wellness ring order securely."
        path="/checkout"
        image="/og-image.jpg"
        noindex
      />
        <Header />
        <CartPanel />
        <main className="pt-32 container mx-auto px-6 text-center">
          <h1 className="text-headline mb-6 text-ink">Your cart is empty</h1>
          <Link to="/shop" className="btn-brand">
            Shop aiOn Ring
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <SEO
        title="Checkout — aiOn Smart Wellness Ring"
        description="Complete your aiOn smart wellness ring order securely."
        path="/checkout"
        image="/og-image.jpg"
        noindex
      />
      <Header />
      <CartPanel />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
          {/* Back Link */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-ink-muted hover:text-ink transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to shop
          </Link>

          {step === 'confirmation' ? (
            <ConfirmationView />
          ) : (
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Form Section */}
              <div className="lg:col-span-3">
                {/* Progress */}
                <div className="flex items-center gap-4 mb-10">
                  <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-primary' : 'text-ink-muted'}`}>
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${step === 'shipping' ? 'border-primary bg-primary text-white' : 'border-border'}`}>1</span>
                    <span className="text-sm font-medium">Shipping</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-ink-muted'}`}>
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${step === 'payment' ? 'border-primary bg-primary text-white' : 'border-border'}`}>2</span>
                    <span className="text-sm font-medium">Payment</span>
                  </div>
                </div>

                {step === 'shipping' && (
                  <motion.form
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handleShippingSubmit}
                    className="space-y-6 surface-card p-8"
                  >
                    <h2 className="text-2xl font-light mb-6 text-ink">Shipping Information</h2>

                    <div>
                      <label className="text-sm text-ink-soft mb-2 block">Email</label>
                      <input
                        type="email"
                        required
                        value={shippingData.email}
                        onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                        className="input-luxury bg-white border-border text-ink"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-ink-soft mb-2 block">First Name</label>
                        <input
                          type="text"
                          required
                          value={shippingData.firstName}
                          onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                          className="input-luxury bg-white border-border text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink-soft mb-2 block">Last Name</label>
                        <input
                          type="text"
                          required
                          value={shippingData.lastName}
                          onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                          className="input-luxury bg-white border-border text-ink"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-ink-soft mb-2 block">Address</label>
                      <input
                        type="text"
                        required
                        value={shippingData.address}
                        onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                        className="input-luxury bg-white border-border text-ink"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-ink-soft mb-2 block">City</label>
                        <input
                          type="text"
                          required
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                          className="input-luxury bg-white border-border text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink-soft mb-2 block">Country</label>
                        <input
                          type="text"
                          required
                          value={shippingData.country}
                          onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                          className="input-luxury bg-white border-border text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink-soft mb-2 block">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={shippingData.postalCode}
                          onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                          className="input-luxury bg-white border-border text-ink"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-brand w-full mt-8">
                      Continue to Payment
                    </button>
                  </motion.form>
                )}

                {step === 'payment' && (
                  <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handlePaymentSubmit}
                    className="space-y-6 surface-card p-8"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <h2 className="text-2xl font-light text-ink">Payment</h2>
                      <Lock className="w-4 h-4 text-primary" />
                    </div>

                    <div>
                      <label className="text-sm text-ink-soft mb-2 block">Card Number</label>
                      <input
                        type="text"
                        required
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                        className="input-luxury bg-white border-border text-ink"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-ink-soft mb-2 block">Expiry</label>
                        <input
                          type="text"
                          required
                          value={paymentData.expiry}
                          onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                          className="input-luxury bg-white border-border text-ink"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink-soft mb-2 block">CVC</label>
                        <input
                          type="text"
                          required
                          value={paymentData.cvc}
                          onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })}
                          className="input-luxury bg-white border-border text-ink"
                          placeholder="123"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-ink-soft mb-2 block">Name on Card</label>
                      <input
                        type="text"
                        required
                        value={paymentData.nameOnCard}
                        onChange={(e) => setPaymentData({ ...paymentData, nameOnCard: e.target.value })}
                        className="input-luxury bg-white border-border text-ink"
                      />
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        type="button"
                        onClick={() => setStep('shipping')}
                        className="btn-secondary flex-1"
                      >
                        Back
                      </button>
                      <button type="submit" className="btn-brand flex-1">
                        Place Order
                      </button>
                    </div>

                    <p className="text-[12px] text-ink-muted text-center mt-6">
                      Your payment information is secured with 256-bit encryption.
                    </p>
                  </motion.form>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-2">
                <div className="surface-card p-6 sticky top-28 bg-white">
                  <h3 className="font-light text-lg mb-6 text-ink">Order Summary</h3>

                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-canvas-alt">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-ink font-medium">{item.name}</p>
                          <p className="text-[12px] text-ink-muted">
                            Size {item.size} · {item.finish}
                          </p>
                          <p className="text-[12px] text-ink-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-ink">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-soft">Subtotal</span>
                      <span className="text-ink font-medium">${totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-soft">Shipping</span>
                      <span className="text-primary font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-light pt-2 border-t border-border mt-2">
                      <span className="text-ink">Total</span>
                      <span className="text-ink font-semibold">${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ConfirmationView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto text-center py-16"
    >
      <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Check className="w-10 h-10 text-primary" />
      </div>
      
      <h1 className="text-headline mb-4 text-ink">Thank You</h1>
      <p className="text-ink-soft mb-8 leading-relaxed">
        Your order has been placed successfully. You'll receive a confirmation 
        email shortly with your order details and tracking information.
      </p>

      <div className="surface-card p-6 mb-8 text-left bg-white">
        <p className="text-[11px] uppercase tracking-wider text-ink-muted mb-2">Order Number</p>
        <p className="text-lg font-medium text-ink">#AION-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/" className="btn-secondary">
          Return Home
        </Link>
        <Link to="/shop" className="btn-brand">
          Continue Shopping
        </Link>
      </div>

      <div className="mt-16">
        <AionLogo width={100} className="mx-auto text-primary opacity-20" />
      </div>
    </motion.div>
  );
}

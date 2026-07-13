import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import ShopPage from "./pages/ShopPage";
import CheckoutPage from "./pages/CheckoutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import CISPolicyPage from "./pages/CISPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import AccessibilityPage from "./pages/AccessibilityPage";
import TrademarksPage from "./pages/TrademarksPage";
import PreOrderPage from "./pages/PreOrderPage";
import AdminReservationsPage from "./pages/AdminReservationsPage";
import PartnersPage from "./pages/PartnersPage";
import SupportPage from "./pages/SupportPage";
import { CookieConsent } from "./components/CookieConsent";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/preorder" element={<PreOrderPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/admin" element={<AdminReservationsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/cis-policy" element={<CISPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/trademarks" element={<TrademarksPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

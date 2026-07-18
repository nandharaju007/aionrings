import { Header } from '@/components/Header';
import { SEO } from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={"Terms of Service — aiOn"} description={"The terms that govern your use of the aiOn platform, ring, and companion services."} path="/terms-of-service" image="/og-policies.jpg" />
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-extralight mb-2">Terms of Service</h1>
            <p className="text-caption mb-12">Last updated: April 30, 2026</p>

            <div className="space-y-10 text-body">
              <section>
                <h2 className="text-xl font-light text-foreground mb-4">1. Agreement to Terms</h2>
                <p>
                  These Terms of Service ("Terms") govern your access to and use of the aiOn platform,
                  including the aiOn Ring wearable device, mobile and web applications, and related
                  services (collectively, the "Services") provided by Mazo Solutions Inc. ("Mazo," "we,"
                  "us," or "our"). By creating an account, purchasing a device, or using the Services,
                  you agree to be bound by these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">2. Eligibility</h2>
                <p>
                  You must be at least 18 years old (or the age of majority in your jurisdiction) to
                  create an account. By using the Services, you represent that the information you
                  provide is accurate and that you have the legal capacity to enter into this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">3. Medical Disclaimer</h2>
                <p>
                  aiOn is a wellness and lifestyle product. It is <strong>not a medical device</strong>
                  {' '}and is not intended to diagnose, treat, cure, or prevent any disease or medical
                  condition. Insights, scores, and recommendations are based on physiological signal
                  trends and should not be relied upon for medical decisions. Always consult a qualified
                  healthcare professional regarding any medical concerns.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">4. Account & Security</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials
                  and for all activity under your account. Notify us immediately at security@mazosolutions.com
                  of any unauthorized access. We reserve the right to suspend or terminate accounts that
                  violate these Terms or pose a security risk.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">5. Purchases, Shipping & Returns</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All prices are listed in USD unless otherwise indicated and exclude applicable taxes and shipping fees.</li>
                  <li>Orders are subject to availability and confirmation of the order price.</li>
                  <li>Eligible returns are accepted within 30 days of delivery, provided the device is in original condition. Hygiene-sensitive items may be excluded.</li>
                  <li>Refunds are issued to the original payment method within 7–14 business days of inspection.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">6. Limited Hardware Warranty</h2>
                <p>
                  The aiOn Ring is covered by a one (1) year limited warranty against manufacturing
                  defects from the date of delivery. The warranty does not cover damage caused by misuse,
                  accidents, unauthorized modification, or normal wear and tear.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">7. Subscription Services</h2>
                <p>
                  Certain features may require a paid subscription. Subscriptions automatically renew
                  until cancelled. You may cancel at any time through your account settings; cancellation
                  takes effect at the end of the current billing period. No partial refunds are issued
                  for unused subscription time except where required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">8. Intellectual Property</h2>
                <p>
                  All content, software, designs, trademarks, logos, and materials on the Services are
                  owned by Mazo Solutions Inc. or its licensors and are protected by copyright, trademark,
                  trade secret, and other intellectual property laws. You are granted a limited,
                  non-exclusive, non-transferable license to use the Services for personal, non-commercial
                  purposes only.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">9. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Reverse engineer, decompile, or disassemble the device, firmware, or software</li>
                  <li>Resell, sublicense, or commercially exploit the Services without written consent</li>
                  <li>Use the Services to violate any law or third-party right</li>
                  <li>Interfere with the security or integrity of the Services</li>
                  <li>Submit false, misleading, or another person's information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">10. User Content & Data License</h2>
                <p>
                  You retain ownership of your health data. By using the Services, you grant Mazo a
                  limited license to process your data solely to operate, improve, and personalize the
                  Services as described in our Privacy Policy. We will never sell your personal health
                  data to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">11. Disclaimers</h2>
                <p>
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                  EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                  PURPOSE, AND NON-INFRINGEMENT, EXCEPT AS EXPRESSLY SET FORTH IN THE LIMITED WARRANTY.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">12. Limitation of Liability</h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, MAZO SOLUTIONS INC. SHALL NOT BE LIABLE FOR ANY
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
                  PROFITS OR DATA, ARISING FROM YOUR USE OF THE SERVICES. OUR AGGREGATE LIABILITY SHALL
                  NOT EXCEED THE AMOUNT YOU PAID FOR THE PRODUCT IN THE 12 MONTHS PRECEDING THE CLAIM.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">13. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless Mazo Solutions Inc., its officers, directors,
                  employees, and affiliates from any claims arising out of your violation of these Terms
                  or misuse of the Services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">14. Governing Law & Dispute Resolution</h2>
                <p>
                  These Terms are governed by the laws of the State of Delaware, USA, without regard to
                  conflict-of-laws principles. Any disputes shall be resolved through binding arbitration
                  on an individual basis, except where prohibited by law. You waive the right to
                  participate in class actions to the fullest extent permitted.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">15. Changes to These Terms</h2>
                <p>
                  We may update these Terms from time to time. Material changes will be communicated via
                  email or in-app notification at least 30 days before they take effect. Continued use of
                  the Services after changes take effect constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">16. Contact</h2>
                <p>
                  Mazo Solutions Inc.<br />
                  Legal Department<br />
                  Email: legal@mazosolutions.com
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
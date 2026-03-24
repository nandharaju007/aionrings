import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-extralight mb-2">Cookie Policy</h1>
            <p className="text-caption mb-12">Last updated: March 24, 2026</p>

            <div className="space-y-10 text-body">
              <section>
                <h2 className="text-xl font-light text-foreground mb-4">1. What Are Cookies</h2>
                <p>
                  Cookies are small text files stored on your device when you visit a website or use an application. 
                  They help us recognize your device, remember your preferences, and improve your experience with 
                  the aiOn platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">2. Types of Cookies We Use</h2>
                
                <div className="space-y-6">
                  <div className="card-glass p-6">
                    <h3 className="text-lg font-light text-foreground mb-2">Essential Cookies</h3>
                    <p className="text-caption mb-2">Required for core functionality. Cannot be disabled.</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Authentication and session management</li>
                      <li>Security tokens and CSRF protection</li>
                      <li>Device pairing and connectivity state</li>
                      <li>User preference storage (language, units)</li>
                    </ul>
                  </div>

                  <div className="card-glass p-6">
                    <h3 className="text-lg font-light text-foreground mb-2">Analytical Cookies</h3>
                    <p className="text-caption mb-2">Help us understand how you use aiOn. Optional.</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Page visit frequency and navigation patterns</li>
                      <li>Feature usage metrics</li>
                      <li>Performance monitoring and error detection</li>
                      <li>A/B testing for product improvements</li>
                    </ul>
                  </div>

                  <div className="card-glass p-6">
                    <h3 className="text-lg font-light text-foreground mb-2">Functional Cookies</h3>
                    <p className="text-caption mb-2">Enhance your experience with personalized features. Optional.</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Dashboard layout and display preferences</li>
                      <li>Notification settings</li>
                      <li>Recently viewed wellness reports</li>
                      <li>Preferred data visualization formats</li>
                    </ul>
                  </div>

                  <div className="card-glass p-6">
                    <h3 className="text-lg font-light text-foreground mb-2">Marketing Cookies</h3>
                    <p className="text-caption mb-2">Used to deliver relevant content. Optional and off by default.</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Campaign effectiveness measurement</li>
                      <li>Referral source tracking</li>
                      <li>Interest-based content recommendations</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">3. Third-Party Cookies</h2>
                <p className="mb-4">
                  We may use cookies from trusted third-party services for analytics and platform improvement:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-foreground">Analytics providers:</strong> To measure platform usage and performance</li>
                  <li><strong className="text-foreground">Security services:</strong> To detect and prevent fraudulent activity</li>
                  <li><strong className="text-foreground">Infrastructure providers:</strong> For content delivery and load balancing</li>
                </ul>
                <p className="mt-4">
                  We do not allow third-party advertising cookies. No biometric or health data is ever shared 
                  through cookies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">4. Cookie Duration</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-foreground">Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong className="text-foreground">Persistent Cookies:</strong> Remain for up to 12 months or until you delete them</li>
                  <li><strong className="text-foreground">Authentication Cookies:</strong> Valid for the duration of your login session (maximum 30 days)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">5. Managing Your Cookie Preferences</h2>
                <p className="mb-4">You have full control over cookies:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-foreground">In-App Settings:</strong> Manage cookie categories directly within the aiOn app settings</li>
                  <li><strong className="text-foreground">Browser Controls:</strong> Configure your browser to block or delete cookies</li>
                  <li><strong className="text-foreground">Opt-Out:</strong> Disable non-essential cookies at any time without affecting core functionality</li>
                </ul>
                <p className="mt-4 text-caption">
                  Note: Disabling essential cookies may prevent certain features from functioning properly.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">6. Local Storage & Similar Technologies</h2>
                <p>
                  In addition to cookies, aiOn may use local storage and IndexedDB to store wellness data 
                  locally on your device as part of our local-first architecture. This data never leaves your 
                  device unless you explicitly enable cloud synchronization.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">7. Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy to reflect changes in our practices or for regulatory compliance. 
                  We will notify you of material changes through the aiOn platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">8. Contact</h2>
                <p>
                  For questions about our use of cookies, contact us at:
                </p>
                <p className="mt-2 text-foreground">
                  Mazo Solutions Inc.<br />
                  Email: <a href="mailto:privacy@mazosolutions.com" className="text-primary hover:underline">privacy@mazosolutions.com</a>
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

export default CookiePolicyPage;

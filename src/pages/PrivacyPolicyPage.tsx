import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';

const PrivacyPolicyPage = () => {
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
            <h1 className="text-3xl md:text-4xl font-extralight mb-2">Privacy Policy</h1>
            <p className="text-caption mb-12">Last updated: March 24, 2026</p>

            <div className="space-y-10 text-body">
              <section>
                <h2 className="text-xl font-light text-foreground mb-4">1. Introduction</h2>
                <p>
                  Mazo Solutions Inc. ("we," "us," or "our") operates the aiOn platform, including the aiOn Ring 
                  wearable device and accompanying applications. This Privacy Policy describes how we collect, use, 
                  store, and protect your personal and health-related information when you use our products and services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">2. Information We Collect</h2>
                
                <h3 className="text-lg font-light text-foreground/90 mb-2 mt-6">2.1 Biometric & Physiological Signals</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Heart rate and heart rate variability (HRV)</li>
                  <li>Blood oxygen saturation (SpO2)</li>
                  <li>Skin temperature variations</li>
                  <li>Sleep patterns and stages</li>
                  <li>Activity and movement data</li>
                  <li>Stress and recovery signals</li>
                </ul>

                <h3 className="text-lg font-light text-foreground/90 mb-2 mt-6">2.2 Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name and email address</li>
                  <li>Age, gender, and physical profile (height, weight)</li>
                  <li>Account credentials (encrypted)</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="text-lg font-light text-foreground/90 mb-2 mt-6">2.3 Device & Usage Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device identifiers and firmware version</li>
                  <li>App usage patterns and feature interactions</li>
                  <li>Connectivity logs (Bluetooth, Wi-Fi)</li>
                  <li>Crash reports and diagnostics</li>
                </ul>

                <h3 className="text-lg font-light text-foreground/90 mb-2 mt-6">2.4 Location Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>GPS and approximate location (only when explicitly enabled)</li>
                  <li>Location is used for contextual wellness insights (e.g., altitude, climate correlation)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Generating personalized wellness insights and trend analysis</li>
                  <li>Improving device accuracy and algorithm performance</li>
                  <li>Providing customer support and account management</li>
                  <li>Sending product updates and wellness recommendations (with consent)</li>
                  <li>Enabling optional healthcare provider data sharing (with explicit consent)</li>
                  <li>Conducting anonymized, aggregated research to improve our platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">4. Data Storage & Security</h2>
                <p className="mb-4">
                  aiOn follows a <strong className="text-foreground">local-first architecture</strong>. By default, your 
                  biometric and health data is stored on your device. Cloud synchronization is optional and requires 
                  explicit opt-in.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All cloud-synced data is protected with end-to-end encryption (AES-256)</li>
                  <li>Data at rest is encrypted using industry-standard protocols</li>
                  <li>We implement strict access controls and regular security audits</li>
                  <li>Biometric data is never sold to third parties</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">5. Data Sharing & Third Parties</h2>
                <p className="mb-4">We do not sell your personal or biometric data. We may share data only in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-foreground">Healthcare Providers:</strong> Only with your explicit, revocable consent through the provider dashboard integration</li>
                  <li><strong className="text-foreground">Service Providers:</strong> Trusted partners who assist in operating our platform (bound by strict confidentiality agreements)</li>
                  <li><strong className="text-foreground">Legal Requirements:</strong> When required by applicable law, regulation, or legal process</li>
                  <li><strong className="text-foreground">Anonymized Data:</strong> Aggregated, de-identified data for research and product improvement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">6. Your Rights & Controls</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-foreground">Access:</strong> Request a copy of all data we hold about you</li>
                  <li><strong className="text-foreground">Deletion:</strong> Request complete deletion of your data from our systems</li>
                  <li><strong className="text-foreground">Portability:</strong> Export your data in a standard, machine-readable format</li>
                  <li><strong className="text-foreground">Correction:</strong> Update or correct any inaccurate personal information</li>
                  <li><strong className="text-foreground">Withdrawal:</strong> Revoke consent for data processing at any time</li>
                  <li><strong className="text-foreground">Opt-Out:</strong> Disable cloud sync, location tracking, or marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">7. Data Retention</h2>
                <p>
                  We retain your personal data for as long as your account is active or as needed to provide services. 
                  Upon account deletion, we remove all personally identifiable data within 30 days. Anonymized, 
                  aggregated data may be retained for research and product improvement purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">8. Children's Privacy</h2>
                <p>
                  aiOn is not intended for use by individuals under the age of 16. We do not knowingly collect 
                  personal information from children. If we become aware of such collection, we will promptly delete 
                  the information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">9. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy periodically. We will notify you of material changes via 
                  email or in-app notification at least 30 days before the changes take effect. Continued use 
                  of aiOn after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">10. Contact Us</h2>
                <p>
                  For privacy-related inquiries or to exercise your data rights, please contact us at:
                </p>
                <p className="mt-2 text-foreground">
                  Mazo Solutions Inc.<br />
                  Email: <a href="mailto:privacy@mazosolutions.com" className="text-primary hover:underline">privacy@mazosolutions.com</a>
                </p>
              </section>

              <div className="card-glass p-6 mt-12">
                <p className="text-caption text-center">
                  aiOn provides wellness insights based on physiological signal trends and patterns. 
                  It is not intended for medical diagnosis or treatment. Always consult a healthcare 
                  professional for medical advice.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;

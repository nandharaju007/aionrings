import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, AlertTriangle, RefreshCw } from 'lucide-react';

const CISPolicyPage = () => {
  const controlDomains = [
    {
      icon: <Server className="w-5 h-5" />,
      title: 'Asset & Inventory Management',
      controls: [
        'Maintain an accurate inventory of all hardware, software, and data assets',
        'Automated discovery and classification of connected devices',
        'Unauthorized asset detection and quarantine procedures',
        'Regular asset audits with documented change tracking',
      ],
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Data Protection & Encryption',
      controls: [
        'AES-256 encryption for all data at rest and in transit',
        'End-to-end encryption for optional cloud synchronization',
        'Hardware-level encryption on aiOn Ring sensor data',
        'Encryption key rotation on a quarterly cycle',
        'Data classification framework (Public, Internal, Confidential, Restricted)',
      ],
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Access Control & Identity Management',
      controls: [
        'Role-based access control (RBAC) across all systems',
        'Multi-factor authentication (MFA) required for administrative access',
        'Principle of least privilege enforced for all user roles',
        'Automated deprovisioning upon role change or termination',
        'Regular access reviews conducted quarterly',
      ],
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: 'Continuous Monitoring & Logging',
      controls: [
        'Centralized security event logging with real-time analysis',
        'Network traffic monitoring and anomaly detection',
        'Application-level audit trails for data access',
        'Log retention for a minimum of 12 months',
        'Automated alerting for suspicious activities',
      ],
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Vulnerability & Threat Management',
      controls: [
        'Regular vulnerability scanning of all infrastructure components',
        'Penetration testing conducted annually by third-party auditors',
        'Firmware security reviews for aiOn Ring hardware',
        'Patch management with critical updates applied within 48 hours',
        'Threat intelligence integration for proactive defense',
      ],
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: 'Incident Response & Recovery',
      controls: [
        'Documented incident response plan with defined escalation paths',
        'Incident classification: Critical, High, Medium, Low',
        'Breach notification within 72 hours as required by applicable law',
        'Post-incident review and remediation tracking',
        'Business continuity and disaster recovery plans tested bi-annually',
      ],
    },
  ];

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
            <h1 className="text-3xl md:text-4xl font-extralight mb-2">
              CIS Benchmark Compliance Policy
            </h1>
            <p className="text-caption mb-12">Last updated: March 24, 2026</p>

            <div className="space-y-10 text-body">
              <section>
                <h2 className="text-xl font-light text-foreground mb-4">1. Overview</h2>
                <p>
                  Mazo Solutions Inc. is committed to maintaining the highest standards of information security 
                  for the aiOn platform. This policy outlines our alignment with the Center for Internet Security 
                  (CIS) Controls framework — a globally recognized set of best practices for securing IT systems 
                  and data.
                </p>
                <p className="mt-4">
                  Given the sensitive nature of biometric and physiological data processed by aiOn, we apply 
                  CIS Controls across our entire technology stack, from the aiOn Ring firmware to our cloud 
                  infrastructure and provider dashboard systems.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">2. Scope</h2>
                <p>This policy applies to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>aiOn Ring hardware and embedded firmware</li>
                  <li>aiOn mobile and web applications</li>
                  <li>Cloud infrastructure and data synchronization services</li>
                  <li>Healthcare provider dashboard and integration APIs</li>
                  <li>Internal systems, development environments, and CI/CD pipelines</li>
                  <li>All employees, contractors, and third-party service providers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">3. CIS Control Domains</h2>
                <p className="mb-8">
                  We implement controls aligned with CIS Controls v8, organized across the following domains:
                </p>

                <div className="space-y-6">
                  {controlDomains.map((domain) => (
                    <div key={domain.title} className="card-glass p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {domain.icon}
                        </div>
                        <h3 className="text-lg font-light text-foreground">{domain.title}</h3>
                      </div>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                        {domain.controls.map((control, i) => (
                          <li key={i}>{control}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">4. Secure Development Practices</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Secure Software Development Lifecycle (SSDLC) integrated into all engineering processes</li>
                  <li>Static Application Security Testing (SAST) on every code commit</li>
                  <li>Dynamic Application Security Testing (DAST) in staging environments</li>
                  <li>Dependency vulnerability scanning with automated remediation</li>
                  <li>Security-focused code reviews for all changes involving data handling</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">5. Third-Party Risk Management</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Vendor security assessments conducted before onboarding</li>
                  <li>Contractual security requirements and data processing agreements</li>
                  <li>Ongoing monitoring of third-party compliance and security posture</li>
                  <li>Annual re-assessment of all critical vendors</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">6. Employee Security</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Security awareness training required for all employees upon hire and annually</li>
                  <li>Phishing simulation exercises conducted quarterly</li>
                  <li>Background checks for personnel handling sensitive data</li>
                  <li>Clear desk and screen lock policies enforced</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">7. Compliance & Auditing</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Annual CIS Controls self-assessment using CIS-CAT Pro</li>
                  <li>Independent third-party security audits conducted annually</li>
                  <li>Continuous compliance monitoring with automated reporting</li>
                  <li>Executive-level security reviews conducted quarterly</li>
                  <li>Alignment with additional frameworks: SOC 2, HIPAA (where applicable)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">8. Policy Review</h2>
                <p>
                  This policy is reviewed and updated annually, or sooner if prompted by significant changes in 
                  technology, threat landscape, regulatory requirements, or organizational structure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">9. Contact</h2>
                <p>
                  For questions about our security practices or to report a security concern:
                </p>
                <p className="mt-2 text-foreground">
                  Mazo Solutions Inc.<br />
                  Email: <a href="mailto:security@mazosolutions.com" className="text-primary hover:underline">security@mazosolutions.com</a>
                </p>
              </section>

              <div className="card-glass p-6 mt-12">
                <p className="text-caption text-center">
                  aiOn provides wellness insights based on physiological signal trends and patterns. 
                  It is not intended for medical diagnosis or treatment. Security measures described 
                  in this policy are continuously evolving to address emerging threats.
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

export default CISPolicyPage;

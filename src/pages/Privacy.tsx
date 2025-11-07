import React from 'react';
import { Shield, Lock, Eye, FileText, Mail } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="flex items-center mb-8">
            <Shield className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 text-primary-600 mr-2" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                WAINSO ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us for CCTV installation, GPS tracking, and maintenance services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 text-primary-600 mr-2" />
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Request a quote or consultation</li>
                <li>Contact us via phone, email, or WhatsApp</li>
                <li>Subscribe to our newsletter or marketing communications</li>
                <li>Use our services or products</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                This information may include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Name and Contact Information:</strong> Full name, email address, phone number, postal address</li>
                <li><strong>Business Information:</strong> Company name, business type, industry</li>
                <li><strong>Service Requirements:</strong> Details about CCTV, GPS, or maintenance needs</li>
                <li><strong>Payment Information:</strong> Billing address, payment method (processed securely through third-party providers)</li>
                <li><strong>Communication Records:</strong> Correspondence, call recordings (with consent), support tickets</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                When you visit our website, we may automatically collect certain information about your device and browsing behavior:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited, time spent on pages, and navigation patterns</li>
                <li>Referring website addresses</li>
                <li>Device identifiers and mobile network information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.3 Cookies and Tracking Technologies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies, web beacons, and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-primary-600 mr-2" />
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve our CCTV, GPS tracking, and maintenance services</li>
                <li><strong>Communication:</strong> To respond to inquiries, send quotes, provide customer support, and send service updates</li>
                <li><strong>Business Operations:</strong> To process transactions, manage accounts, and fulfill contractual obligations</li>
                <li><strong>Marketing:</strong> To send promotional materials, newsletters, and information about new services (with your consent)</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                <li><strong>Security:</strong> To detect, prevent, and address fraud, security breaches, and technical issues</li>
                <li><strong>Analytics:</strong> To analyze usage patterns, improve website functionality, and enhance user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operations (payment processors, cloud storage, analytics providers)</li>
                <li><strong>Business Partners:</strong> With authorized dealers, installers, or partners involved in service delivery</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sale of assets (with notice to users)</li>
                <li><strong>Consent:</strong> When you have given explicit consent for sharing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Employee training on data protection</li>
                <li>Secure data storage and backup procedures</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications at any time</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Factors we consider include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>The nature and sensitivity of the information</li>
                <li>Legal and regulatory requirements</li>
                <li>Business needs and contractual obligations</li>
                <li>Potential disputes or claims</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="h-6 w-6 text-primary-600 mr-2" />
                11. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-900 font-semibold mb-2">WAINSO</p>
                <p className="text-gray-700 mb-1">Email: <a href="mailto:wainsogps@gmail.com" className="text-primary-600 hover:underline">wainsogps@gmail.com</a></p>
                <p className="text-gray-700 mb-1">Phone: <a href="tel:+919899860975" className="text-primary-600 hover:underline">+91 98998 60975</a></p>
                <p className="text-gray-700 mt-4">
                  <strong>Data Protection Officer:</strong> For privacy-related inquiries, please email us with "Privacy Policy" in the subject line.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;


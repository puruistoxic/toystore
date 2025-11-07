import React from 'react';
import { FileText, Scale, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="flex items-center mb-8">
            <Scale className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-primary-600 mr-2" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using the services of WAINSO ("we," "us," or "our"), including our website, products, and services related to CCTV installation, GPS tracking, and maintenance, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These Terms constitute a legally binding agreement between you and WAINSO. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Services Description</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                WAINSO provides professional security and tracking solutions, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>CCTV surveillance system installation, configuration, and maintenance</li>
                <li>GPS tracking device installation and fleet management solutions</li>
                <li>Equipment maintenance, repair, and troubleshooting services</li>
                <li>Consultation and security assessment services</li>
                <li>Sale of security and tracking equipment</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Service specifications, pricing, and availability are subject to change without notice. We reserve the right to refuse service to anyone for any reason at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Quotes and Pricing</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>3.1 Quote Validity:</strong> All quotes provided by WAINSO are valid for the period specified in the quote document, typically 30 days from the date of issue, unless otherwise stated.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>3.2 Pricing:</strong> Prices are subject to change without notice. Final pricing will be confirmed upon order acceptance and may vary based on:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Site-specific requirements and complexity</li>
                <li>Equipment specifications and customization</li>
                <li>Installation location and accessibility</li>
                <li>Market conditions and supplier pricing</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                <strong>3.3 Taxes:</strong> All prices are exclusive of applicable taxes, duties, and government charges unless otherwise stated.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Orders and Payment</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>4.1 Order Acceptance:</strong> Your order constitutes an offer to purchase services or products. We reserve the right to accept or reject any order at our sole discretion.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>4.2 Payment Terms:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Payment terms will be specified in the service agreement or invoice</li>
                <li>Advance payment may be required for certain services or custom orders</li>
                <li>Payment must be made in Indian Rupees (INR) unless otherwise agreed</li>
                <li>Late payments may incur interest charges as specified in the agreement</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>4.3 Payment Methods:</strong> We accept payment through bank transfer, cheque, cash, and other methods as agreed upon.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Installation and Service Delivery</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.1 Site Access:</strong> You agree to provide necessary access to installation sites, including permissions, keys, and safe working conditions for our technicians.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.2 Installation Timeline:</strong> Estimated installation timelines are provided in good faith but are subject to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Site readiness and accessibility</li>
                <li>Equipment availability and delivery</li>
                <li>Weather conditions (for outdoor installations)</li>
                <li>Unforeseen technical challenges</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.3 Customer Responsibilities:</strong> You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Providing accurate site information and requirements</li>
                <li>Ensuring site safety and compliance with local regulations</li>
                <li>Obtaining necessary permits and approvals (where applicable)</li>
                <li>Protecting installed equipment from damage or tampering</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Warranties and Guarantees</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>6.1 Equipment Warranty:</strong> Equipment is covered by manufacturer warranties as specified in product documentation. WAINSO will facilitate warranty claims in accordance with manufacturer terms.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>6.2 Installation Warranty:</strong> We provide a warranty on installation workmanship for the period specified in the service agreement, typically 12 months from installation date.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>6.3 Warranty Limitations:</strong> Warranties do not cover:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Damage caused by misuse, accidents, or unauthorized modifications</li>
                <li>Normal wear and tear</li>
                <li>Damage from natural disasters, power surges, or external factors beyond our control</li>
                <li>Third-party software or services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>7.1 General Limitation:</strong> To the maximum extent permitted by law, WAINSO's total liability for any claims arising from our services shall not exceed the total amount paid by you for the specific service in question.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>7.2 Indirect Damages:</strong> We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Loss of data or information</li>
                <li>Business interruption</li>
                <li>Reputational damage</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>7.3 Security Systems:</strong> While we provide professional installation and maintenance, we cannot guarantee that security systems will prevent all security breaches, theft, or unauthorized access. Security systems are tools to assist in protection but are not foolproof.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on our website, including text, graphics, logos, images, and software, is the property of WAINSO or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. User Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Use our services for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt our services or servers</li>
                <li>Attempt to gain unauthorized access to any part of our systems</li>
                <li>Transmit viruses, malware, or harmful code</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cancellation and Refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>10.1 Service Cancellation:</strong> You may cancel a service order before installation begins, subject to cancellation fees as specified in the service agreement.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>10.2 Refund Policy:</strong> Refunds are governed by our Refund Policy, available on our website. Generally:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Refunds for uninstalled equipment may be subject to restocking fees</li>
                <li>Custom or special-order items may not be eligible for refund</li>
                <li>Services already rendered are not refundable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Force Majeure</h2>
              <p className="text-gray-700 leading-relaxed">
                We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to natural disasters, war, terrorism, labor disputes, government actions, pandemics, or supplier failures.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>12.1 Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>12.2 Jurisdiction:</strong> Any disputes arising from these Terms or our services shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>12.3 Mediation:</strong> Before initiating legal proceedings, parties agree to attempt to resolve disputes through good faith negotiation or mediation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. Material changes will be notified through our website or via email. Your continued use of our services after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-900 font-semibold mb-2">WAINSO</p>
                <p className="text-gray-700 mb-1">Email: <a href="mailto:wainsogps@gmail.com" className="text-primary-600 hover:underline">wainsogps@gmail.com</a></p>
                <p className="text-gray-700 mb-1">Phone: <a href="tel:+919899860975" className="text-primary-600 hover:underline">+91 98998 60975</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;


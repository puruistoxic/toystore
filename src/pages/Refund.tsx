import React from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Refund: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="flex items-center mb-8">
            <RefreshCw className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Refund Policy</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At WAINSO, we strive to ensure customer satisfaction with our CCTV installation, GPS tracking, and maintenance services. This Refund Policy outlines the circumstances under which refunds may be issued and the process for requesting a refund.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Please read this policy carefully before making a purchase or booking a service. By using our services, you agree to this Refund Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                2. Eligible Refunds
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Equipment Purchases</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Refunds for equipment purchases may be available under the following conditions:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Unopened/Unused Equipment:</strong> Equipment returned in original, unopened packaging within 7 days of purchase may be eligible for a full refund, subject to a 10% restocking fee.</li>
                <li><strong>Defective Equipment:</strong> Equipment found to be defective upon delivery or within the manufacturer's warranty period may be eligible for replacement or refund.</li>
                <li><strong>Wrong Item Delivered:</strong> If you receive an item different from what was ordered, we will arrange for correct delivery or provide a full refund.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Service Cancellations</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Service cancellation refunds depend on the stage of service delivery:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Before Installation Begins:</strong> Full refund of advance payment, minus any non-refundable deposits or costs already incurred (e.g., site survey fees).</li>
                <li><strong>During Installation:</strong> Partial refund based on work completed. Costs for materials used, labor hours, and equipment installed are non-refundable.</li>
                <li><strong>After Installation:</strong> No refund for completed installations, except in cases of service defects covered under warranty.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.3 Maintenance Services</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Maintenance service fees are generally non-refundable once the service has been performed. However, if you are dissatisfied with the service quality, please contact us within 48 hours, and we will investigate and may offer a re-service or partial refund at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <XCircle className="h-6 w-6 text-red-600 mr-2" />
                3. Non-Refundable Items
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                The following are generally not eligible for refunds:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Custom or Special-Order Items:</strong> Equipment or services customized to your specific requirements</li>
                <li><strong>Consultation Fees:</strong> Fees paid for security assessments, consultations, or site surveys</li>
                <li><strong>Completed Services:</strong> Services that have been fully delivered and accepted</li>
                <li><strong>Digital Products:</strong> Software licenses, mobile app subscriptions, or cloud services</li>
                <li><strong>Damaged Items:</strong> Equipment damaged due to misuse, accidents, or unauthorized modifications</li>
                <li><strong>Used Equipment:</strong> Equipment that has been installed, used, or removed from original packaging</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-6 w-6 text-primary-600 mr-2" />
                4. Refund Process
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 Requesting a Refund</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                To request a refund, please contact us within the applicable time frame:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Email: <a href="mailto:wainsogps@gmail.com" className="text-primary-600 hover:underline">wainsogps@gmail.com</a></li>
                <li>Phone: <a href="tel:+919899860975" className="text-primary-600 hover:underline">+91 98998 60975</a></li>
                <li>Include your order number, invoice number, or service reference</li>
                <li>Provide a clear reason for the refund request</li>
                <li>Attach relevant documentation (photos, invoices, etc.)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Refund Review</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We will review your refund request within 5-7 business days. Our team may:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Request additional information or documentation</li>
                <li>Inspect returned equipment (if applicable)</li>
                <li>Verify service completion status</li>
                <li>Contact you for clarification</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 Refund Approval and Processing</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                If your refund is approved:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>You will receive a confirmation email with refund details</li>
                <li>Refunds will be processed to the original payment method within 10-15 business days</li>
                <li>For bank transfers, processing may take 5-7 additional business days</li>
                <li>You will be notified once the refund has been processed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Return of Equipment</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.1 Return Conditions:</strong> For equipment refunds, items must be returned in their original condition:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Original packaging (if applicable)</li>
                <li>All accessories, manuals, and documentation included</li>
                <li>No signs of use, damage, or tampering</li>
                <li>Within the specified return time frame</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.2 Return Shipping:</strong> Return shipping costs are the responsibility of the customer unless the return is due to our error (wrong item, defective item, etc.).
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.3 Return Address:</strong> We will provide the return address upon approval of your refund request. Do not return items without prior authorization.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Partial Refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Partial refunds may be issued in the following scenarios:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Service cancellation after work has begun (refund for uncompleted portion)</li>
                <li>Equipment returned in used or damaged condition (deduction for depreciation)</li>
                <li>Restocking fees for returned equipment (typically 10-15% of purchase price)</li>
                <li>Non-refundable deposits or fees already incurred</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Warranty Claims vs. Refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Equipment defects covered under manufacturer warranty will typically be handled through warranty replacement or repair rather than refunds. If warranty service is not available or satisfactory, we may offer a refund at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disputes and Chargebacks</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are dissatisfied with our refund decision, please contact us to discuss your concerns. We are committed to resolving issues fairly. Initiating a chargeback with your bank or payment provider without first contacting us may result in additional fees and may affect your ability to use our services in the future.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-6 w-6 text-primary-600 mr-2" />
                10. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about refunds or to initiate a refund request, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-900 font-semibold mb-2">WAINSO</p>
                <p className="text-gray-700 mb-1">Email: <a href="mailto:wainsogps@gmail.com" className="text-primary-600 hover:underline">wainsogps@gmail.com</a></p>
                <p className="text-gray-700 mb-1">Phone: <a href="tel:+919899860975" className="text-primary-600 hover:underline">+91 98998 60975</a></p>
                <p className="text-gray-700 mt-4">
                  <strong>Refund Requests:</strong> Please include "Refund Request" in the subject line of your email for faster processing.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refund;


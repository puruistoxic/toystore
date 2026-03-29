import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, AlertCircle, CheckCircle, Package, Store } from 'lucide-react';
import SEO from '../components/SEO';

const STORE_NAME = 'Khandelwal Toy Store';
const STORE_EMAIL = 'wainsogps@gmail.com';
const STORE_PHONE_PRIMARY = '+91 98998 60975';
const STORE_PHONE_SECONDARY = '+91 82927 17044';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Terms of Service | Khandelwal Toy Store"
        description="Terms for using the Khandelwal Toy Store website and shopping at our local toy shop — pickup, product information, payments, and policies."
        path="/terms"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="flex items-center mb-8">
            <Scale className="h-8 w-8 text-primary-600 mr-3 shrink-0" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>

          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong>{' '}
            {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                1. Acceptance of terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing <strong>khandelwaltoystore.com</strong> (or any site we operate), visiting our shop, or buying
                from <strong>{STORE_NAME}</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to these
                Terms of Service (&quot;Terms&quot;). If you do not agree, please do not use our website or services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms from time to time. The &quot;Last updated&quot; date at the top will change when we
                do. Continued use of the website or store after changes means you accept the revised Terms, except where
                applicable law requires otherwise.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Store className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                2. What we offer
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {STORE_NAME} is a <strong>local retail toy shop</strong>. We provide:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  An <strong>online catalogue</strong> to browse toys, games, and related products, check approximate
                  availability or features, and contact us (e.g. WhatsApp or phone).
                </li>
                <li>
                  <strong>In-store shopping</strong> — select products at our counter, pay, and take your purchase with you.
                </li>
                <li>
                  Friendly advice on age suitability and product types, as a general guide only (see section 6 for
                  disclaimers).
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We do <strong>not</strong> guarantee that every item shown on the website is in stock at all times. Website
                content is for information; <strong>final availability and price are confirmed at the store</strong> unless we
                agree otherwise in writing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                3. Prices, product information &amp; availability
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>3.1 Pricing:</strong> Prices displayed online or quoted by message may change without notice.{' '}
                <strong>The price you pay is the price confirmed at checkout</strong> in our shop (or as agreed for any
                special arrangement).
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>3.2 Taxes:</strong> Applicable GST or other taxes will be charged as required by law and shown on your
                bill where relevant.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>3.3 Descriptions &amp; images:</strong> We try to keep descriptions, photos, and specifications
                accurate. Minor packaging or colour variations from suppliers may occur. If exact appearance matters, please
                confirm with staff before purchase.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>3.4 Errors:</strong> We may correct pricing or listing errors (including on the website) and refuse or
                cancel an order if an error was obvious or could reasonably have been recognised as a mistake.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Orders &amp; payment</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>4.1 Contract:</strong> A purchase contract is formed when we accept your payment and hand over the
                goods at our store (or as otherwise expressly agreed). Browsing the website or sending an enquiry does not
                alone create an obligation to sell a specific item.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>4.2 Refusal of sale:</strong> We may refuse service or limit quantities (e.g. fairness, stock, or
                suspected fraud) where permitted by law.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>4.3 Payment:</strong> Payment is normally in <strong>Indian Rupees (INR)</strong> at the time of
                purchase. We may accept cash, UPI, cards, or other methods as displayed or agreed at the counter.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>4.4 Deposits / holds:</strong> If we offer to hold or order-in an item, any deposit, timeline, and
                cancellation rules will be explained at that time and may be confirmed in writing or on your receipt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. In-store pickup, inspection &amp; acceptance</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Most sales are completed when you <strong>collect your toys at our shop</strong>. We encourage you to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Inspect packaging, contents (where practical), and obvious condition before you leave.</li>
                <li>Ask staff about batteries, small parts, age labels, or how a toy works.</li>
                <li>Keep your bill or receipt.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Except where the law requires otherwise, <strong>goods are considered accepted when you leave the store</strong>{' '}
                after a fair opportunity to inspect them. Exchanges, replacements, and refunds are then governed by our{' '}
                <Link to="/refund" className="text-primary-600 hover:underline">
                  Refund &amp; exchange policy
                </Link>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2 shrink-0" />
                6. Safety, age suitability &amp; manufacturer warranty
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>6.1 Adult responsibility:</strong> Many toys carry <strong>choking hazards</strong>, small parts, or
                age recommendations on the packaging. It is the <strong>parent or guardian&apos;s responsibility</strong> to
                choose toys appropriate for the child and to supervise play. Our staff suggestions are informal guidance only
                and do not replace reading the label or using your own judgment.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>6.2 Manufacturer warranty:</strong> Where a brand provides a warranty, terms are set by the
                manufacturer and any documentation inside the box. We may help explain the process but are not the warrantor
                unless we say so in writing.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>6.3 No medical claims:</strong> We do not claim that toys treat, cure, or diagnose any condition.
                &quot;Educational&quot; or similar descriptions are ordinary retail descriptions, not professional advice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of liability</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>7.1 General:</strong> To the maximum extent permitted by applicable law, our total liability for any
                claim relating to products or use of this website shall not exceed the <strong>amount you paid us</strong> for
                the specific product or transaction giving rise to the claim.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>7.2 Indirect loss:</strong> We are not liable for indirect or consequential loss, including loss of
                profit, loss of enjoyment, or business interruption, except where such exclusion is not allowed by law.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>7.3 Website:</strong> The website may occasionally be unavailable. We do not guarantee uninterrupted
                or error-free access. Third-party links (if any) are for convenience; we are not responsible for external
                sites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Website text, layout, branding (including logos and graphics we own), and our product photography where
                original to us are protected by copyright and other laws. Toy names, characters, and trademarks belong to their
                respective owners. You may not copy, scrape, or reuse our site content for commercial purposes without
                permission, except as allowed for personal, non-commercial browsing or sharing links.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Acceptable use of the website</h2>
              <p className="text-gray-700 leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Use the site for anything unlawful or fraudulent</li>
                <li>Attempt to hack, overload, or disrupt our systems</li>
                <li>Scrape or automate bulk collection of catalogue data without consent</li>
                <li>Upload malware or harmful code</li>
                <li>Misrepresent who you are or your relationship with us</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cancellations, exchanges, and refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>10.1 In-store sales:</strong> {STORE_NAME} primarily sells toys for{' '}
                <strong>local pickup at our shop</strong>. You are encouraged to inspect products before leaving. Full details
                on exchanges, replacements, and refunds are in our{' '}
                <Link to="/refund" className="text-primary-600 hover:underline">
                  Refund &amp; exchange policy
                </Link>
                .
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>10.2 Summary:</strong> Generally:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  We prioritise <strong>replacement or exchange</strong> for genuine defects when you return with the item,
                  packaging (where relevant), and bill within the stated period.
                </li>
                <li>
                  <strong>Change-of-mind</strong> returns after you have accepted goods at the store are usually not accepted.
                </li>
                <li>
                  <strong>Special orders, clearance, or final-sale</strong> items may be non-returnable as explained at
                  purchase.
                </li>
                <li>
                  <strong>Cash refunds</strong> are exceptional and follow the Refund &amp; exchange policy.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Force majeure</h2>
              <p className="text-gray-700 leading-relaxed">
                We are not liable for delay or failure caused by events outside our reasonable control, including natural
                disasters, strikes, government restrictions, pandemics, transport disruptions, or supplier shortages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Dispute resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>12.1 Governing law:</strong> These Terms are governed by the <strong>laws of India</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>12.2 Jurisdiction:</strong> Subject to mandatory consumer protections, courts in India shall have
                jurisdiction over disputes arising from these Terms or your purchase.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>12.3 Good faith:</strong> We encourage you to contact us first so we can try to resolve concerns
                fairly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Modifications to these Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may change these Terms by posting an updated version on this page. Material changes may also be noted on
                the website or at the store where practical. Your continued use after the update constitutes acceptance unless
                the law requires a different process.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                14. Contact
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">Questions about these Terms:</p>
              <div className="bg-gray-50 rounded-lg p-6 not-prose">
                <p className="text-gray-900 font-semibold mb-2">{STORE_NAME}</p>
                <p className="text-gray-700 mb-1">
                  Email:{' '}
                  <a href={`mailto:${STORE_EMAIL}`} className="text-primary-600 hover:underline">
                    {STORE_EMAIL}
                  </a>
                </p>
                <p className="text-gray-700 mb-1">
                  Phone:{' '}
                  <a href="tel:+919899860975" className="text-primary-600 hover:underline">
                    {STORE_PHONE_PRIMARY}
                  </a>
                  {', '}
                  <a href="tel:+918292717044" className="text-primary-600 hover:underline">
                    {STORE_PHONE_SECONDARY}
                  </a>
                </p>
                <p className="text-gray-700 mt-3 text-sm">
                  Store address and hours: see our{' '}
                  <Link to="/contact" className="text-primary-600 hover:underline">
                    Contact
                  </Link>{' '}
                  page.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

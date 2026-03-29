import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, Mail } from 'lucide-react';
import SEO from '../components/SEO';

const STORE_NAME = 'Khandelwal Toy Store';
const STORE_EMAIL = 'wainsogps@gmail.com';
const STORE_PHONE_PRIMARY = '+91 98998 60975';
const STORE_PHONE_SECONDARY = '+91 82927 17044';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Privacy Policy | Khandelwal Toy Store"
        description="How Khandelwal Toy Store collects, uses, and protects your information when you use our website, WhatsApp, or shop with us in person."
        path="/privacy"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="flex items-center mb-8">
            <Shield className="h-8 w-8 text-primary-600 mr-3 shrink-0" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>

          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong>{' '}
            {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>{STORE_NAME}</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy. This
                Privacy Policy describes how we collect, use, store, and share information when you visit{' '}
                <strong>khandelwaltoystore.com</strong> (or related pages we operate), message us (including WhatsApp),
                call or email us, or <strong>shop at our physical toy store</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our website or giving us your details, you agree to this policy. If you do not agree, please do not
                use our site or share personal information with us. For purchases and legal terms, see our{' '}
                <Link to="/terms" className="text-primary-600 hover:underline">
                  Terms of Service
                </Link>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                2. Information we collect
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Information you provide</h3>
              <p className="text-gray-700 leading-relaxed mb-3">We may collect information when you:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Contact us by phone, email, WhatsApp, or the contact form (name, phone, email, message content)</li>
                <li>Ask about product availability, prices, directions, or party / bulk orders</li>
                <li>Subscribe to updates or marketing, if we offer that and you opt in</li>
                <li>
                  <strong>Shop in store</strong> — we may process name, phone, or email on a bill or for warranty notes, and
                  payment-related information as needed to complete the sale
                </li>
                <li>Take part in a survey, contest, or promotion we run</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">This may include:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  <strong>Identity &amp; contact:</strong> name, email, phone number, postal address (if you give it)
                </li>
                <li>
                  <strong>Enquiry details:</strong> toys or categories you asked about, child&apos;s age range if you share it
                  for recommendations (optional — you choose what to tell us)
                </li>
                <li>
                  <strong>Transaction data:</strong> items purchased, date, amount, payment method type (card/UPI/cash as
                  applicable); card or UPI details are handled by banks or payment providers where electronic payment is used
                </li>
                <li>
                  <strong>Records:</strong> copies of messages or emails needed to respond to you or support warranty /
                  exchange requests
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Automatically collected (website)</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                When you browse our site, standard logs and tools may collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>IP address and approximate region</li>
                <li>Browser type, device type, and operating system</li>
                <li>Pages viewed, approximate time on site, and referring page</li>
                <li>Basic error or performance diagnostics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.3 Cookies and similar technologies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may use cookies or local storage for essential site function, preferences, or analytics (e.g. understanding
                which pages are popular). You can control cookies through your browser settings; blocking some cookies may
                affect how the site works.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                3. How we use your information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">We use information to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  <strong>Respond to you</strong> — stock checks, directions, product questions, and after-sales help
                </li>
                <li>
                  <strong>Run the shop</strong> — billing, receipts, exchanges or refunds as per our policies, and internal
                  records
                </li>
                <li>
                  <strong>Improve the website</strong> — fix issues, understand usage, and make the catalogue easier to use
                </li>
                <li>
                  <strong>Marketing</strong> — only where you have agreed (e.g. newsletter); you can opt out anytime
                </li>
                <li>
                  <strong>Legal &amp; safety</strong> — comply with law, tax, or accounting rules; detect fraud or misuse; protect
                  our rights and customers
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sharing and disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We <strong>do not sell</strong> your personal information. We may share it only as needed:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  <strong>Service providers</strong> — e.g. website hosting, email, analytics, or payment partners, under
                  contracts that require them to protect data and use it only for our instructions
                </li>
                <li>
                  <strong>Legal</strong> — if required by law, court order, or competent authority, or to protect safety and
                  rights
                </li>
                <li>
                  <strong>Business transfer</strong> — if our business is merged or sold, your information may transfer as part
                  of the business (we will seek to inform you where practical)
                </li>
                <li>
                  <strong>With your consent</strong> — any other sharing we describe at the time you agree
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use reasonable technical and organisational measures suited to a small retail business — for example
                access controls, secure connections where we host the site, and careful handling of devices at the counter. No
                online or offline system is perfectly secure; we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your rights and choices</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Under applicable law (including Indian data protection rules as they evolve), you may have rights to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Ask what personal data we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion where the law allows</li>
                <li>Object to or limit certain processing</li>
                <li>Withdraw consent for marketing</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Contact us using the details in section 11. We may need to verify your identity before acting on a request.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We keep information only as long as needed for the purposes above — for example, enquiry messages for a
                reasonable period, bills and tax records as required by law, and marketing lists until you unsubscribe.
                When data is no longer needed, we delete or anonymise it where we can.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children&apos;s privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our website and WhatsApp channels are intended for <strong>adults</strong> (parents, guardians, or shoppers).
                We do not knowingly collect personal data directly from children under <strong>13</strong> without appropriate
                parental involvement. If you are a parent and believe your child shared personal information with us without
                your consent, please contact us and we will take steps to delete it where the law allows.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Buying toys for children does not require us to collect the child&apos;s personal data; please avoid sharing
                unnecessary details about minors in messages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-party links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our site may link to other websites (brands, social media, maps). We are not responsible for their privacy
                practices. Please read their policies before you submit information there.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to this policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top will change
                when we do. For important changes, we may also post a notice on the website or at the store where practical.
                Continued use after updates means you accept the revised policy, except where the law requires otherwise.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                11. Contact us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Questions about this Privacy Policy or your personal data:
              </p>
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
                  <Link to="/contact" className="text-primary-600 hover:underline">
                    Contact page
                  </Link>{' '}
                  — store address and hours.
                </p>
                <p className="text-gray-700 mt-4 text-sm">
                  <strong>Privacy requests:</strong> please use &quot;Privacy&quot; in the email subject line so we can route
                  your message quickly.
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

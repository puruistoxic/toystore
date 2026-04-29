import React from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Store } from 'lucide-react';
import SEO from '../components/SEO';

const STORE_EMAIL = 'wainsogps@gmail.com';
const STORE_PHONE_PRIMARY = '+91 98998 60975';
const STORE_PHONE_SECONDARY = '+91 82927 17044';

const Refund: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Refund & exchange policy | DigiDukaanLive"
        description="How refunds, exchanges, and replacements work for our store — in-store pickup, inspection at the counter, and replacement conditions."
        path="/refund"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="flex items-center mb-8">
            <RefreshCw className="h-8 w-8 text-primary-600 mr-3 shrink-0" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Refund & exchange policy</h1>
          </div>

          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong>{' '}
            {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>DigiDukaanLive</strong> is primarily a <strong>local, in-person</strong> retail store. Most purchases
                are completed when you <strong>select items at the store</strong>, we show you the product, and you{' '}
                <strong>take delivery at the counter</strong> after payment. This policy explains when we may offer an{' '}
                <strong>exchange, replacement, or refund</strong> — and when we cannot, because you have already had the
                chance to inspect the toy before leaving.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By shopping with us, you agree to this policy. If anything is unclear, ask a staff member before you pay or
                leave the store.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Store className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                2. In-store pickup & inspection
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We encourage you to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  <strong>Check the toy</strong> — packaging, contents, batteries (if any), moving parts, and obvious
                  damage — <strong>before you leave</strong>.
                </li>
                <li>
                  <strong>Ask questions</strong> about age suitability, small parts, or how the toy works; we are happy to
                  help at the counter.
                </li>
                <li>
                  Keep your <strong>bill or receipt</strong>; it is required for any exchange, replacement, or refund we
                  agree to.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Except where the law requires otherwise or we explicitly agree in writing, <strong>a sale is considered
                accepted once you leave the store with the product</strong> after having had a fair opportunity to inspect
                it. Issues that could have been noticed at the counter (missing piece in open display, crushed box you
                accepted, wrong colour you confirmed) are much harder to resolve later and may not be eligible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2 shrink-0" />
                3. Replacements & exchanges
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We prioritise <strong>replacement or exchange</strong> (same or comparable item) where practical. The
                following are typical situations we may help with, <strong>subject to stock availability</strong> and
                verification at our store:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  <strong>Manufacturing defect:</strong> The toy fails to work as intended out of the box, has a clear
                  factory fault, or is damaged inside sealed packaging that was not opened before purchase. Please{' '}
                  <strong>return to the store with the product, all original packaging and accessories, and your bill</strong>
                  , ideally within <strong>7 days</strong> of purchase. We may inspect the item; if we confirm a defect, we
                  will try to offer a <strong>replacement</strong> of the same SKU. If the same item is not available, we may
                  offer a <strong>comparable substitute</strong> or, at our discretion, a <strong>refund</strong> to the
                  original payment method where that is possible.
                </li>
                <li>
                  <strong>Wrong item charged:</strong> If we accidentally billed or handed you the wrong product compared to
                  what you agreed to buy, tell us <strong>as soon as possible</strong> and bring the item and bill. We will
                  correct this with an exchange or refund as appropriate.
                </li>
                <li>
                  <strong>Missing parts in sealed stock:</strong> If you discover that factory-sealed contents are missing
                  (documented with packaging intact where relevant), contact us promptly with the bill; we will follow the
                  same defect-style process above.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>Replacement may be declined</strong> if, for example:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>The toy shows <strong>wear, breakage, or water damage</strong> consistent with use after you left the store.</li>
                <li>
                  <strong>Accessories, packaging, or the bill</strong> are missing, and we cannot verify the purchase or
                  condition.
                </li>
                <li>
                  The issue is <strong>not a defect</strong> but a matter of taste, colour preference, or &quot;child does not
                  like it&quot; after use.
                </li>
                <li>
                  The product is <strong>clearance, final sale, or marked non-returnable</strong> (we will tell you at checkout
                  when that applies).
                </li>
                <li>
                  <strong>Battery-operated toys:</strong> If you have installed non-recommended or old batteries, modified the
                  toy, or submerged it, normal manufacturer exclusions may apply.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refunds (money back)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Because most sales are <strong>face-to-face and inspected at pickup</strong>, <strong>cash refunds are not
                routine</strong> and are offered only where we cannot fairly resolve the issue with a replacement or
                exchange, or where required by applicable law.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  Approved refunds are usually processed to the <strong>original payment method</strong> (e.g. same card or
                  UPI where technically possible). Timing depends on banks and payment partners — often within roughly{' '}
                  <strong>7–15 business days</strong> after we confirm approval.
                </li>
                <li>
                  For <strong>pre-paid reservations</strong> (if we offer them), cancellation terms will be explained at the
                  time of booking; any refund of advance amounts is at our discretion unless otherwise mandated.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <XCircle className="h-6 w-6 text-red-600 mr-2 shrink-0" />
                5. Usually non-refundable / non-exchangeable
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                The following are <strong>generally not</strong> eligible for refund or exchange:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  Items <strong>accepted and taken from the store</strong> with no defect, where you simply changed your mind
                  after use at home.
                </li>
                <li>
                  <strong>Opened soft toys, plush, or hygiene-related items</strong> where resale is not reasonable, unless a
                  defect applies as in section 3.
                </li>
                <li>
                  <strong>Special orders</strong> sourced specifically for you, personalised items, or festival / bulk party
                  orders where we communicated a no-return rule.
                </li>
                <li>
                  <strong>Damage or loss after you leave</strong> the store (drops, spills, pet damage, lost parts).
                </li>
                <li>
                  <strong>Gift cards or vouchers</strong> (if sold), except as required by law.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                6. How to request an exchange, replacement, or refund
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.1 Visit or message us</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Preferably <strong>visit the store</strong> with the product and bill so we can inspect on the spot. You may
                also call or WhatsApp to explain the issue; we may still ask you to <strong>bring the item in</strong> before
                we decide.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  Email:{' '}
                  <a href={`mailto:${STORE_EMAIL}`} className="text-primary-600 hover:underline">
                    {STORE_EMAIL}
                  </a>
                </li>
                <li>
                  Phone:{' '}
                  <a href="tel:+919911484404" className="text-primary-600 hover:underline">
                    {STORE_PHONE_PRIMARY}
                  </a>
                  {', '}
                  <a href="tel:+918292717044" className="text-primary-600 hover:underline">
                    {STORE_PHONE_SECONDARY}
                  </a>
                </li>
                <li>Include your <strong>bill number / date</strong> and clear photos only if we ask for them first.</li>
                <li>Briefly describe the problem (e.g. &quot;motor does not run with new batteries&quot;).</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.2 Our review</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We aim to respond within a few business days for messages, or immediately when you visit during opening hours.
                We may examine the toy, check serial or batch details, or follow <strong>manufacturer warranty</strong>{' '}
                procedures where the brand handles service directly.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.3 In-store returns only (default)</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Unless we have agreed otherwise in writing, <strong>we do not operate a mail-in returns centre</strong>.
                Please assume all eligible returns and exchanges happen <strong>at our store</strong> in Ramgarh Cantt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Manufacturer warranty</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Some toys include a <strong>manufacturer&apos;s warranty</strong> (duration and terms vary by brand). Where
                warranty service is through the brand or an authorised centre, we will guide you on the process. Our store
                policy in sections 3–4 is <strong>in addition to</strong> any statutory rights you may have; it does not
                replace warranty documentation inside the box.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disputes & chargebacks</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you disagree with our decision, please speak to the store manager or contact us using the details below. We
                aim to resolve concerns in good faith. Raising a <strong>chargeback</strong> with your bank without first
                discussing the issue with us may slow resolution and could affect future orders.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to this policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this page from time to time. The &quot;Last updated&quot; date at the top will change when we do.
                Continued use of our store and website after updates means you accept the revised policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-6 w-6 text-primary-600 mr-2 shrink-0" />
                10. Contact
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For exchanges, replacements, or refund questions:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 not-prose">
                <p className="text-gray-900 font-semibold mb-2">DigiDukaanLive</p>
                <p className="text-gray-700 mb-1">
                  Email:{' '}
                  <a href={`mailto:${STORE_EMAIL}`} className="text-primary-600 hover:underline">
                    {STORE_EMAIL}
                  </a>
                </p>
                <p className="text-gray-700 mb-1">
                  Phone:{' '}
                  <a href="tel:+919911484404" className="text-primary-600 hover:underline">
                    {STORE_PHONE_PRIMARY}
                  </a>
                  {', '}
                  <a href="tel:+918292717044" className="text-primary-600 hover:underline">
                    {STORE_PHONE_SECONDARY}
                  </a>
                </p>
                <p className="text-gray-700 mt-4 text-sm">
                  <strong>Tip:</strong> Put &quot;Exchange / refund&quot; in the subject line of emails so we can route your
                  message faster.
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

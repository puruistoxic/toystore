import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Ban,
  CreditCard,
  FileText,
  Gavel,
  Package,
  RefreshCw,
  Scale,
  Shield,
} from 'lucide-react';
import SEO from '../components/SEO';

const STORE_NAME = 'DigiDukaanLive';

/**
 * Consumer-facing policies for online checkout (Razorpay) and related topics.
 * Not legal advice — merchants should have counsel review for their jurisdiction.
 */
const OnlineShopPolicies: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`Payment, refund & cancellation | ${STORE_NAME}`}
        description="How we handle online payments, Razorpay processing, refunds, cancellations, chargebacks, and seller protections at DigiDukaanLive."
        path="/policies"
        robots="index, follow"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" aria-hidden />
          <div className="text-sm text-amber-950">
            <p className="font-semibold">Important notice</p>
            <p className="mt-1 leading-relaxed">
              This page summarises our commercial rules for website checkout and payments. It is
              not personalised legal advice. Nothing here limits your{' '}
              <strong>non-waivable statutory rights</strong> as a consumer under applicable law in
              India. If anything conflicts with mandatory law, the law prevails. For general store
              terms, see our{' '}
              <Link to="/terms" className="text-primary-700 font-semibold hover:underline">
                Terms of Service
              </Link>
              ; for returns after you receive goods, see our{' '}
              <Link to="/refund" className="text-primary-700 font-semibold hover:underline">
                Refund &amp; exchange policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-primary-600 mr-3 shrink-0" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Payment, refund &amp; cancellation
            </h1>
          </div>
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong>{' '}
            {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <nav className="text-sm text-gray-600 mb-10 border-b border-gray-100 pb-6">
            <span className="font-semibold text-gray-900">On this page:</span>{' '}
            <a href="#payments" className="text-primary-600 hover:underline ml-1">
              Payments
            </a>
            {' · '}
            <a href="#fees" className="text-primary-600 hover:underline">
              Fees &amp; deductions
            </a>
            {' · '}
            <a href="#cancellation" className="text-primary-600 hover:underline">
              Cancellation
            </a>
            {' · '}
            <a href="#refunds" className="text-primary-600 hover:underline">
              Refunds
            </a>
            {' · '}
            <a href="#chargebacks" className="text-primary-600 hover:underline">
              Disputes
            </a>
            {' · '}
            <a href="#seller" className="text-primary-600 hover:underline">
              Seller protections
            </a>
          </nav>

          <div className="prose prose-lg max-w-none">
            <section id="payments" className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary-600 shrink-0" />
                1. Online payments
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>1.1 Currency:</strong> All prices and charges on this website are quoted in{' '}
                <strong>Indian Rupees (INR)</strong> unless we state otherwise. Your bank or card
                issuer may apply currency conversion or cross-border fees if your account is not in
                INR — those are solely between you and your financial institution.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>1.2 Payment facilitator:</strong> Card, UPI, netbanking, wallet, and other
                electronic payments for online checkout are processed by{' '}
                <strong>Razorpay Software Private Limited</strong> (or its successors) as a payment
                gateway / aggregator. {STORE_NAME} is the <strong>seller of record</strong> for the
                goods you order; Razorpay is not the seller and does not control fulfilment,
                pricing errors, or product defects.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>1.3 Authorisation &amp; settlement:</strong> When you complete checkout, you
                authorise your payment method to be charged for the order total shown on the payment
                screen (including applicable taxes we display). A successful authorisation does not
                by itself confirm that we will ship — we may still refuse or cancel an order where
                permitted (e.g. obvious pricing error, stock unavailability, fraud check, or legal
                restriction).
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>1.4 Card and bank data:</strong> We do <strong>not</strong> store your full
                card number, CVV, or UPI PIN on our servers. That data is collected and tokenised by
                Razorpay and/or your bank under their security standards. We receive only the
                information needed to reconcile the transaction (for example payment ID, status,
                last four digits of a card where applicable, and amount).
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>1.5 Failed or interrupted payments:</strong> If a payment times out, is
                declined, or shows success in your bank SMS but our systems do not confirm capture,
                your order may remain in <strong>awaiting payment</strong> status. In that case,
                use the <strong>Retry payment</strong> link on your order page or contact us with your
                order reference — we reconcile using gateway and webhook data. Do not assume the
                order is confirmed until our website shows payment as received.
              </p>
            </section>

            <section id="fees" className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary-600 shrink-0" />
                2. Payment processing fees &amp; refund deductions
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>2.1 Gateway fees:</strong> Like most merchants, we pay{' '}
                <strong>non-refundable payment processing fees</strong> to banks and Razorpay on
                each successful charge (typically a percentage plus a fixed component of the
                transaction, subject to Razorpay&apos;s and acquirers&apos; tariff sheets). Those
                fees are incurred when money is captured, even if you later return goods or we agree
                to a refund.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>2.2 Partial refunds:</strong> Where we approve a{' '}
                <strong>partial refund</strong> (for example a goodwill adjustment, partial
                cancellation of one line, or price correction), the refunded amount may be{' '}
                <strong>net of non-recoverable gateway costs</strong> attributable to the original
                payment, unless we tell you otherwise in writing or a higher amount is required by
                mandatory consumer law.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>2.3 Full refunds after capture:</strong> If we owe you a{' '}
                <strong>full reversal</strong> of an online payment (e.g. we cannot fulfil and cancel
                the order), we will refund the <strong>order total you paid</strong> to the original
                payment method where technically possible. In rare cases, network or bank rules may
                prevent a direct reversal; we will then arrange an alternative reasonable settlement
                (such as bank transfer) after verifying your identity and purchase.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>2.4 Cash on delivery:</strong> If we offer COD in future, separate fees or
                handling charges may apply and will be disclosed before you confirm the order.
              </p>
            </section>

            <section id="cancellation" className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Ban className="h-6 w-6 text-primary-600 shrink-0" />
                3. Order cancellation
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>3.1 Before payment (awaiting payment):</strong> You may{' '}
                <strong>cancel</strong> an order from your account while it is still in{' '}
                <strong>awaiting payment</strong> status, using the
                cancel action we provide. No payment will have been captured by us for that order; no
                refund is needed.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>3.2 After payment, before fulfilment:</strong> If you ask to cancel after
                payment has been captured but before we have dispatched or clearly started custom
                preparation, we may approve cancellation at our discretion. If we approve, we will
                initiate a refund to the original payment method subject to section 2 (including
                timing and any lawful deductions).
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>3.3 After dispatch or pickup:</strong> Cancellation is generally treated as a{' '}
                <strong>return or exchange</strong> under our{' '}
                <Link to="/refund" className="text-primary-600 hover:underline">
                  Refund &amp; exchange policy
                </Link>
                , not a simple button cancellation.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>3.4 Our right to cancel:</strong> We may cancel or refuse any order (with or
                without prior notice) for reasons including but not limited to: suspected fraud or
                abuse, stock shortage, pricing or listing errors, inability to verify shipping
                details, export or legal restrictions, or force majeure. If we cancel after taking
                payment, we will refund the charged amount except to the extent we are permitted to
                withhold amounts for goods already consumed, customised, or clearly described as
                non-cancellable.
              </p>
            </section>

            <section id="refunds" className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-primary-600 shrink-0" />
                4. Refunds (online orders)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>4.1 General:</strong> Physical product returns, exchanges, and defect handling
                follow our{' '}
                <Link to="/refund" className="text-primary-600 hover:underline">
                  Refund &amp; exchange policy
                </Link>
                . This section adds rules specific to <strong>prepaid online</strong> orders.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>4.2 Method and timing:</strong> Approved refunds are sent to the{' '}
                <strong>original payment method</strong> where the card network / UPI / bank rules
                allow reversals. Settlement typically takes <strong>5–15 business days</strong> after
                we submit the refund, depending on Razorpay and your bank — weekends, public holidays,
                and bank processing backlogs are outside our control.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>4.3 No “double recovery”:</strong> You may not retain the goods{' '}
                <em>and</em> receive a full refund unless we explicitly authorise that outcome (for
                example we tell you to keep a low-value damaged item). If you receive a refund, title
                to any returned goods reverts to us as applicable.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>4.4 Promotional credit:</strong> If part of your order was paid with store
                credit or a voucher, refunds may be re-credited to the same instrument or another
                method we specify, so that the economics of the promotion remain fair.
              </p>
            </section>

            <section id="chargebacks" className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Gavel className="h-6 w-6 text-primary-600 shrink-0" />
                5. Chargebacks, bank disputes &amp; misuse
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.1 Contact us first:</strong> If you believe there is an unauthorised charge
                or a problem with fulfilment, contact us with your order reference{' '}
                <strong>before</strong> filing a chargeback or payment dispute with your bank. We will
                investigate in good faith. Abrupt chargebacks on valid, delivered orders may attract
                fees from our processor and slow resolution.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.2 Evidence:</strong> We may submit order details, delivery or pickup records,
                IP and device metadata, communication logs, and payment confirmation data to Razorpay
                or the bank as evidence in a dispute.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>5.3 Fraud:</strong> We reserve the right to refuse future orders, close accounts,
                and cooperate with law enforcement or Razorpay fraud teams if we detect stolen payment
                instruments, synthetic identities, refund abuse, or collusion.
              </p>
            </section>

            <section id="seller" className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-6 w-6 text-primary-600 shrink-0" />
                6. Seller protections &amp; disclaimers
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>6.1 Product and packaging variance:</strong> Minor colour, batch, or packaging
                differences from website photos may occur; such differences alone do not constitute
                a defect unless we have materially misdescribed the SKU.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>6.2 Age and safety:</strong> Parents and guardians are responsible for choosing
                age-appropriate toys and supervising play. See our Terms for full safety disclaimers.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>6.3 Limitation of liability:</strong> To the maximum extent permitted by law,
                our aggregate liability for any order is limited to the <strong>amount you paid</strong>{' '}
                for that order, except where liability cannot be limited by law.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>6.4 Changes:</strong> We may update this page; the &quot;Last updated&quot; date
                will change. Continued use of online checkout after updates constitutes your acceptance
                of the revised policy for new transactions, except where prior law requires notice or
                consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary-600 shrink-0" />
                7. Related documents
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <Link to="/terms" className="text-primary-600 hover:underline">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/refund" className="text-primary-600 hover:underline">
                    Refund &amp; exchange policy
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  (how we process personal and payment-related data)
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineShopPolicies;

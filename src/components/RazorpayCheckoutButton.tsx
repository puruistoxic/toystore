import React, { useCallback, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import {
  openRazorpayCheckout,
  type RazorpayFailureResponse,
  type RazorpaySuccessResponse,
} from '../utils/razorpay';

type RazorpayCheckoutButtonProps = {
  /** Amount in paise (default) or rupees if `amountInRupees` is true. */
  amount: number;
  amountInRupees?: boolean;
  currency?: string;
  /** Store / business name shown inside the Razorpay modal. */
  name: string;
  description?: string;
  /** Logo URL shown inside the Razorpay modal. */
  image?: string;
  receipt?: string;
  notes?: Record<string, string>;
  prefill?: { name?: string; email?: string; contact?: string };
  themeColor?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onPaid?: (response: RazorpaySuccessResponse, verified: boolean) => void;
  onFailed?: (response: RazorpayFailureResponse) => void;
  onDismiss?: () => void;
  /** Called when create-order or script load fails. */
  onError?: (error: unknown) => void;
};

/**
 * Reusable Razorpay Standard Checkout button.
 *
 * Usage:
 *   <RazorpayCheckoutButton
 *     amount={49900}              // ₹499 in paise
 *     name="Khandelwal Toy Store"
 *     description="Cart #ABC-123"
 *     prefill={{ name, email, contact }}
 *     onPaid={(resp, verified) => { ... }}
 *   />
 */
const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amount,
  amountInRupees,
  currency = 'INR',
  name,
  description,
  image,
  receipt,
  notes,
  prefill,
  themeColor,
  disabled,
  className,
  children,
  onPaid,
  onFailed,
  onDismiss,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await openRazorpayCheckout({
        amount,
        amountInRupees,
        currency,
        name,
        description,
        image,
        receipt,
        notes,
        prefill,
        themeColor,
        onSuccess: (response, verified) => {
          setLoading(false);
          onPaid?.(response, verified);
        },
        onFailure: (response) => {
          setLoading(false);
          onFailed?.(response);
        },
        onDismiss: () => {
          setLoading(false);
          onDismiss?.();
        },
      });
    } catch (err) {
      setLoading(false);
      console.error('[RazorpayCheckoutButton]', err);
      onError?.(err);
    }
  }, [
    loading,
    disabled,
    amount,
    amountInRupees,
    currency,
    name,
    description,
    image,
    receipt,
    notes,
    prefill,
    themeColor,
    onPaid,
    onFailed,
    onDismiss,
    onError,
  ]);

  const defaultClasses =
    'inline-flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-primary-600 text-white font-display font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-md px-6 transition-colors';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={className ?? defaultClasses}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Opening Razorpay…
        </>
      ) : (
        children ?? (
          <>
            <CreditCard className="h-5 w-5" />
            Pay online
          </>
        )
      )}
    </button>
  );
};

export default RazorpayCheckoutButton;

/**
 * Razorpay Standard Web Checkout — frontend helper.
 *
 * Loads the official checkout script once and exposes a typed
 * `openRazorpayCheckout` helper. Credentials are NEVER hardcoded here:
 * - `key_id` comes from REACT_APP_RAZORPAY_KEY_ID, or — preferred — from
 *   the `GET /api/payments/config` endpoint (so rotating the key never
 *   requires a frontend rebuild).
 * - `key_secret` lives only on the server.
 */
import api from './api';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayFailureResponse = {
  error: {
    code: string;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
};

export type RazorpayOptions = {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void; escape?: boolean; backdropclose?: boolean };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: 'payment.failed', cb: (resp: RazorpayFailureResponse) => void) => void;
  close: () => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

let scriptPromise: Promise<void> | null = null;

/** Lazily inject the Razorpay checkout script (idempotent). */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only load in the browser'));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`,
    );
    if (existing && window.Razorpay) {
      resolve();
      return;
    }
    const script = existing ?? document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve();
      else reject(new Error('Razorpay script loaded but window.Razorpay is undefined'));
    };
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Failed to load Razorpay checkout script'));
    };
    if (!existing) document.body.appendChild(script);
  });

  return scriptPromise;
}

type CreateOrderInput = {
  /** Amount in paise (recommended) OR rupees if `amountInRupees: true` */
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  amountInRupees?: boolean;
};

export type CreateOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
  key_id: string;
};

/** Calls POST /api/payments/create-order on our backend. */
export async function createRazorpayOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResponse> {
  const res = await api.post('/payments/create-order', input);
  return res.data as CreateOrderResponse;
}

export type VerifyPaymentResponse = {
  verified: boolean;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  error?: string;
};

/** Calls POST /api/payments/verify-payment on our backend. */
export async function verifyRazorpayPayment(
  payload: RazorpaySuccessResponse,
): Promise<VerifyPaymentResponse> {
  const res = await api.post('/payments/verify-payment', payload);
  return res.data as VerifyPaymentResponse;
}

let cachedConfigKey: string | null = null;

/**
 * Resolves the public Razorpay key id.
 *
 * Priority:
 *  1. Build-time CRA env (`REACT_APP_RAZORPAY_KEY_ID`)
 *  2. Runtime fetch from `GET /api/payments/config`
 *
 * This means deploying a new key (rotating in the Razorpay dashboard) only
 * requires updating server `.env` — the frontend does not need a rebuild.
 */
export async function getRazorpayKeyId(): Promise<string> {
  const envKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
  if (envKey && envKey.trim()) return envKey.trim();
  if (cachedConfigKey) return cachedConfigKey;
  const res = await api.get('/payments/config');
  const key = res.data?.key_id;
  if (!key || typeof key !== 'string') {
    throw new Error('Razorpay key id not configured on server');
  }
  cachedConfigKey = key;
  return key;
}

export type OpenCheckoutInput = {
  amount: number; // paise (or rupees with amountInRupees)
  amountInRupees?: boolean;
  currency?: string;
  /** Business / store name shown in the modal */
  name: string;
  description?: string;
  image?: string;
  receipt?: string;
  notes?: Record<string, string>;
  prefill?: { name?: string; email?: string; contact?: string };
  themeColor?: string;
  onSuccess?: (response: RazorpaySuccessResponse, verified: boolean) => void;
  onFailure?: (response: RazorpayFailureResponse) => void;
  onDismiss?: () => void;
  /** When true (default), verify the signature on success before resolving. */
  verifyOnSuccess?: boolean;
};

/**
 * One-shot helper that:
 *   1. ensures the script is loaded,
 *   2. creates an order via our backend,
 *   3. opens the Razorpay modal,
 *   4. verifies the signature on success (via our backend),
 *   5. fires the corresponding callback.
 *
 * Throws if order creation fails; UI errors (modal dismiss / payment failed)
 * are reported via `onDismiss` / `onFailure` callbacks.
 */
export async function openRazorpayCheckout(input: OpenCheckoutInput): Promise<void> {
  const verifyOnSuccess = input.verifyOnSuccess !== false;

  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error('Razorpay SDK failed to load');
  }

  const order = await createRazorpayOrder({
    amount: input.amount,
    amountInRupees: input.amountInRupees,
    currency: input.currency || 'INR',
    receipt: input.receipt,
    notes: input.notes,
  });

  const keyId = order.key_id || (await getRazorpayKeyId());

  const options: RazorpayOptions = {
    key: keyId,
    amount: order.amount,
    currency: order.currency,
    name: input.name,
    description: input.description,
    image: input.image,
    order_id: order.order_id,
    prefill: input.prefill,
    notes: input.notes,
    theme: { color: input.themeColor || '#0d9488' },
    handler: async (response) => {
      if (!verifyOnSuccess) {
        input.onSuccess?.(response, false);
        return;
      }
      try {
        const result = await verifyRazorpayPayment(response);
        input.onSuccess?.(response, !!result.verified);
      } catch (err) {
        console.error('[Razorpay] verify failed', err);
        input.onSuccess?.(response, false);
      }
    },
    modal: {
      ondismiss: () => input.onDismiss?.(),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (resp) => {
    console.error('[Razorpay] payment.failed', resp);
    input.onFailure?.(resp);
  });
  rzp.open();
}

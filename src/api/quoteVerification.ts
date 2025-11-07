const simulatedLatency = (min = 350, max = 900) =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));

const verificationStore = new Map<
  string,
  { code: string; expiresAt: number; attempts: number; reference: string }
>();

export interface VerificationRequest {
  email: string;
  name: string;
  itemName: string;
  channel: 'email';
  messagePreview: string;
}

export interface VerificationResponse {
  reference: string;
  expiresAt: number;
  code: string; // only surfaced in stub mode
}

export type VerificationStatus = 'verified' | 'invalid' | 'expired' | 'not_found';

export const sendVerificationCode = async (
  payload: VerificationRequest
): Promise<VerificationResponse> => {
  await simulatedLatency();

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const reference = `WV-${Date.now().toString(36).toUpperCase()}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  verificationStore.set(payload.email.toLowerCase(), {
    code,
    expiresAt,
    attempts: 0,
    reference
  });

  // Stub feedback for developers – replace with actual email delivery
  console.info('[quoteVerification] Email OTP dispatched (stub)', {
    to: payload.email,
    reference,
    code,
    preview: payload.messagePreview.substring(0, 120)
  });

  return { reference, expiresAt, code };
};

export const verifyCode = async (
  email: string,
  code: string
): Promise<VerificationStatus> => {
  await simulatedLatency();

  const record = verificationStore.get(email.toLowerCase());
  if (!record) {
    return 'not_found';
  }

  if (Date.now() > record.expiresAt) {
    verificationStore.delete(email.toLowerCase());
    return 'expired';
  }

  if (record.code === code.trim()) {
    verificationStore.delete(email.toLowerCase());
    return 'verified';
  }

  record.attempts += 1;
  if (record.attempts >= 5) {
    verificationStore.delete(email.toLowerCase());
    return 'invalid';
  }

  return 'invalid';
};


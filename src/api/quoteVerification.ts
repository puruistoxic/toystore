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
  code?: string; // only surfaced in development/stub mode
}

export type VerificationStatus = 'verified' | 'invalid' | 'expired' | 'not_found';

// API base URL - use environment variable or default to relative path
// For local development, use localhost:3001, otherwise use the configured API URL
const getApiBaseUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  return isDevelopment 
    ? 'http://localhost:3001/api'
    : (process.env.REACT_APP_API_URL || '/api');
};

const API_BASE_URL = getApiBaseUrl();

export const sendVerificationCode = async (
  payload: VerificationRequest
): Promise<VerificationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email,
        name: payload.name,
        itemName: payload.itemName,
        messagePreview: payload.messagePreview
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send verification code');
    }

    const data = await response.json();
    return {
      reference: data.reference,
      expiresAt: data.expiresAt,
      // Don't return code in production for security
      code: process.env.NODE_ENV === 'development' ? undefined : undefined
    };
  } catch (error) {
    console.error('[quoteVerification] Error sending verification code:', error);
    throw error;
  }
};

export const verifyCode = async (
  email: string,
  code: string
): Promise<VerificationStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        code
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify code');
    }

    const data = await response.json();
    return data.status as VerificationStatus;
  } catch (error) {
    console.error('[quoteVerification] Error verifying code:', error);
    return 'invalid';
  }
};


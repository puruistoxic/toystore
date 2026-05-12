import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import customerApi, { getCustomerToken, setCustomerToken } from '../utils/customerApi';

export type CustomerProfile = {
  id: number;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  email_verified: boolean;
  phone_verified: boolean;
};

export type AuthProviders = {
  magic_link: boolean;
  google: boolean;
  whatsapp_otp: boolean;
};

type CustomerAuthContextValue = {
  customer: CustomerProfile | null;
  loading: boolean;
  providers: AuthProviders;
  /** Calls /me using the existing token; updates context state. */
  refresh: () => Promise<void>;
  /** Persist a token after a successful sign-in and load the profile. */
  setSession: (token: string, profile?: CustomerProfile | null) => Promise<void>;
  logout: () => void;
  /** Update editable profile fields (PATCH /me). */
  updateProfile: (patch: Partial<Pick<CustomerProfile, 'full_name' | 'phone'>>) => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

const DEFAULT_PROVIDERS: AuthProviders = {
  magic_link: true,
  google: false,
  whatsapp_otp: false,
};

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [providers, setProviders] = useState<AuthProviders>(DEFAULT_PROVIDERS);

  const refresh = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      setCustomer(null);
      setLoading(false);
      return;
    }
    try {
      const res = await customerApi.get<{ customer: CustomerProfile }>('/customer/auth/me');
      setCustomer(res.data.customer);
    } catch (err: unknown) {
      const status =
        (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        setCustomerToken(null);
        setCustomer(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const setSession = useCallback(
    async (token: string, profile?: CustomerProfile | null) => {
      setCustomerToken(token);
      if (profile) {
        setCustomer(profile);
        setLoading(false);
      } else {
        await refresh();
      }
    },
    [refresh],
  );

  const logout = useCallback(() => {
    setCustomerToken(null);
    setCustomer(null);
    customerApi.post('/customer/auth/logout').catch(() => {
      /* stateless server side — ignore */
    });
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Pick<CustomerProfile, 'full_name' | 'phone'>>) => {
      await customerApi.patch('/customer/auth/me', patch);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
    customerApi
      .get<AuthProviders>('/customer/auth/providers')
      .then((r) => setProviders({ ...DEFAULT_PROVIDERS, ...r.data }))
      .catch(() => {
        /* keep defaults */
      });
  }, [refresh]);

  const value = useMemo(
    () => ({ customer, loading, providers, refresh, setSession, logout, updateProfile }),
    [customer, loading, providers, refresh, setSession, logout, updateProfile],
  );

  return (
    <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return ctx;
}

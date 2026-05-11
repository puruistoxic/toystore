import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import {
  isValidIndianPincode,
  normalizePincode,
  parseServicePincodesJson,
  type ServicePincodeEntry,
} from '../utils/servicePincodes';

const STORAGE_KEY = 'digidukaanlive_delivery_pincode';

export type PublicCompanyPins = {
  service_pincodes: ServicePincodeEntry[];
  service_area_pin_required: boolean;
};

type ServiceAreaContextValue = {
  /** Allowed list from server (empty = no geo restriction) */
  servicePincodes: ServicePincodeEntry[];
  pinRequired: boolean;
  /** User’s chosen 6-digit pincode or '' */
  deliveryPincode: string;
  /** Friendly label from store config, or pincode */
  deliveryLabel: string;
  setDeliveryPincode: (pin: string) => void;
  clearDeliveryPincode: () => void;
  isPincodeAllowed: (pin: string) => boolean;
  hasValidDeliveryPincode: boolean;
};

const ServiceAreaContext = createContext<ServiceAreaContextValue | undefined>(undefined);

function readStoredPincode(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return '';
    const o = JSON.parse(raw) as { pincode?: string };
    const p = normalizePincode(o?.pincode ?? '');
    return isValidIndianPincode(p) ? p : '';
  } catch {
    return '';
  }
}

function writeStoredPincode(pincode: string) {
  try {
    if (!pincode) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify({ pincode }));
  } catch {
    /* ignore */
  }
}

export function ServiceAreaProvider({ children }: { children: ReactNode }) {
  const [deliveryPincode, setDeliveryPincodeState] = useState<string>('');

  const { data: publicPins } = useQuery({
    queryKey: ['company-settings-public'],
    queryFn: async () => {
      const res = await api.get<PublicCompanyPins>('/content/company-settings/public');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const servicePincodes = useMemo(
    () => parseServicePincodesJson(publicPins?.service_pincodes ?? []),
    [publicPins?.service_pincodes],
  );

  const pinRequired = Boolean(publicPins?.service_area_pin_required && servicePincodes.length > 0);

  useEffect(() => {
    const stored = readStoredPincode();
    if (stored) setDeliveryPincodeState(stored);
  }, []);

  const setDeliveryPincode = useCallback((pin: string) => {
    const p = normalizePincode(pin);
    setDeliveryPincodeState(isValidIndianPincode(p) ? p : '');
    writeStoredPincode(isValidIndianPincode(p) ? p : '');
  }, []);

  const clearDeliveryPincode = useCallback(() => {
    setDeliveryPincodeState('');
    writeStoredPincode('');
  }, []);

  const isPincodeAllowed = useCallback(
    (pin: string) => {
      const p = normalizePincode(pin);
      if (!isValidIndianPincode(p)) return false;
      if (!pinRequired) return true;
      return servicePincodes.some((e) => e.pincode === p);
    },
    [pinRequired, servicePincodes],
  );

  const deliveryLabel = useMemo(() => {
    if (!deliveryPincode) return '';
    const hit = servicePincodes.find((e) => e.pincode === deliveryPincode);
    return hit?.label || deliveryPincode;
  }, [deliveryPincode, servicePincodes]);

  const hasValidDeliveryPincode = useMemo(() => {
    if (!isValidIndianPincode(deliveryPincode)) return false;
    if (!pinRequired) return true;
    return isPincodeAllowed(deliveryPincode);
  }, [deliveryPincode, pinRequired, isPincodeAllowed]);

  const value = useMemo<ServiceAreaContextValue>(
    () => ({
      servicePincodes,
      pinRequired,
      deliveryPincode,
      deliveryLabel,
      setDeliveryPincode,
      clearDeliveryPincode,
      isPincodeAllowed,
      hasValidDeliveryPincode,
    }),
    [
      servicePincodes,
      pinRequired,
      deliveryPincode,
      deliveryLabel,
      setDeliveryPincode,
      clearDeliveryPincode,
      isPincodeAllowed,
      hasValidDeliveryPincode,
    ],
  );

  return <ServiceAreaContext.Provider value={value}>{children}</ServiceAreaContext.Provider>;
}

export function useServiceArea() {
  const ctx = useContext(ServiceAreaContext);
  if (!ctx) {
    throw new Error('useServiceArea must be used within ServiceAreaProvider');
  }
  return ctx;
}

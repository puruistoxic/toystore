import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Check } from 'lucide-react';
import { useServiceArea } from '../contexts/ServiceAreaContext';
import { isValidIndianPincode, normalizePincode } from '../utils/servicePincodes';

interface DeliveryPincodeControlProps {
  /** Light-on-dark header (home hero) */
  variant?: 'default' | 'onDark';
}

const DeliveryPincodeControl: React.FC<DeliveryPincodeControlProps> = ({ variant = 'default' }) => {
  const {
    pinRequired,
    servicePincodes,
    deliveryPincode,
    deliveryLabel,
    setDeliveryPincode,
    clearDeliveryPincode,
    hasValidDeliveryPincode,
    isPincodeAllowed,
  } = useServiceArea();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (open) {
      setDraft(deliveryPincode || '');
      setLocalError('');
    }
  }, [open, deliveryPincode]);

  const onDark = variant === 'onDark';
  const btnClass = onDark
    ? `max-w-[11rem] sm:max-w-[13rem] min-h-[44px] rounded-full border-2 px-3 py-2 text-left text-xs sm:text-sm font-display font-semibold shadow-md transition-all border-brand-sunshine/90 bg-white/15 text-white hover:bg-white/25 ${
        pinRequired && !hasValidDeliveryPincode ? 'ring-2 ring-amber-300' : ''
      }`
    : `max-w-[11rem] sm:max-w-[13rem] min-h-[44px] rounded-full border-2 px-3 py-2 text-left text-xs sm:text-sm font-display font-semibold shadow-md transition-all border-primary-200 bg-white text-gray-800 hover:bg-primary-50 hover:border-primary-400 ${
        pinRequired && !hasValidDeliveryPincode ? 'ring-2 ring-amber-400 ring-offset-1' : ''
      }`;

  const apply = () => {
    const p = normalizePincode(draft);
    if (!p) {
      if (pinRequired) {
        setLocalError('Enter your 6-digit delivery pincode.');
        return;
      }
      clearDeliveryPincode();
      setOpen(false);
      return;
    }
    if (!isValidIndianPincode(p)) {
      setLocalError('Pincode must be exactly 6 digits.');
      return;
    }
    if (pinRequired && !isPincodeAllowed(p)) {
      setLocalError('Sorry — we do not serve this pincode yet. Pick one from the list or visit the store.');
      return;
    }
    setDeliveryPincode(p);
    setOpen(false);
  };

  if (!pinRequired && servicePincodes.length === 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={btnClass}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={pinRequired ? 'Set delivery pincode' : 'Optional delivery pincode'}
      >
        <span className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          <span className="truncate">
            {hasValidDeliveryPincode ? (
              <>
                <span className="block leading-tight opacity-90">Deliver to</span>
                <span className="block font-bold leading-tight">{deliveryLabel}</span>
              </>
            ) : pinRequired ? (
              <span className="font-bold">Set delivery pincode</span>
            ) : (
              <span className="font-bold">Delivery area</span>
            )}
          </span>
        </span>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[260] flex items-center justify-center p-4" role="presentation">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pincode-dialog-title"
              className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 id="pincode-dialog-title" className="text-lg font-bold text-gray-900 font-display">
                    Delivery pincode
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {pinRequired
                      ? 'We currently accept orders only from the pincodes below. You can change this anytime before checkout.'
                      : 'Optional — helps us confirm delivery or pickup options for your area.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {servicePincodes.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Served areas
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {servicePincodes.map((e) => (
                      <button
                        key={e.pincode}
                        type="button"
                        onClick={() => {
                          setDraft(e.pincode);
                          setLocalError('');
                        }}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                          normalizePincode(draft) === e.pincode
                            ? 'border-primary-600 bg-primary-50 text-primary-800'
                            : 'border-gray-200 bg-gray-50 text-gray-800 hover:border-primary-300'
                        }`}
                      >
                        {e.pincode}
                        {e.label !== e.pincode ? ` · ${e.label}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700 mb-1">Your pincode</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                value={draft}
                onChange={(e) => {
                  setDraft(normalizePincode(e.target.value));
                  setLocalError('');
                }}
                placeholder="e.g. 394101"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg tracking-widest font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
              />
              {localError ? <p className="mt-2 text-sm text-red-600">{localError}</p> : null}

              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                {!pinRequired && (
                  <button
                    type="button"
                    onClick={() => {
                      clearDeliveryPincode();
                      setOpen(false);
                    }}
                    className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={apply}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  <Check className="h-4 w-4" aria-hidden />
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default DeliveryPincodeControl;

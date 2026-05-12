import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import SEO from '../../components/SEO';
import customerApi from '../../utils/customerApi';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

/**
 * Handles two redirect shapes:
 *   1. Magic-link email → /account/verify?token=<raw>&redirect=/...
 *   2. Google OAuth callback bounce → /account/verify#provider=google&token=<jwt>
 */
const MagicLinkVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useCustomerAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    const redirectTo = params.get('redirect') || hashParams.get('redirect') || '/account';

    // Google OAuth bounce: token already minted by server
    const oauthToken = hashParams.get('token');
    if (oauthToken) {
      setSession(oauthToken)
        .then(() => {
          setStatus('success');
          // Strip fragment for cleanliness
          navigate(redirectTo, { replace: true });
        })
        .catch(() => {
          setStatus('error');
          setError('Could not complete sign-in. Please try again.');
        });
      return;
    }

    const magicToken = params.get('token');
    if (!magicToken) {
      setStatus('error');
      setError('No sign-in token in this link.');
      return;
    }

    customerApi
      .post<{ token: string; customer: import('../../contexts/CustomerAuthContext').CustomerProfile }>(
        '/customer/auth/magic-link/verify',
        { token: magicToken },
      )
      .then(async (res) => {
        await setSession(res.data.token, res.data.customer);
        setStatus('success');
        navigate(redirectTo, { replace: true });
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'This sign-in link is invalid or has expired.';
        setStatus('error');
        setError(msg);
      });
  }, [location.search, location.hash, navigate, setSession]);

  return (
    <>
      <SEO
        title="Verifying sign-in · DigiDukaanLive"
        description="Completing your DigiDukaanLive sign-in."
        path="/account/verify"
        robots="noindex, nofollow"
      />
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-md text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Signing you in…</p>
            </>
          )}
          {status === 'success' && (
            <>
              <ShieldCheck className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Signed in. Redirecting…</p>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-gray-900 font-display font-bold text-lg mb-2">
                Could not sign in
              </p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <Link
                to="/account/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700"
              >
                Request a new sign-in link
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MagicLinkVerifyPage;

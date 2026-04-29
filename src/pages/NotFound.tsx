import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import SEO from '../components/SEO';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const path = location.pathname;
        const { data } = await api.get('/content/redirects/check', {
          params: { path }
        });
        
        if (data.redirect && data.to) {
          // Redirect found - navigate to new URL
          window.location.href = data.to; // Use window.location for proper 301 redirect
          return;
        }
      } catch (error) {
        // Ignore errors, just show 404
      } finally {
        setCheckingRedirect(false);
      }
    };

    checkRedirect();
  }, [location.pathname]);

  if (checkingRedirect) {
    return (
      <>
        <SEO title="Checking… | DigiDukaanLive" description="Loading page." path={location.pathname} robots="noindex, nofollow" />
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
            <p className="mt-4 text-gray-600 text-sm">Checking redirects...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Page not found | DigiDukaanLive"
        description="We couldn't find this page on DigiDukaanLive. Browse our catalogue from the home page."
        path={location.pathname}
        robots="noindex, nofollow"
      />
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="max-w-xl w-full text-center bg-white shadow-md rounded-2xl px-6 py-10 border border-gray-100">
        <p className="text-sm font-semibold text-teal-600 mb-2">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          We couldn't find any content at{' '}
          <span className="font-mono text-gray-800 break-all">{location.pathname}</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex justify-center px-4 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go back
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex justify-center px-5 py-2.5 rounded-full bg-teal-600 text-sm font-medium text-white hover:bg-teal-700 shadow-sm"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}



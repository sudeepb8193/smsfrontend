import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BadgeCheck, LoaderCircle, MailCheck } from 'lucide-react';
import { verifyOrganisationContactEmail } from '../../organisation/api/organisationApi';

export default function ContactEmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [result, setResult] = useState(() => ({
    status: token ? 'loading' : 'error',
    message: token ? '' : 'This verification link is missing its token.',
  }));

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    verifyOrganisationContactEmail(token)
      .then((response) => {
        if (active) setResult({ status: 'success', message: response.message });
      })
      .catch((error) => {
        if (active) setResult({ status: 'error', message: error.message });
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {result.status === 'loading' ? (
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-primary-600" />
        ) : result.status === 'success' ? (
          <BadgeCheck className="mx-auto h-12 w-12 text-emerald-600" />
        ) : (
          <MailCheck className="mx-auto h-12 w-12 text-rose-500" />
        )}
        <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          {result.status === 'loading'
            ? 'Verifying contact email'
            : result.status === 'success'
              ? 'Email verified'
              : 'Verification unsuccessful'}
        </h1>
        <p role={result.status === 'error' ? 'alert' : 'status'} className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {result.status === 'loading' ? 'Please wait while we validate your verification link.' : result.message}
        </p>
        {result.status !== 'loading' && (
          <Link to="/login" className="mt-6 inline-flex rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
            Go to login
          </Link>
        )}
      </section>
    </main>
  );
}

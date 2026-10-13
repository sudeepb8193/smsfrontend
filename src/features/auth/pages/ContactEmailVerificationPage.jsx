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
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] px-4">
      <section className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center shadow-sm">
        {result.status === 'loading' ? (
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-primary-500" />
        ) : result.status === 'success' ? (
          <BadgeCheck className="mx-auto h-12 w-12 text-emerald-500" />
        ) : (
          <MailCheck className="mx-auto h-12 w-12 text-rose-500" />
        )}
        <h1 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
          {result.status === 'loading'
            ? 'Verifying contact email'
            : result.status === 'success'
              ? 'Email verified'
              : 'Verification unsuccessful'}
        </h1>
        <p role={result.status === 'error' ? 'alert' : 'status'} className="mt-2 text-sm text-[var(--text-secondary)]">
          {result.status === 'loading' ? 'Please wait while we validate your verification link.' : result.message}
        </p>
        {result.status !== 'loading' && (
          <Link to="/login" className="mt-6 inline-flex rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">
            Go to login
          </Link>
        )}
      </section>
    </main>
  );
}

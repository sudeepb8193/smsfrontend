import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, MailCheck } from 'lucide-react';
import Loader from '../../../components/shared/Loader';
import { useContactEmailVerification } from '../hooks/useAuth';

export default function ContactEmailVerificationPage() {
  const { result } = useContactEmailVerification();

  if (result.status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] px-4">
        <div className="w-full max-w-md">
          <Loader type="card" text="Verifying contact email..." />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] px-4">
      <section className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center shadow-sm">
        {result.status === 'success' ? (
          <BadgeCheck className="mx-auto h-12 w-12 text-emerald-500" />
        ) : (
          <MailCheck className="mx-auto h-12 w-12 text-rose-500" />
        )}
        <h1 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
          {result.status === 'success' ? 'Email verified' : 'Verification unsuccessful'}
        </h1>
        <p role={result.status === 'error' ? 'alert' : 'status'} className="mt-2 text-sm text-[var(--text-secondary)]">
          {result.message}
        </p>
        <Link to="/login" className="mt-6 inline-flex rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">
          Go to login
        </Link>
      </section>
    </main>
  );
}

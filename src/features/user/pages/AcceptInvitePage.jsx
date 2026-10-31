import React from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Building,
} from 'lucide-react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Loader from '../../../components/shared/Loader';
import ErrorMessage from '../../../components/shared/ErrorMessage';
import { useAcceptInvite } from '../hooks/useUser';

export const AcceptInvitePage = () => {
  const {
    verifying,
    tokenStatus,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    submitting,
    success,
    errorMsg,
    rules,
    isPasswordValid,
    handleSubmit,
    navigate,
  } = useAcceptInvite();

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-app)]">
        <Loader text="Verifying invitation security token..." size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-app)]">
      <Card className="w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/25 mb-2">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
            SalonFlow Pro
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Production Multi-Tenant Salon Management Platform
          </p>
        </div>

        {/* Expired or Invalid Token State */}
        {!tokenStatus?.valid ? (
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 space-y-2">
              <div className="flex items-center justify-center gap-2 font-bold text-sm">
                <Clock size={18} />
                <span>{tokenStatus?.expired ? 'Invitation Expired' : 'Invalid Invitation'}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {tokenStatus?.message || 'This invitation link cannot be verified.'}
              </p>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              For security, single-use invitation links expire after 7 days. Please ask your salon owner or administrator to resend your invite from the User Management directory.
            </p>

            <Button
              variant="secondary"
              fullWidth
              size="large"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </div>
        ) : success ? (
          /* Success Activation State */
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Account Successfully Activated!
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Your password has been securely established. You can now log into your salon workspace.
              </p>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="large"
              icon={ArrowRight}
              onClick={() => navigate('/login')}
            >
              Proceed to Login
            </Button>
          </div>
        ) : (
          /* Password Setup Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Greeting & Org info */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-500/15 text-primary-400 shrink-0">
                <Building size={18} />
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {tokenStatus?.user?.organization?.name || 'Salon Workspace'}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  Welcome, <strong className="text-[var(--text-secondary)]">{tokenStatus?.user?.displayName}</strong> ({tokenStatus?.user?.email || tokenStatus?.user?.phoneNumber})
                </div>
              </div>
            </div>

            {errorMsg && <ErrorMessage message={errorMsg} />}

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-secondary)]">
                Create Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3.5 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:border-primary-500 text-[var(--text-primary)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-secondary)]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3.5 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:border-primary-500 text-[var(--text-primary)] transition-colors"
                />
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-2 text-[11px]">
              <div className="font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Sparkles size={12} className="text-primary-500" />
                <span>Password Requirements</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${rules.length ? 'text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                  <CheckCircle2 size={12} />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${rules.upper ? 'text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                  <CheckCircle2 size={12} />
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${rules.lower ? 'text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                  <CheckCircle2 size={12} />
                  <span>Lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${rules.number ? 'text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                  <CheckCircle2 size={12} />
                  <span>Number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${rules.special ? 'text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                  <CheckCircle2 size={12} />
                  <span>Special symbol</span>
                </div>
                <div className={`flex items-center gap-1.5 ${rules.match ? 'text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                  <CheckCircle2 size={12} />
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={!isPasswordValid || submitting}
              loading={submitting}
            >
              Set Password & Activate Account
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default AcceptInvitePage;

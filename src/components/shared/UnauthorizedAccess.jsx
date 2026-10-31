import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, HelpCircle } from 'lucide-react';
import Card from './Card';
import Button from './Button';

export const UnauthorizedAccess = ({
  title = 'Access Restricted',
  message = 'You do not have the necessary permissions or branch scope required to perform this action.',
  requiredPermission = null,
  requiredRole = null,
  resourceName = null,
  isInline = false,
  showHomeButton = true,
  showBackButton = true,
  onRetry = null,
}) => {
  const navigate = useNavigate();

  const content = (
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 select-none">
      <div className="w-16 h-16 rounded-2xl bg-danger-500/10 text-danger-500 border border-danger-500/20 flex items-center justify-center mb-4 shadow-inner">
        <ShieldAlert size={32} />
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight mb-2">
        {title}
      </h2>

      <p className="text-sm text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {showBackButton && (
          <Button
            variant="secondary"
            size="medium"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        )}

        {showHomeButton && (
          <Button
            variant="primary"
            size="medium"
            icon={Home}
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        )}

        {onRetry && (
          <Button
            variant="outline"
            size="medium"
            onClick={onRetry}
          >
            Retry Verification
          </Button>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 justify-center">
        <HelpCircle size={13} className="text-[var(--text-muted)]" />
        Need elevated rights? Contact your Organization Owner or Super Administrator.
      </div>
    </div>
  );

  if (isInline) {
    return <Card className="border-danger-500/20 bg-danger-500/[0.02]">{content}</Card>;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-2xl border-[var(--border-color)]">{content}</Card>
    </div>
  );
};

export default UnauthorizedAccess;

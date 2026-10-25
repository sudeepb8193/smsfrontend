import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Subtle reassurance security message badge matching the design mock
 */
export const SecurityReassurance = ({
  text = 'Your data is safe with us. We use industry-standard security practices to protect your information.',
}) => {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-primary-500/5 border border-primary-500/20 text-slate-600 text-xs leading-relaxed select-none">
      <div className="w-5 h-5 rounded-md bg-primary-500/15 text-primary-500 flex items-center justify-center shrink-0 mt-0.5">
        <ShieldCheck size={14} strokeWidth={2.5} />
      </div>
      <p className="font-medium text-slate-600">{text}</p>
    </div>
  );
};

export default SecurityReassurance;

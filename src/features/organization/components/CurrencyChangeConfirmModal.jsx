import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../../components/common/Modal/Modal';
import { Input } from '../../../components/common/Input/Input';
import { Button } from '../../../components/common/Button/Button';

export const CurrencyChangeConfirmModal = ({ isOpen, onClose, targetCurrency, onConfirm }) => {
  const [typedCode, setTypedCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typedCode !== targetCurrency) return;
    setLoading(true);
    onConfirm(typedCode);
    setLoading(false);
  };

  const footerButtons = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="currency-change-form"
        variant="warning"
        disabled={typedCode !== targetCurrency}
        loading={loading}
        icon={AlertTriangle}
      >
        Confirm Currency Change
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Currency Change"
      size="small"
      footer={footerButtons}
    >
      <form id="currency-change-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-300">
            <AlertTriangle size={16} />
            <span>Financial Audit Protection Warning</span>
          </div>
          <p>
            Existing financial transactions recorded under the previous currency will retain their stored numeric amounts.
            To confirm this change, please type <strong className="font-mono text-[var(--text-primary)] underline">{targetCurrency}</strong> below.
          </p>
        </div>

        <Input
          label={`Type ${targetCurrency} to confirm:`}
          value={typedCode}
          onChange={(e) => setTypedCode(e.target.value.toUpperCase())}
          placeholder={targetCurrency}
          className="font-mono text-center"
        />
      </form>
    </Modal>
  );
};

import React from 'react';
import Spinner from './Spinner';

export const Loader = ({ text = 'Loading...', fullPage = false, size = 'large' }) => {
  return (
    <div
      className={`flex items-center justify-center p-10 w-full ${
        fullPage ? 'fixed inset-0 min-h-screen bg-[var(--bg-app,#08080A)] z-[9999]' : ''
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Spinner size={size} color="var(--primary, #F97316)" />
        {text && <p className="text-sm font-semibold text-[var(--text-secondary,#9E9EA7)]">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;

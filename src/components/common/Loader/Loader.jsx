import React from 'react';
import Spinner from '../Spinner/Spinner';

export const Loader = ({ text = 'Loading...', fullPage = false, size = 'large' }) => {
  return (
    <div
      className={`flex items-center justify-center p-10 w-full ${
        fullPage ? 'fixed inset-0 min-h-screen bg-[#1A1015] z-[9999]' : ''
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Spinner size={size} color="#8A4A52" />
        {text && <p className="text-sm font-semibold text-[#C4B5BE]">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;

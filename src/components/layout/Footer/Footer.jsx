import React from 'react';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-4 px-8 border-t border-white/10 bg-[#1A1015] text-[#8E7A86] text-xs flex flex-wrap items-center justify-between gap-4 mt-auto">
      <div>
        © {year} <span className="text-[#C4B5BE] font-semibold">SalonFlow Pro</span>. All rights reserved.
      </div>
      <div className="flex items-center gap-4">
        <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#support" className="hover:text-white transition-colors">System Support</a>
      </div>
    </footer>
  );
};

export default Footer;

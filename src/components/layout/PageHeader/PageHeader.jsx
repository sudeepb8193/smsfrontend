import React from 'react';

export const PageHeader = ({ title, description, action, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 ${className}`}>
      <div>
        {title && <h1 className="text-2xl font-extrabold text-[#F9FAFB] tracking-tight">{title}</h1>}
        {description && <p className="text-sm text-[#8E7A86] mt-1">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
};

export default PageHeader;

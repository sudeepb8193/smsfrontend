import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button/Button';
import { ShieldAlert, Home } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <div className="w-20 h-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
        <ShieldAlert size={40} />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2">Access Denied</h1>
      <p className="text-sm text-[#8E7A86] max-w-md mb-6">
        You do not have permission to view this resource. Please contact your system administrator if you believe this is an error.
      </p>
      <Link to="/dashboard">
        <Button variant="secondary" icon={Home}>
          Return Home
        </Button>
      </Link>
    </div>
  );
};

export default Unauthorized;

import React from 'react';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import { Mail, Phone, Shield } from 'lucide-react';

export const UserCard = ({ user }) => {
  if (!user) return null;

  return (
    <Card className="hover:border-[#8A4A52]/40">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="font-bold text-white text-base">{user.displayName}</h4>
          <span className="text-xs text-[#8E7A86] font-mono">UUID: {user.uuid ? user.uuid.substring(0, 14) : user.id}...</span>
        </div>
        <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'PENDING' ? 'warning' : 'danger'}>
          {user.status || 'ACTIVE'}
        </Badge>
      </div>

      <div className="space-y-1.5 text-xs text-[#C4B5BE]">
        {user.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-[#8E7A86]" />
            <span>{user.email}</span>
          </div>
        )}
        {user.phoneNumber && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-[#8E7A86]" />
            <span>{user.phoneCountryCode} {user.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-2">
          <Shield size={14} className="text-[#8A4A52]" />
          <span className="font-semibold text-white">{user.role}</span>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;

import React from 'react';
import { History, CheckCircle2, Clock, UserCheck } from 'lucide-react';
import Card from '../../../components/shared/Card';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';

export const RoleAssignmentHistoryLog = ({ activeRoles = [], historicalRoles = [] }) => {
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const hasEntries = activeRoles.length > 0 || historicalRoles.length > 0;

  return (
    <Card className="shadow-xs p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
        <History size={18} className="text-primary-500" />
        <h3 className="font-bold text-[var(--text-primary)] text-sm">
          Role Assignment Audit Log
        </h3>
      </div>

      {!hasEntries ? (
        <EmptyState
          title="No Assignment History"
          description="No role assignment history found for this user."
          className="py-8"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold">
                <th className="py-2.5 px-3">Role Name</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Assigned Date</th>
                <th className="py-2.5 px-3">Assigned By</th>
                <th className="py-2.5 px-3">Removed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {/* Active Roles */}
              {activeRoles.map((r) => (
                <tr key={`active-${r.assignmentId || r.roleId}`} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                    {r.name}
                    {r.isPrimary && (
                      <Badge variant="primary" size="small" className="ml-2">
                        Primary
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="success" size="small">
                      <CheckCircle2 size={11} /> Active
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)] font-mono">
                    {formatDateTime(r.assignedAt)}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <UserCheck size={12} className="text-[var(--text-muted)]" />
                      {r.assignedBy || 'System'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[var(--text-muted)] italic">Active (Current)</td>
                </tr>
              ))}

              {/* Historical / Removed Roles */}
              {historicalRoles.map((r) => (
                <tr key={`history-${r.assignmentId || r.roleId}`} className="opacity-75 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-semibold text-[var(--text-secondary)]">
                    {r.name}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="neutral" size="small">
                      <Clock size={11} /> Removed
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-[var(--text-muted)] font-mono">
                    {formatDateTime(r.assignedAt)}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-muted)]">
                    {r.assignedBy || 'System'}
                  </td>
                  <td className="py-3 px-3 text-rose-400 font-mono font-medium">
                    {formatDateTime(r.removedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default RoleAssignmentHistoryLog;

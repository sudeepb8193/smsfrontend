import React from 'react';
import { History, Calendar, CheckCircle2, Clock, UserCheck } from 'lucide-react';

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
    <div className="space-y-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
        <History size={18} className="text-primary-500" />
        <h3 className="font-bold text-[var(--text-primary)] text-sm">
          Role Assignment Audit Log
        </h3>
      </div>

      {!hasEntries ? (
        <div className="p-6 text-center text-xs text-[var(--text-muted)]">
          No role assignment history found for this user.
        </div>
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
                      <span className="ml-2 text-[10px] bg-primary-500/15 text-primary-500 border border-primary-500/20 px-2 py-0.5 rounded-full font-bold">
                        Primary
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Active
                    </span>
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-input)] border border-[var(--border-color)] px-2 py-0.5 rounded-full">
                      <Clock size={11} /> Removed
                    </span>
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
    </div>
  );
};

export default RoleAssignmentHistoryLog;

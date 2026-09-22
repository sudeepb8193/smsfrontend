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
    <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <History size={18} className="text-primary-600 dark:text-primary-400" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
          Role Assignment Audit Log
        </h3>
      </div>

      {!hasEntries ? (
        <div className="p-6 text-center text-xs text-slate-400">
          No role assignment history found for this user.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-2.5 px-3">Role Name</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Assigned Date</th>
                <th className="py-2.5 px-3">Assigned By</th>
                <th className="py-2.5 px-3">Removed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Active Roles */}
              {activeRoles.map((r) => (
                <tr key={`active-${r.assignmentId || r.roleId}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                    {r.name}
                    {r.isPrimary && (
                      <span className="ml-2 text-[10px] bg-primary-100 text-primary-800 dark:bg-primary-950/80 dark:text-primary-300 px-2 py-0.5 rounded-full font-bold">
                        Primary
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono">
                    {formatDateTime(r.assignedAt)}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <UserCheck size={12} className="text-slate-400" />
                      {r.assignedBy || 'System'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 italic">Active (Current)</td>
                </tr>
              ))}

              {/* Historical / Removed Roles */}
              {historicalRoles.map((r) => (
                <tr key={`history-${r.assignmentId || r.roleId}`} className="opacity-75 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-600 dark:text-slate-300">
                    {r.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      <Clock size={11} /> Removed
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {formatDateTime(r.assignedAt)}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {r.assignedBy || 'System'}
                  </td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-mono font-medium">
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

import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';

export const TableActions = ({
  onView,
  onEdit,
  onDelete,
  viewTooltip = 'View details',
  editTooltip = 'Edit record',
  deleteTooltip = 'Delete record',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="p-1.5 text-[#C4B5BE] hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title={viewTooltip}
          aria-label={viewTooltip}
        >
          <Eye size={16} />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-all"
          title={editTooltip}
          aria-label={editTooltip}
        >
          <Edit2 size={16} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
          title={deleteTooltip}
          aria-label={deleteTooltip}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default TableActions;

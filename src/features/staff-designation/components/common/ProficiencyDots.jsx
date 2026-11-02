import React from 'react';

const PROFICIENCY_CONFIG = {
  beginner: { count: 1, label: 'Beginner', color: 'bg-blue-500 text-blue-500' },
  intermediate: { count: 2, label: 'Intermediate', color: 'bg-emerald-500 text-emerald-500' },
  expert: { count: 3, label: 'Expert', color: 'bg-amber-500 text-amber-500' },
  master: { count: 4, label: 'Master', color: 'bg-purple-500 text-purple-500' },
};

export default function ProficiencyDots({ level, showLabel = true }) {
  const normLevel = (level || 'beginner').toLowerCase();
  const config = PROFICIENCY_CONFIG[normLevel] || PROFICIENCY_CONFIG.beginner;

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-1" title={`${config.label} proficiency`}>
        {[1, 2, 3, 4].map((dot) => (
          <div
            key={dot}
            className={`w-2 h-2 rounded-full transition-all ${
              dot <= config.count
                ? config.color.split(' ')[0]
                : 'bg-[var(--border-color)] opacity-40'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold capitalize text-[var(--text-secondary)]">
          {config.label}
        </span>
      )}
    </div>
  );
}


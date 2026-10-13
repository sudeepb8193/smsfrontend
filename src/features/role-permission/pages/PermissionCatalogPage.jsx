import React, { useState, useEffect, useMemo } from 'react';
import { rolePermissionApi } from '../api/rolePermissionApi';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import CustomSelector from '../../../components/shared/CustomSelector';
import Spinner from '../../../components/shared/Spinner';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Layers,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

const ACTION_COLORS = {
  view: 'primary',
  create: 'success',
  edit: 'warning',
  delete: 'danger',
  approve: 'brand',
  export: 'secondary',
  print: 'secondary',
};

export const PermissionCatalogPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await rolePermissionApi.getPermissions({
          includeLegacy: true,
        });
        setPermissions(data || []);

        // Auto-expand all modules initially
        const autoExpanded = {};
        (data || []).forEach((p) => {
          autoExpanded[p.moduleCode] = true;
        });
        setExpandedModules(autoExpanded);
      } catch (err) {
        toast.error(err.message || 'Failed to load permissions catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  // Filter permissions
  const filtered = useMemo(() => {
    return permissions.filter((p) => {
      if (moduleFilter && p.moduleCode !== moduleFilter) return false;
      if (actionFilter && p.action !== actionFilter) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          p.permissionKey.toLowerCase().includes(term) ||
          p.label.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          p.moduleLabel.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [permissions, search, moduleFilter, actionFilter]);

  // Group by module
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((p) => {
      if (!map.has(p.moduleCode)) {
        map.set(p.moduleCode, {
          moduleCode: p.moduleCode,
          moduleLabel: p.moduleLabel,
          items: [],
        });
      }
      map.get(p.moduleCode).items.push(p);
    });
    return Array.from(map.values());
  }, [filtered]);

  // Unique module options for filter dropdown
  const moduleOptions = useMemo(() => {
    const mods = new Map();
    permissions.forEach((p) => {
      mods.set(p.moduleCode, p.moduleLabel);
    });
    return [
      { value: '', label: 'All Modules' },
      ...Array.from(mods.entries()).map(([code, label]) => ({
        value: code,
        label: `${label} (${code})`,
      })),
    ];
  }, [permissions]);

  const toggleExpand = (modCode) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modCode]: !prev[modCode],
    }));
  };

  const expandAll = () => {
    const next = {};
    grouped.forEach((g) => {
      next[g.moduleCode] = true;
    });
    setExpandedModules(next);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  return (
    <div className="space-y-4">
      {/* Action Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-500" />
            Permission Registry & Reference
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            System-managed catalog of granular authorization capabilities for all Salon Management System modules
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="secondary" size="small" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="secondary" size="small" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-3.5 sm:p-4 transition-colors">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by permission key, action, description, or module..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>

          <div className="min-w-[200px]">
            <CustomSelector
              options={moduleOptions}
              value={moduleFilter}
              onChange={(val) => setModuleFilter(val)}
              placeholder="All Modules"
              isSearchable={true}
              isClearable={false}
            />
          </div>

          <div className="min-w-[180px]">
            <CustomSelector
              options={[
                { value: '', label: 'All Action Types' },
                { value: 'view', label: 'View (Read)' },
                { value: 'create', label: 'Create' },
                { value: 'edit', label: 'Edit (Update)' },
                { value: 'delete', label: 'Delete (Purge)' },
                { value: 'approve', label: 'Approve (Authorize)' },
                { value: 'export', label: 'Export (Data)' },
                { value: 'print', label: 'Print (POS / Slips)' },
              ]}
              value={actionFilter}
              onChange={(val) => setActionFilter(val)}
              placeholder="All Action Types"
              isSearchable={false}
              isClearable={false}
            />
          </div>
        </div>
      </div>

      {/* Permission Catalog Accordions */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-[var(--text-muted)]">
          <Spinner size="large" />
          <span className="mt-3 text-sm font-semibold">Loading Permission Catalog...</span>
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-8 text-center text-sm text-[var(--text-muted)]">
          No permissions match your filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map((group) => {
            const isExpanded = Boolean(expandedModules[group.moduleCode]);

            return (
              <div
                key={group.moduleCode}
                className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-colors"
              >
                {/* Module Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(group.moduleCode)}
                  className="w-full flex items-center justify-between p-4 bg-[var(--bg-input)] hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 flex items-center justify-center font-bold shrink-0">
                      <Layers size={18} />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-[var(--text-primary)]">
                        {group.moduleLabel}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] font-mono ml-2">
                        ({group.moduleCode})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                      {group.items.length} permissions
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </span>
                  </div>
                </button>

                {/* Expanded Permission List */}
                {isExpanded && (
                  <div className="divide-y divide-[var(--border-color)] border-t border-[var(--border-color)]">
                    {group.items.map((perm) => (
                      <div
                        key={perm.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-[var(--text-primary)]">
                              {perm.label}
                            </span>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                              {perm.permissionKey}
                            </span>
                            {perm.isLegacy && (
                              <Badge variant="warning" size="small">
                                Deprecated / Legacy
                              </Badge>
                            )}
                          </div>
                          {perm.description && (
                            <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
                              {perm.description}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <Badge
                            variant={ACTION_COLORS[perm.action] || 'secondary'}
                            size="small"
                            className="uppercase tracking-wider font-extrabold text-[10px]"
                          >
                            {perm.action}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PermissionCatalogPage;

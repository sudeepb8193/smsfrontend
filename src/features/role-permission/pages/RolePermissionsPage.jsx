import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rolePermissionApi } from '../api/rolePermissionApi';
import RolePermissionMatrix from '../components/RolePermissionMatrix';
import Button from '../../../components/shared/Button';
import Spinner from '../../../components/shared/Spinner';
import { ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';

export const RolePermissionsPage = ({ isSuperAdminView = false }) => {
  const { roleId } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [matrixTemplate, setMatrixTemplate] = useState([]);
  const [initialAssignments, setInitialAssignments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [versionToken, setVersionToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [concurrencyConflict, setConcurrencyConflict] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setConcurrencyConflict(null);

      const [roleData, permData, templateData, branchData] = await Promise.all([
        rolePermissionApi.getRole(roleId),
        rolePermissionApi.getRolePermissions(roleId),
        rolePermissionApi.getMatrixTemplate(),
        rolePermissionApi.getBranches(),
      ]);

      setRole(roleData);
      setInitialAssignments(permData.assignments || []);
      setVersionToken(permData.versionToken || permData.updatedAt || '');
      setMatrixTemplate(templateData || []);
      setBranches(branchData || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load role permission matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleId) {
      loadData();
    }
  }, [roleId]);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      setConcurrencyConflict(null);

      const res = await rolePermissionApi.updateRolePermissions(roleId, payload);
      toast.success('Permissions and branch scopes saved successfully');
      if (res.warning) {
        toast.warning(res.warning);
      }

      setVersionToken(res.versionToken);
      // Reload fresh data
      await loadData();
    } catch (err) {
      if (err.status === 409 || err.data?.code === 'CONCURRENCY_CONFLICT') {
        setConcurrencyConflict({
          message: err.data?.message || 'Role permissions have been modified by another administrator.',
        });
        toast.error('Concurrency Conflict: Please review the updated role state before saving.');
      } else {
        toast.error(err.message || 'Failed to save permissions');
      }
    } finally {
      setSaving(false);
    }
  };

  const basePath = isSuperAdminView ? '/super-admin/roles' : '/owner/roles';

  if (loading && !role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 dark:text-slate-400">
        <Spinner size="large" />
        <span className="mt-3 text-sm font-semibold">Loading Permission Matrix...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="small"
          icon={ArrowLeft}
          onClick={() => navigate(basePath)}
        >
          Back to Roles
        </Button>
      </div>

      {/* Permission Matrix */}
      <RolePermissionMatrix
        role={role}
        matrixTemplate={matrixTemplate}
        initialAssignments={initialAssignments}
        branches={branches}
        versionToken={versionToken}
        onSave={handleSave}
        loading={loading}
        saving={saving}
        concurrencyConflict={concurrencyConflict}
        onResolveConflict={loadData}
      />
    </div>
  );
};

export default RolePermissionsPage;

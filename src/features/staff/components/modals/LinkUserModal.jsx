import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { userService } from '../../../../services/userService';
import Spinner from '../../../../components/shared/Spinner';
import { Users } from 'lucide-react';

export function LinkUserModal({ isOpen, onClose, staff, onLink, loading, existingStaffList = [] }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [error, setError] = useState('');

  // Collect user IDs that are already linked to other employees
  const linkedUserIds = useMemo(() => {
    const ids = new Set();
    (existingStaffList || []).forEach((s) => {
      if (s.id !== staff?.id) {
        if (s.userId) ids.add(s.userId);
        if (s.user?.id) ids.add(s.user.id);
      }
    });
    return ids;
  }, [existingStaffList, staff]);

  useEffect(() => {
    if (isOpen && staff?.organizationId) {
      setFetchingUsers(true);
      setFetchError(null);
      setError('');
      userService
        .getUsers({ organizationId: staff.organizationId, limit: 100 })
        .then((res) => {
          const list = res?.users || res?.data || res || [];
          setUsers(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          console.error('Failed to load users for linking:', err);
          setFetchError('Unable to load users list');
        })
        .finally(() => setFetchingUsers(false));
    }
  }, [isOpen, staff]);

  // Filter out any user accounts already linked to other staff members
  const availableUsers = useMemo(() => {
    return users.filter((u) => {
      if (linkedUserIds.has(u.id)) return false;
      if (u.isStaffLinked && u.staffLinked?.id !== staff?.id) return false;
      return true;
    });
  }, [users, linkedUserIds, staff]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a user account to link');
      return;
    }
    setError('');
    onLink(selectedUserId);
  };

  const userOptions = availableUsers.map((u) => ({
    value: u.id,
    label: `${u.displayName || u.email} (${u.email})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Link Login Account – ${staff?.fullName || ''}`}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="link-user-form"
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
            disabled={fetchingUsers || availableUsers.length === 0}
          >
            Link Account
          </Button>
        </div>
      }
    >
      <form id="link-user-form" noValidate onSubmit={handleSubmit} className="space-y-4 min-h-[200px] pb-32">
        <p className="text-sm text-[var(--text-secondary)]">
          Linking an employee profile to a user account allows this person to log into the system with their assigned roles and permissions. An employee record and a login account are separate concepts.
        </p>

        {fetchingUsers ? (
          <div className="py-6 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : fetchError ? (
          <div className="p-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-lg">
            {fetchError}
          </div>
        ) : availableUsers.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-input)] text-center text-xs text-[var(--text-muted)] space-y-1.5">
            <Users size={20} className="mx-auto text-[var(--text-muted)] opacity-70" />
            <p className="font-semibold text-[var(--text-secondary)]">No Unlinked User Accounts Available</p>
            <p>All active user accounts in your organization are already linked to employee records.</p>
          </div>
        ) : (
          <div>
            <CustomSelector
              label="Select User Account"
              placeholder="Search user account by name or email..."
              value={selectedUserId}
              onChange={(val) => {
                setSelectedUserId(val);
                if (error) setError('');
              }}
              options={userOptions}
              isSearchable={true}
              isClearable={true}
              error={error}
              required
            />
          </div>
        )}
      </form>
    </Modal>
  );
}

export default LinkUserModal;

import { useCallback, useEffect, useState } from 'react';
import {
  checkOrganisationSlugAvailability,
  checkOwnerOrganisationSlugAvailability,
  fetchOrganisationDetails,
  fetchOwnerOrganisationSetup,
  updateOwnerOrganisationSetup,
  updateOrganisationSetup,
} from '../api/organisationApi';

export default function useOrganisationSetup(organisationId, isOwner = false) {
  const [organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOwner && !organisationId) return undefined;
    let active = true;
    (isOwner ? fetchOwnerOrganisationSetup() : fetchOrganisationDetails(organisationId))
      .then((result) => {
        if (active) setOrganisation(result);
      })
      .catch((loadError) => {
        console.error('Failed to load organization setup:', loadError);
        if (active) setError(loadError.message || 'Could not load organization setup.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [organisationId, isOwner]);

  const save = async (payload) => {
    setSaving(true);
    setError('');
    try {
      const result = isOwner
        ? await updateOwnerOrganisationSetup(payload)
        : await updateOrganisationSetup(organisationId, payload);
      setOrganisation(result.organisation || result);
      return result;
    } catch (saveError) {
      console.error('Failed to save organization setup:', saveError);
      setError(saveError.message || 'Could not save organization setup.');
      throw saveError;
    } finally {
      setSaving(false);
    }
  };

  const checkSlugAvailability = useCallback(
    (slug) => isOwner
      ? checkOwnerOrganisationSlugAvailability(slug)
      : checkOrganisationSlugAvailability(organisationId, slug),
    [isOwner, organisationId],
  );

  return { organisation, loading, saving, error, setError, save, checkSlugAvailability };
}

import { useContext } from 'react';
import { OrganizerAuthContext } from '../context/OrganizerAuthContext';

/**
 * Custom hook to consume the OrganizerAuthContext.
 * Throws a runtime error if invoked outside of an <OrganizerAuthProvider>.
 */
export function useOrganizerAuth() {
  const context = useContext(OrganizerAuthContext);
  if (!context) {
    throw new Error('useOrganizerAuth must be used within an <OrganizerAuthProvider>');
  }
  return context;
}

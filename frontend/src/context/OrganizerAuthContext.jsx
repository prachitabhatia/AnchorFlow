import { createContext, useState, useEffect } from 'react';
import { PASSCODE_STORAGE_KEY } from '../api/client';

export const OrganizerAuthContext = createContext(null);

export function OrganizerAuthProvider({ children }) {
  const [passcode, setPasscodeState] = useState(() => {
    return localStorage.getItem(PASSCODE_STORAGE_KEY) || '';
  });

  const isAuthenticated = Boolean(passcode && passcode.trim().length > 0);

  const setPasscode = (value) => {
    const val = value ? value.trim() : '';
    setPasscodeState(val);
    if (val) {
      localStorage.setItem(PASSCODE_STORAGE_KEY, val);
    } else {
      localStorage.removeItem(PASSCODE_STORAGE_KEY);
    }
  };

  const logout = () => {
    setPasscodeState('');
    localStorage.removeItem(PASSCODE_STORAGE_KEY);
  };

  // Sync state if localStorage changes in another tab/window
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === PASSCODE_STORAGE_KEY) {
        setPasscodeState(e.newValue || '');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    passcode,
    isAuthenticated,
    setPasscode,
    logout,
  };

  return (
    <OrganizerAuthContext.Provider value={value}>
      {children}
    </OrganizerAuthContext.Provider>
  );
}

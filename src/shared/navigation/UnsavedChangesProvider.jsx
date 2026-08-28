import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const UnsavedChangesContext = createContext(null);

export function UnsavedChangesProvider({ children }) {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    if (!prompt) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [prompt]);

  const confirmNavigation = useCallback(() => !prompt || window.confirm(prompt), [prompt]);
  const value = useMemo(() => ({ setPrompt, confirmNavigation }), [confirmNavigation]);

  return <UnsavedChangesContext.Provider value={value}>{children}</UnsavedChangesContext.Provider>;
}

export function useUnsavedChanges(shouldBlock, message) {
  const context = useContext(UnsavedChangesContext);
  if (!context) throw new Error('useUnsavedChanges must be used inside UnsavedChangesProvider');
  const { setPrompt, confirmNavigation } = context;

  useEffect(() => {
    setPrompt(shouldBlock ? message : null);
    return () => setPrompt(null);
  }, [setPrompt, shouldBlock, message]);

  return confirmNavigation;
}

export function useNavigationGuard() {
  const context = useContext(UnsavedChangesContext);
  if (!context) throw new Error('useNavigationGuard must be used inside UnsavedChangesProvider');
  return context;
}

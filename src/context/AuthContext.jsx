import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth } from '@/config/firebase';
import * as authService from '@/services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setEmailVerified(Boolean(firebaseUser?.emailVerified));
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // O Firebase não avisa quando o email é verificado em outra aba,
  // então a tela chama isso quando o usuário clica em "já verifiquei"
  const refreshUser = useCallback(async () => {
    const refreshed = await authService.reloadCurrentUser();
    setEmailVerified(Boolean(refreshed?.emailVerified));
    return refreshed;
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    emailVerified,
    refreshUser,
    login: authService.login,
    logout: authService.logout,
    register: authService.register,
    resendVerificationEmail: authService.resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

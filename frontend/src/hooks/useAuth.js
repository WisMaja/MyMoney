import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Ładowanie sesji przy starcie
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      if (data?.session?.access_token) {
        localStorage.setItem('access_token', data.session.access_token);
      }
    });

    // Nasłuch na zmiany sesji
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
      } else {
        localStorage.removeItem('access_token');
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('access_token');
    setSession(null);
  };

  const value = {
    user: session?.user || null,
    token: session?.access_token || null,
    isAuthenticated: !!session,
    logout,
    refreshSession: async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

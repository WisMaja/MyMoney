import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Poczekaj na async sprawdzenie sesji w useAuth
    const timer = setTimeout(() => setChecked(true), 200); // delikatne opóźnienie
    return () => clearTimeout(timer);
  }, []);

  if (!checked) return null; // lub spinner

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;

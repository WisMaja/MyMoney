// src/routes/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log("PrivateRoute - Auth state:", isAuthenticated);
    console.log("PrivateRoute - Current location:", location.pathname);
    
    // Symulujemy sprawdzenie, czy są jakieś problemy z tokenami
    const checkTokenValidity = () => {
      try {
        const token = localStorage.getItem('access_token');
        console.log("Token exists:", !!token);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking token:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };
    
    checkTokenValidity();
  }, [isAuthenticated, location]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Authentication Error</h2>
        <p>We encountered a problem verifying your authentication status.</p>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          style={{ padding: '10px', margin: '10px 0' }}
        >
          Clear Data and Go to Login
        </button>
        <button 
          onClick={() => window.location.href = '/diagnostic'}
          style={{ padding: '10px', margin: '10px 0' }}
        >
          Go to Diagnostic Page
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("User authenticated, rendering protected content");
  return children;
};

export default PrivateRoute;

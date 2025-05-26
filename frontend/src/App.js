import { useEffect, useState } from "react";
import apiClient from "./apiClient";
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Accounts from './pages/Accounts';
import Social from './pages/Social';
import Settings from './pages/Settings';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';

import { AuthProvider } from './context/AuthContext';

import PrivateRoute from './router/PrivateRoute';

import './App.css';
import './styles/common.css';

if (typeof window !== "undefined" && window.console) {
  console.log(
    "%cOSTRZEŻENIE!",
    "color: red; font-size: 40px; font-weight: bold; text-shadow: 1px 1px black;"
  );
  console.log(
    "%cTa konsola jest przeznaczona dla deweloperów. Jeśli ktoś kazał Ci tutaj coś wkleić, może to być atak.",
    "color: black; font-size: 16px;"
  );
  console.log(
    "%cNigdy nie wpisuj tutaj nieznanych komend — możesz udostępnić dostęp do swojego konta.",
    "color: black; font-size: 14px;"
  );
}

// Dodajemy komponent diagnostyczny
const DiagnosticPage = () => {
  const [appState, setAppState] = useState({
    authTokens: false,
    apiHealth: 'checking...'
  });

  useEffect(() => {
    // Sprawdź tokeny
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    setAppState(prev => ({
      ...prev,
      authTokens: {
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing'
      }
    }));
    
    // Sprawdź API
    fetch('http://localhost:5032/api/auth')
      .then(response => {
        setAppState(prev => ({
          ...prev,
          apiHealth: `API responded with status: ${response.status}`
        }));
      })
      .catch(error => {
        setAppState(prev => ({
          ...prev,
          apiHealth: `API error: ${error.message}`
        }));
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>App Diagnostic</h1>
      
      <h2>Auth State</h2>
      <pre>{JSON.stringify(appState.authTokens, null, 2)}</pre>
      
      <h2>API Health</h2>
      <p>{appState.apiHealth}</p>
      
      <h2>Actions</h2>
      <button 
        onClick={() => {
          localStorage.clear();
          alert('localStorage cleared!');
          window.location.reload();
        }}
        style={{ padding: '10px', margin: '10px 0' }}
      >
        Clear localStorage & Reload
      </button>
      
      <h2>Navigation</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a href="/login">Go to Login</a>
        <a href="/">Go to Dashboard</a>
        <a href="/social">Go to Social</a>
      </div>
    </div>
  );
};

// Komponent do obsługi błędów
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App error boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message || "Unknown error"}</p>
          <button onClick={() => window.location.href = '/diagnostic'}>
            Go to Diagnostic Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={<Navigate replace to="/dashboard" />}
            />
            <Route path="/login" element={<Login />} />
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/statistics" element={
              <PrivateRoute>
                <Statistics />
              </PrivateRoute>
            } />
            <Route path="/accounts" element={
              <PrivateRoute>
                <Accounts />
              </PrivateRoute>
            } />
            <Route path="/budgets" element={
              <PrivateRoute>
                <Budgets />
              </PrivateRoute>
            } />
            <Route path="/categories" element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            } />
            <Route path="/social" element={
              <PrivateRoute>
                <Social />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

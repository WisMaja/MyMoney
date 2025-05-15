import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Accounts from './pages/Accounts';
import Social from './pages/Social';
import Settings from './pages/Settings';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';

import { AuthProvider } from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';

import './App.css';
import './styles/common.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

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

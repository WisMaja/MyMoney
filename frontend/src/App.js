import { useEffect, useState } from "react";
import apiClient from "./apiClient";

// function App() {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     apiClient.get("api/user")
//       .then(response => setUsers(response.data))
//       .catch(error => console.error("Błąd pobierania użytkowników:", error));
//   }, []);

//   return (
//     <div style={{ padding: "2rem" }}>
//       <h1>Lista użytkowników</h1>
//       {users.length === 0 ? (
//         <p>Brak danych lub trwa ładowanie...</p>
//       ) : (
//         <ul>
//           {users.map(user => (
//             <li key={user.id}>
//               <strong>{user.name}</strong> – {user.email}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/" element={
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

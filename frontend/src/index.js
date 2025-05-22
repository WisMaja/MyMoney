import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Debugowanie inicjalizacji
console.log("React initialization started");
window.onerror = function(message, source, lineno, colno, error) {
  console.log("Global error caught:", message);
  console.log("Error details:", error);
  return false;
};

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log("Root element found:", document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React render completed");
} catch (error) {
  console.error("Critical error during initialization:", error);
  // Pokaż komunikat na stronie
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Application Error</h2>
      <p>The application failed to initialize. Please try the following:</p>
      <ul>
        <li>Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)</li>
        <li>Clear localStorage (run 'localStorage.clear()' in console)</li>
        <li>Try in incognito mode</li>
      </ul>
      <p>Error details: ${error.message}</p>
    </div>
  `;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 
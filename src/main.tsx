import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LiveDataProvider } from './context/LiveDataContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <LiveDataProvider>
          <App />
        </LiveDataProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

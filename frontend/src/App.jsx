import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ConnectionsManager from './pages/ConnectionsManager';
import IndexManager from './pages/IndexManager';
import SearchInterface from './pages/SearchInterface';

const serverUrl='http://localhost:5020/api/v1';
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="connections" element={<ConnectionsManager />} />
          <Route path="indexes" element={<IndexManager />} />
          <Route path="search" element={<SearchInterface />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

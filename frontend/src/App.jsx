import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Contacts from './pages/Contacts';
import Accounts from './pages/Accounts';
import Deals from './pages/Deals';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import VerifyEmail from './pages/VerifyEmail';

const PublicRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return null;
  
  if (user && !user.requiresVerification) {
    return <Navigate to="/app/leads" />;
  }
  
  return children;
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return null;
  
  if (!user) return <Navigate to="/login" />;
  
  if (user.requiresVerification) {
    return <Navigate to="/verify-email" />;
  }
  
  return children;
};

import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Protected CRM Routes */}
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
             <Route index element={<Dashboard />} />
             <Route path="leads" element={<Leads />} />
             <Route path="leads/:id" element={<LeadDetails />} />
             <Route path="contacts" element={<Contacts />} />
             <Route path="accounts" element={<Accounts />} />
             <Route path="deals" element={<Deals />} />
             <Route path="tasks" element={<Tasks />} />
             <Route path="reports" element={<Reports />} />
          </Route>

          {/* Redirect to /app if logged in and trying to access /login, or catch-all */}
          {/* (Note: AuthContext handling can be added for automatic redirect) */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}


export default App;

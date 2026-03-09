import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// User Screens
import UserLogin from './screens/User/LoginScreen';
import UserRegister from './screens/User/RegisterScreen';
import UserDashboard from './screens/User/UserDashboardScreen';
import RegisterMissingPerson from './screens/User/RegisterMissingPersonScreen';
import StatusTracking from './screens/User/StatusTrackingScreen';
import PrivacySupport from './screens/User/PrivacySupportScreen';

// Officer Screens
import OfficerLogin from './screens/Officer/OfficerLoginScreen';
import LiveDetection from './screens/Officer/LiveDetectionScreen';
import CaseHandling from './screens/Officer/CaseHandlingScreen';
import AlertVerification from './screens/Officer/AlertVerificationScreen';
import OfficerRegisterCase from './screens/Officer/RegisterCaseScreen';

// Admin Screens
import AdminLogin from './screens/Admin/AdminLoginScreen';
import AdminDashboard from './screens/Admin/DashboardScreen';
import Analytics from './screens/Admin/AnalyticsScreen';
import ManageUsers from './screens/Admin/ManageUsersScreen';
import ManageOfficers from './screens/Admin/ManageOfficersScreen';

// Common Screens
import SplashScreen from './screens/SplashScreen';
import UnifiedLogin from './screens/UnifiedLoginScreen';

// Layout Components
import OfficerLayout from './components/OfficerLayout';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e0e0e0',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/unified-login" replace />;
};

// User Role Check (for routes that need UserLayout)
const UserRoleCheck: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'user') {
    return <Navigate to="/unified-login" replace />;
  }
  return <UserLayout>{children}</UserLayout>;
};

// Officer Role Check
const OfficerRoleCheck: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'officer') {
    return <Navigate to="/unified-login" replace />;
  }
  return children;
};

// Admin Role Check (for routes that need AdminLayout)
const AdminRoleCheck: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/unified-login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Splash */}
      <Route path="/" element={<SplashScreen />} />
      
      {/* Unified Login */}
      <Route path="/unified-login" element={<UnifiedLogin />} />

      {/* User Routes */}
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/register" element={<UserRegister />} />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute>
            <UserRoleCheck>
              <UserDashboard />
            </UserRoleCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/report"
        element={
          <ProtectedRoute>
            <UserRoleCheck>
              <RegisterMissingPerson />
            </UserRoleCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/status"
        element={
          <ProtectedRoute>
            <UserRoleCheck>
              <StatusTracking />
            </UserRoleCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/support"
        element={
          <ProtectedRoute>
            <UserRoleCheck>
              <PrivacySupport />
            </UserRoleCheck>
          </ProtectedRoute>
        }
      />

      {/* Officer Routes */}
      <Route path="/officer/login" element={<OfficerLogin />} />
      <Route
        path="/officer/*"
        element={
          <ProtectedRoute>
            <OfficerRoleCheck>
              <OfficerLayout>
                <Routes>
                  <Route path="live-detection" element={<LiveDetection />} />
                  <Route path="cases" element={<CaseHandling />} />
                  <Route path="register-case" element={<OfficerRegisterCase />} />
                  <Route path="alerts" element={<AlertVerification />} />
                  <Route path="" element={<Navigate to="/officer/live-detection" replace />} />
                </Routes>
              </OfficerLayout>
            </OfficerRoleCheck>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminRoleCheck>
              <AdminDashboard />
            </AdminRoleCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute>
            <AdminRoleCheck>
              <Analytics />
            </AdminRoleCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminRoleCheck>
              <ManageUsers />
            </AdminRoleCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/officers"
        element={
          <ProtectedRoute>
            <AdminRoleCheck>
              <ManageOfficers />
            </AdminRoleCheck>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;

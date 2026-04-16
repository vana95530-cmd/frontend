import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/ProtectedRoute/PrivateRoute';
import AdminRoute from './components/ProtectedRoute/AdminRoute';
import Layout from './components/Layout/Layout';

import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            <Route element={<PrivateRoute />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            <Route element={<AdminRoute />}>
              <Route path="admin/*" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
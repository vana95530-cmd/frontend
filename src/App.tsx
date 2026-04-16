import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/ProtectedRoute/PrivateRoute';
import AdminRoute from './components/ProtectedRoute/AdminRoute';

// Імпорт сторінок (створіть заглушки для цих компонентів)
import HomePage from './pages/Home/HomePage.tsx';
import AdDetailPage from './pages/AdDetail/AdDetailPage.tsx';
import ProfilePage from './pages/Profile/ProfilePage.tsx';
import AdminDashboard from './pages/Admin/AdminDashboard.tsx';
import LoginPage from './pages/Login/LoginPage.tsx';
import RegisterPage from './pages/Register/RegisterPage.tsx';
import Layout from './components/Layout/Layout.tsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Публічні маршрути */}
            <Route index element={<HomePage />} />
            <Route path="ads/:id" element={<AdDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Приватні маршрути (тільки для авторизованих) */}
            <Route element={<PrivateRoute />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Адмінські маршрути */}
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
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import { ProfileEdit } from './pages/ProfileEdit';
import { Tournaments } from './pages/Tournaments';
import { TournamentCreate } from './pages/TournamentCreate';
import { TournamentDetail } from './pages/TournamentDetail';
import { TournamentManage } from './pages/TournamentManage';
import { TournamentJoin } from './pages/TournamentJoin';
import { TournamentBrowse } from './pages/TournamentBrowse';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
          <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
          <Route path="/tournaments/create" element={<ProtectedRoute><TournamentCreate /></ProtectedRoute>} />
          <Route path="/tournaments/join" element={<ProtectedRoute><TournamentJoin /></ProtectedRoute>} />
          <Route path="/tournaments/browse" element={<ProtectedRoute><TournamentBrowse /></ProtectedRoute>} />
          <Route path="/tournaments/:id" element={<ProtectedRoute><TournamentDetail /></ProtectedRoute>} />
          <Route path="/tournaments/:id/manage" element={<ProtectedRoute><TournamentManage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRouter;


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/interview/InterviewSetup';
import HRInterview from './pages/interview/HRInterview';
import TechnicalInterview from './pages/interview/TechnicalInterview';
import CodingAssessment from './pages/interview/CodingAssessment';
import GithubAnalysis from './pages/GithubAnalysis';
import EvaluationResult from './pages/EvaluationResult';
import History from './pages/History';
import CreateCV from './pages/CreateCV';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"/></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/welcome" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/setup" element={<InterviewSetup />} />
            <Route path="/interview/hr" element={<HRInterview />} />
            <Route path="/interview/technical" element={<TechnicalInterview />} />
            <Route path="/interview/coding" element={<CodingAssessment />} />
            <Route path="/github-analysis" element={<GithubAnalysis />} />
            <Route path="/result/:id" element={<EvaluationResult />} />
            <Route path="/history" element={<History />} />
            <Route path="/create-cv" element={<CreateCV />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

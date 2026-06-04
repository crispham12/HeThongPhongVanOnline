import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/user/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/user/Dashboard';
import InterviewSetup from './pages/user/interview/InterviewSetup';
import HRInterview from './pages/user/interview/HRInterview';
import TechnicalInterview from './pages/user/interview/TechnicalInterview';
import CodingAssessment from './pages/user/interview/CodingAssessment';
import GithubAnalysis from './pages/user/GithubAnalysis';
import EvaluationResult from './pages/user/EvaluationResult';
import History from './pages/user/History';
import CreateCV from './pages/user/CreateCV';
import UserQuestionBank from './pages/user/UserQuestionBank';
import PracticeQuestion from './pages/user/PracticeQuestion';
import AdminTemplates from './pages/admin/AdminTemplates';
import AdminTemplateEditor from './pages/admin/AdminTemplateEditor';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminQuestionBank from './pages/admin/AdminQuestionBank';
import AdminAddQuestion from './pages/admin/AdminAddQuestion';
import AdminCodingBank from './pages/admin/AdminCodingBank';
import AdminAIMonitor from './pages/admin/AdminAIMonitor';
import AdminInterviewData from './pages/admin/AdminInterviewData';
import AdminSystemLogs from './pages/admin/AdminSystemLogs';
import AdminSettings from './pages/admin/AdminSettings';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 1 ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  // Role 1 = Admin, Role 0 = User
  return isAuthenticated && user?.role === 1 ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/welcome" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes in Sidebar layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/setup" element={<InterviewSetup />} />
            <Route path="/interview/hr" element={<HRInterview />} />
            <Route path="/interview/technical" element={<TechnicalInterview />} />
            <Route path="/interview/coding" element={<CodingAssessment />} />
            <Route path="/github-analysis" element={<GithubAnalysis />} />
            <Route path="/evaluation/:id" element={<EvaluationResult />} />
            <Route path="/history" element={<History />} />
            <Route path="/create-cv" element={<CreateCV />} />
            <Route path="/question-bank" element={<UserQuestionBank />} />
            <Route path="/question-bank/practice/:id" element={<PracticeQuestion />} />

            {/* Admin template management inside standard layout */}
          </Route>

          {/* Admin Routes with AdminLayout */}
          <Route element={<ProtectedRoute><AdminRoute><AdminLayout /></AdminRoute></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/interviews" element={<AdminInterviewData />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/ai-monitor" element={<AdminAIMonitor />} />
            <Route path="/admin/question-bank" element={<AdminQuestionBank />} />
            <Route path="/admin/question-bank/add" element={<AdminAddQuestion />} />
            <Route path="/admin/question-bank/edit/:id" element={<AdminAddQuestion />} />
            <Route path="/admin/coding-bank" element={<AdminCodingBank />} />
            <Route path="/admin/templates" element={<AdminTemplates />} />
            <Route path="/admin/logs" element={<AdminSystemLogs />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            {/* Add other admin routes here in the future */}
          </Route>

          {/* Full-screen Editor outside Sidebar layout */}
          <Route path="/admin/templates/editor/:id" element={<ProtectedRoute><AdminRoute><AdminTemplateEditor /></AdminRoute></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

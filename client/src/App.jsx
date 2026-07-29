import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/user/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/user/Dashboard';
import InterviewSetup from './pages/user/interview/InterviewSetup';
import HRInterview from './pages/user/interview/HRInterview';
import TechnicalInterview from './pages/user/interview/TechnicalInterview';
import CodingAssessment from './pages/user/interview/CodingAssessment';
import InterviewAnalysis from './pages/user/interview/InterviewAnalysis';
import EvaluationResult from './pages/user/EvaluationResult';
import HRInterviewResultPage from './pages/user/interview/HRInterviewResultPage';
import FullMockInterview from './pages/user/interview/FullMockInterview';
import FullMockReport from './pages/user/interview/FullMockReport';
import History from './pages/user/History';
import HistoryDetail from './pages/user/HistoryDetail';
import HistoryCompare from './pages/user/HistoryCompare';
import UserQuestionBank from './pages/user/UserQuestionBank';
import PracticeQuestion from './pages/user/PracticeQuestion';
import CodingPracticeWorkspace from './pages/user/CodingPracticeWorkspace';
import UpgradePage from './pages/user/UpgradePage';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminQuestionBank from './pages/admin/AdminQuestionBank';
import AdminAddQuestion from './pages/admin/AdminAddQuestion';
import AdminCodingBank from './pages/admin/AdminCodingBank';
import AdminAddCodingProblem from './pages/admin/AdminAddCodingProblem';
import AdminAIMonitor from './pages/admin/AdminAIMonitor';
import AdminInterviewData from './pages/admin/AdminInterviewData';


function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
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
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Protected routes in Sidebar layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/setup" element={<InterviewSetup />} />
            <Route path="/interview/hr" element={<HRInterview />} />
            <Route path="/interview/analysis/:sessionId" element={<InterviewAnalysis />} />
            <Route path="/interviews/hr/:sessionId/result" element={<HRInterviewResultPage />} />
            <Route path="/interview/technical" element={<TechnicalInterview />} />
            <Route path="/interview/coding" element={<CodingAssessment />} />
            <Route path="/interview/full-mock" element={<FullMockInterview />} />
            <Route path="/interview/full-mock/result/:guid" element={<FullMockReport />} />
            <Route path="/evaluation/:id" element={<EvaluationResult />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/compare" element={<HistoryCompare />} />
            <Route path="/history/:id" element={<HistoryDetail />} />
            <Route path="/question-bank" element={<UserQuestionBank />} />
            <Route path="/question-bank/practice/:id" element={<PracticeQuestion />} />
            <Route path="/upgrade" element={<UpgradePage />} />

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
            <Route path="/admin/coding-bank/add" element={<AdminAddCodingProblem />} />
            <Route path="/admin/coding-bank/edit/:id" element={<AdminAddCodingProblem />} />


            {/* Add other admin routes here in the future */}
          </Route>


          <Route path="/coding-practice/:id" element={<ProtectedRoute><CodingPracticeWorkspace /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

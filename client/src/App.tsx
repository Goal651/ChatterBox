import './App.css';
import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import LoadingPage from './pages/LoadingPage';
import useSocketConfig from './config/SocketConfig';
import ErrorBoundary from './components/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./admin/Dashboard'));
const Auth = lazy(() => import('./auth/Auth'));
const NetworkChecker = lazy(() => import('./error/NetworkChecker'));
const LoginPage = lazy(() => import('./auth/Login'));
const SignUpPage = lazy(() => import('./auth/Signup'));
const FileUploaderTest = lazy(() => import('./test/Tester'));
const PageNotFound = lazy(() => import('./error/PageNotFound'));
const VerifyEmail = lazy(() => import('./services/VerifyEmail'));
const EmailSent = lazy(() => import('./services/EmailSent'));

//https://chatterbox-production-b137.up.railway.app

export default function App() {
  const deviceType = {
    isDesktop: useMediaQuery({ minWidth: 1024 }),
    isTablet: useMediaQuery({ minWidth: 768, maxWidth: 1023 }),
    isMobile: useMediaQuery({ maxWidth: 767 })
  };
  const [status, setStatus] = useState(false);
  const host: string = "http://localhost:3001";
  const socket = useSocketConfig({ serverUrl: host, status });
  const serverUrl = host + '/api';

  const handleLogin = (data: boolean) => setStatus(data);

  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<Auth serverUrl={serverUrl} />} />
            <Route path="/verify/:token" element={<VerifyEmail serverUrl={serverUrl} />} />
            <Route path="/email-sent" element={<EmailSent />} />
            <Route path="/no-internet" element={<NetworkChecker serverUrl={serverUrl} />} />
            <Route path="/login" element={<LoginPage serverUrl={serverUrl} status={handleLogin} />} />
            <Route path="/signup" element={<SignUpPage serverUrl={serverUrl} />} />
            <Route path="/test" element={<FileUploaderTest />} />
            <Route path="/admin/:page" element={<AdminDashboard serverUrl={serverUrl} />} />
            <Route path="/:sessionType/:componentId" element={<Dashboard socket={socket} mediaType={deviceType} serverUrl={serverUrl} />} />
            <Route path="/:sessionType/:componentId/:setting" element={<Dashboard socket={socket} mediaType={deviceType} serverUrl={serverUrl} />} />
            <Route path="/:sessionType/" element={<Dashboard socket={socket} mediaType={deviceType} serverUrl={serverUrl} />} />
            <Route path="/:sessionType/*" element={<PageNotFound />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

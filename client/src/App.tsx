import './App.css';
import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import LoadingPage from './app/LoadingPage';
import useSocketConfig from './config/SocketConfig';
import ErrorBoundary from './components/shared/ErrorBoundary';
import Layout from './app/layout';

const Dashboard = lazy(() => import('./app/Dashboard'));
const AdminDashboard = lazy(() => import('./app/admin/Dashboard'));
const Auth = lazy(() => import('./app/auth/Auth'));
const NetworkChecker = lazy(() => import('./error/NetworkChecker'));
const LoginPage = lazy(() => import('./app/Login'));
const SignUpPage = lazy(() => import('./app/Signup'));
const FileUploaderTest = lazy(() => import('./test/Tester'));
const PageNotFound = lazy(() => import('./error/PageNotFound'));
const VerifyEmail = lazy(() => import('./utils/VerifyEmail'));
const EmailSent = lazy(() => import('./utils/EmailSent'));

//https://chatterbox-production-b137.up.railway.app

export default function App() {
  const deviceType = {
    isDesktop: useMediaQuery({ minWidth: 1024 }),
    isTablet: useMediaQuery({ minWidth: 768, maxWidth: 1023 }),
    isMobile: useMediaQuery({ maxWidth: 767 })
  };
  const [status, setStatus] = useState(false);
  const socket = useSocketConfig({ status });

  const handleLogin = (data: boolean) => setStatus(data);

  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          <Layout>
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/verify/:token" element={<VerifyEmail />} />
              <Route path="/email-sent" element={<EmailSent />} />
              <Route path="/no-internet" element={<NetworkChecker />} />
              <Route path="/login" element={<LoginPage status={handleLogin} />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/test" element={<FileUploaderTest />} />
              <Route path="/admin/:page" element={<AdminDashboard />} />
              <Route path="/:sessionType/:componentId" element={<Dashboard socket={socket} mediaType={deviceType} />} />
              <Route path="/:sessionType/:componentId/:setting" element={<Dashboard socket={socket} mediaType={deviceType} />} />
              <Route path="/:sessionType/" element={<Dashboard socket={socket} mediaType={deviceType} />} />
              <Route path="/:sessionType/*" element={<PageNotFound />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Layout>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

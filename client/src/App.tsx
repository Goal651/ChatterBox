import './App.css';
import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoadingPage from './app/LoadingPage';
import ErrorBoundary from './error/ErrorBoundary';
import Layout from './app/layout';
import Home from './app/Home';
import Notification from './components/shared/Notification';


const Auth = lazy(() => import('./app/auth/Auth'));
const LoginPage = lazy(() => import('./app/Login'));
const SignUpPage = lazy(() => import('./app/Signup'));


export default function App() {
  const [status, setStatus] = useState(false);

  const handleLogin = (data: boolean) => setStatus(data);

  return (
    <>
      <Notification />
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path="/login" element={<LoginPage status={handleLogin} />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    {/* <Route path="/verify/:token" element={<VerifyEmail />} />
                  <Route path="/email-sent" element={<EmailSent />} />
                  <Route path="/no-internet" element={<NetworkChecker />} />
                  <Route path="/admin/" element={<AdminDashboard />} /> */}
                    {/* <Route path="*" element={<PageNotFound />} /> */}
                  </Routes>
                </Layout>
              } />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </>
  );
}

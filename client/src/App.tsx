import './App.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoadingPage from './app/LoadingPage';
import ErrorBoundary from './error/ErrorBoundary';
import Layout from './app/layout';
import Home from './app/Home';
import Notification from './components/common/Notification';
import SettingsLayout from './app/settings/layout';
import SettingsAccount from './components/shared/settings/Account';


const LoginPage = lazy(() => import('./app/Login'));
const SignUpPage = lazy(() => import('./app/Signup'));


export default function App() {
  return (
    <>
      <Notification />
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="*" element={
                <Layout>
                  <Routes>
                    <Route path="/settings/*" element={
                      <SettingsLayout>
                        <Routes>
                          <Route path="/profile" element={<SettingsAccount />} />
                        </Routes>
                      </SettingsLayout>
                    } />
                    <Route path="/chat/:userId" element={<Home />} />
                    <Route path="/*" element={<Home />} />
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

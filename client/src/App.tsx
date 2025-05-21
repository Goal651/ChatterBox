import './App.css'
import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LoadingPage from './app/LoadingPage'
import ErrorBoundary from './error/ErrorBoundary'
import Layout from './app/layout'
import Home from './app/Home'
import SettingsLayout from './app/settings/layout'
import SettingsAccount from './components/settings/Account'
import { SettingsBlocklist } from './components/settings/BlockList'
import { SettingsNotifications } from './components/settings/Notification'
import SettingsPreferences from './components/settings/Preferences'
import { SettingsDangerZone } from './components/settings/DangerZone'
import { Test } from './test/Tester'
import NewGroup from './app/NewGroup'
import Notifications from './app/Notification'
import Notification from './components/common/Notification'
import { SocketProvider } from './context/SocketContext'


const LoginPage = lazy(() => import('./app/Login'))
const SignUpPage = lazy(() => import('./app/Signup'))


export default function App() {
  const [status, setStatus] = useState(false)
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setStatus(true)
  }, [])
  return (
    <>
      <Notification />
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingPage />}>
            <SocketProvider status={status}>
              <Routes>
                <Route path='/test' element={<Test />} />
                <Route path="/login" element={<LoginPage loggedIn={(status) => setStatus(status)} />} />
                <Route path="/login/:verifyEmail" element={<LoginPage loggedIn={(status) => setStatus(status)} />} />
                <Route path="/signup" element={<SignUpPage />} />

                <Route path="*" element={
                  <Layout>
                    <Routes>
                      <Route path="/settings/*" element={
                        <SettingsLayout>
                          <Routes>
                            <Route path="/profile" element={<SettingsAccount />} />
                            <Route path="/blocklist" element={<SettingsBlocklist />} />
                            <Route path="/notifications" element={<SettingsNotifications />} />
                            <Route path="/preferences" element={<SettingsPreferences />} />
                            <Route path="/dangerzone" element={<SettingsDangerZone />} />
                          </Routes>
                        </SettingsLayout>
                      } />
                      <Route path='/notifications' element={<Notifications />} />
                      <Route path='/newGroup' element={<NewGroup />} />
                      <Route path="/c/:tab/:id" element={<Home />} />
                      <Route path="*" element={<Home />} />
                    </Routes>
                  </Layout>
                } />
              </Routes>
            </SocketProvider>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </>
  )
}

import './App.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LoadingPage from './app/LoadingPage'
import ErrorBoundary from './error/ErrorBoundary'
import Layout from './app/layout'
import Home from './app/Home'
import Notification from './components/common/Notification'
import SettingsLayout from './app/settings/layout'
import SettingsAccount from './components/settings/Account'
import { SettingsBlocklist } from './components/settings/BlockList'
import { SettingsNotifications } from './components/settings/Notification'
import SettingsPreferences from './components/settings/Preferences'
import { SettingsDangerZone } from './components/settings/DangerZone'
import { Test } from './test/Tester'
import NewGroup from './app/NewGroup'

const LoginPage = lazy(() => import('./app/Login'))
const SignUpPage = lazy(() => import('./app/Signup'))


export default function App() {
  return (
    <>
      <Notification />
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path='/test' element={<Test />} />
              <Route path="/login" element={<LoginPage />} />
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
                    <Route path='/newGroup' element={<NewGroup />} />
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
  )
}

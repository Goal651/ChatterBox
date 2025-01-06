import './index.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import LoadingPage from './main/LoadingPage'
import PeerConfig from './config/PeerConfig'


const Dashboard = lazy(() => import('./main/Dashboard'))
const Auth = lazy(() => import('./auth/Auth'))
const NetworkChecker = lazy(() => import('./error/NetworkChecker'))
const LoginPage = lazy(() => import('./auth/Login'))
const SignUpPage = lazy(() => import('./auth/Signup'))
const FileUploaderTest = lazy(() => import('./test/Tester'))
const PageNotFound = lazy(() => import('./error/PageNotFound'))


//https://chatterbox-production-bb1f.up.railway.app/
export default function App() {
  const deviceType = {
    isDesktop: useMediaQuery({ minWidth: 1024 }),
    isTablet: useMediaQuery({ minWidth: 768, maxWidth: 1023 }),
    isMobile: useMediaQuery({ maxWidth: 767 })
  };

  const serverUrl = "https://chatterbox-production-bb1f.up.railway.app/api"
const peer = PeerConfig()

  return (
    <Router>
      <Suspense fallback={<div><LoadingPage /></div>}>
        <Routes>
          <Route path="/" element={<Auth serverUrl={serverUrl} />} />
          <Route path="/:sessionType/:friendId" element={<Dashboard mediaType={deviceType} serverUrl={serverUrl} />} />
          <Route path="/:sessionType/" element={<Dashboard mediaType={deviceType} serverUrl={serverUrl} />} />
          <Route path="/no-internet" element={<NetworkChecker serverUrl={serverUrl} />} />
          <Route path="/login" element={<LoginPage serverUrl={serverUrl} />} />
          <Route path='/signup' element={<SignUpPage serverUrl={serverUrl} />} />
          <Route path='/test' element={<FileUploaderTest peer={peer} />} />
          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
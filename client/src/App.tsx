import './App.css'
import { lazy, Suspense, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import LoadingPage from './main/LoadingPage'
import useSocketConfig from './config/SocketConfig'


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
  const [status, setStatus] = useState(false)
  const host: string = "https://chatterbox-production-b137.up.railway.app"
  const socket = useSocketConfig({ serverUrl: host, status })
  const serverUrl = host + '/api'

  const handleLogin = (data: boolean) => setStatus(data)

  return (
    <Router>
      <Suspense fallback={<div><LoadingPage /></div>}>
        <Routes>
          <Route path="/" element={<Auth serverUrl={serverUrl} />} />
          <Route path="/:sessionType/:componentId" element={<Dashboard socket={socket} mediaType={deviceType} serverUrl={serverUrl} />} />
          <Route path="/:sessionType/:componentId/:setting" element={<Dashboard socket={socket} mediaType={deviceType} serverUrl={serverUrl} />} />

          <Route path="/:sessionType/" element={<Dashboard socket={socket} mediaType={deviceType} serverUrl={serverUrl} />} />
          <Route path="/no-internet" element={<NetworkChecker serverUrl={serverUrl} />} />
          <Route path="/login" element={<LoginPage serverUrl={serverUrl} status={handleLogin} />} />
          <Route path='/signup' element={<SignUpPage serverUrl={serverUrl} />} />
          <Route path='/test' element={<FileUploaderTest />} />
          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

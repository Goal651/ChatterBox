import './index.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LoadingPage from './main/LoadingPage'


const Dashboard = lazy(() => import('./main/Dashboard'))
const Auth = lazy(() => import('./auth/Auth'))
const NetworkChecker = lazy(() => import('./error/NetworkChecker'))
const LoginPage = lazy(() => import('./auth/Login'))
const SignUpPage = lazy(() => import('./auth/Signup'))
const FileUploaderTest = lazy(() => import('./test/Tester'))
const PageNotFound = lazy(() => import('./error/PageNotFound'))


//https://chatterbox-production-bb1f.up.railway.app/
export default function App() {
  const serverUrl = 'https://chatterbox-production-bb1f.up.railway.app/api'
  return (
    <Router>
        <Suspense fallback={<div><LoadingPage /></div>}>
          <Routes>
            <Route path="/" element={<Auth serverUrl={serverUrl} />} />
            <Route path="/chat/:id" element={<Dashboard serverUrl={serverUrl} />} />
            <Route path="/chat/" element={<Dashboard serverUrl={serverUrl} />} />
            <Route path="/no-internet" element={<NetworkChecker serverUrl={serverUrl} />} />
            <Route path="/login" element={<LoginPage serverUrl={serverUrl} />} />
            <Route path='/signup' element={<SignUpPage serverUrl={serverUrl} />} />
            <Route path='/test' element={<FileUploaderTest />} />
            <Route path='*' element={<PageNotFound />} />
          </Routes>
        </Suspense>
    </Router>
  )
}
import React, { Suspense, useEffect,useState } from 'react'
import { HashRouter, Route, Routes,useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './ProtectedRoute';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const ForgotPassword = React.lazy(() => import('./views/pages/forgot-password/FogotPassword'))
const ResetPassword = React.lazy(() => import('./views/pages/forgot-password/ResetPassword'))


const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('octaerpservice-theme')
  const storedTheme = useSelector((state) => state.theme)

  const [loading, setLoading] = useState(true);
  


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
 console.log('application');

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <AuthProvider>
        <Routes>
            {/* Public Routes */}
            <Route exact path="/" element={<Login />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/404" element={<Page404 />} />
            <Route exact path="/500" element={<Page500 />} />
            <Route exact path="/forgot-password" element={<ForgotPassword />} />
            <Route exact path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="*" element={<ProtectedRoute element={<DefaultLayout />} />} />
          </Routes>
        </AuthProvider>
      </Suspense>
    </HashRouter>
  )
}

export default App

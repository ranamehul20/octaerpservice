import React, { Suspense, useEffect,useState } from 'react'
import { HashRouter, Route, Routes,useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import { AuthProvider } from './AuthContext'


// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))


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
            <Route exact path="/" element={<Login />} />
            <Route exact path="/login" name="Login Page" element={<Login />} />
            <Route exact path="/404" name="Page 404" element={<Page404 />} />
            <Route exact path="/500" name="Page 500" element={<Page500 />} />
            <Route path="*" name="Home" element={<DefaultLayout />} />
            {/* <Route path="*" name="Home" element={<ProtectedRoute element={<DefaultLayout />}/>} /> */}
          </Routes>
        </AuthProvider>
      </Suspense>
    </HashRouter>
  )
}

export default App

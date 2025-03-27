import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CSpinner } from '@coreui/react';
import './scss/style.scss';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));
const ForgotPassword = React.lazy(() => import('./views/pages/forgot-password/FogotPassword'));
const ResetPassword = React.lazy(() => import('./views/pages/forgot-password/ResetPassword'));
const PrivacyPolicyPage = React.lazy(() => import('./views/pages/PrivacyPolicyPage'));
const PaymentComponent = React.lazy(() => import('./views/pages/page500/PaymentComponent'));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/payment" element={<PaymentComponent />} />
            <Route path="/404" element={<Page404 />} />
            <Route path="/500" element={<Page500 />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="*" element={<ProtectedRoute element={<DefaultLayout />} />} />
          </Routes>
        </AuthProvider>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
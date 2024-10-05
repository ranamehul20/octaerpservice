import React,{ useState,useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser  } from '@coreui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { loginService } from "../../../services/AuthService";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);  // Toggle the showPassword state
  };
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    console.log("login");
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  },[]);
  
  // API call to login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await loginService(email, password);
    if(response.code ===200 && !response.error) {
      setLoading(false);
      // Perform login, set the token in the HTTP-only cookie on the server side
      navigate('/dashboard');
    }else{
      setError(response.message);
      setLoading(false);
    }
  };
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>
                    {error && <CAlert color="danger">{error}</CAlert>}
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput  type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required autoComplete="email" />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        autoComplete="current-password"
                      />
                      <CInputGroupText onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} /> {/* Using FontAwesome icon */}
                      </CInputGroupText>
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login

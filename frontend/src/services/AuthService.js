import axios from "axios";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

export const loginService = async (email, password) => {
  try {
    const response = await axios.post(
      `${apiUrl}/auth/adminlogin`,
      { email, password },
      {
        withCredentials: true, // Important to include cookies in the request
      }
    );
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const logoutService = async (req, res, next) => {
  try {
    const response = await axios.post(
       `${apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const checkAuthentication = async (req, res) => {
  try {
    const response = await axios.get( `${apiUrl}/auth/check`, { withCredentials: true });
    console.log(response);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(
      `${apiUrl}/auth/forgot-password`,
      { email: email },
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(
      `${apiUrl}/auth/reset-password/${token}`,
      { password: password },
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};


import axios from "axios";
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
export const listRequest = async () => {
  try {
    const response = await axios.get(`${apiUrl}/houses`, {
      withCredentials: true, // Important to include cookies in the request
    });
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const createRequest = async (formData) => {
  try {
    const response = await axios.post(`${apiUrl}/houses`, formData,{
      withCredentials: true
  });
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const updateRequest = async (id,formData) => {
  try {
    const response = await axios.post(`${apiUrl}/houses/${id}`, formData,{
        withCredentials: true
    });
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const deleteRequest = async () => {
  try {
    const response = await axios.get(`${apiUrl}/houses`, {
      withCredentials: true, // Important to include cookies in the request
    });
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const viewRequest = async (id) => {
  try {
    const response = await axios.get(`${apiUrl}/houses/${id}`,{
      withCredentials: true, // Important to include cookies in the request
  });
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getBlockRequest = async (id) => {
  try {
    const response = await axios.get(`${apiUrl}/blocks?societyId=${id}`, {
      withCredentials: true, // Important to include cookies in the request
    });
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getSocietyRequest = async () => {
    try {
      const response = await axios.get(`${apiUrl}/config/societies`, {
        withCredentials: true, // Important to include cookies in the request
      });
      console.log("Success", response);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

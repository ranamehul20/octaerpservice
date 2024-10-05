import axios from "axios";
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
export const listRequest = async () => {
  try {
    const response = await axios.get(`${apiUrl}/societies`, {
      withCredentials: true, // Important to include cookies in the request
    });
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw error;
  }
};

export const createRequest = async (formData) => {
  try {
    const response = await await axios.post(
      `${apiUrl}/societies`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw error;
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
    throw error;
  }
};

export const deleteRequest = async () => {
  try {
    const response = await axios.get(`${apiUrl}/societies`, {
      withCredentials: true, // Important to include cookies in the request
    });
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw error;
  }
};

export const viewRequest = async (id) => {
  try {
    const response = await axios.get(`${apiUrl}/houses/${id}`, {
        withCredentials: true, // Important to include cookies in the request
      });
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw error;
  }
};

export const getBlockRequest = async (id) => {
    try {
      const response = await axios.get(`${apiUrl}/blocks?societyId=${selectedSociety}`, {
          withCredentials: true, // Important to include cookies in the request
        });
      console.log("Success", response);
      return response.data;
    } catch (err) {
      throw error;
    }
  };

  export const getSocietyRequest = async (id) => {
    try {
      const response = await axios.get(`${apiUrl}/blocks?societyId=${selectedSociety}`, {
          withCredentials: true, // Important to include cookies in the request
        });
      console.log("Success", response);
      return response.data;
    } catch (err) {
      throw error;
    }
  };

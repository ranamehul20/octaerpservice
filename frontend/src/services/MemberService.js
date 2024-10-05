import axios from "axios";
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
export const listRequest = async () => {
  try {
    const response = await axios.get("http://localhost:3001/api/blocks", {
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
      "http://localhost:3001/api/societies",
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

export const updateRequest = async (formData) => {
  try {
    const response = await await axios.post(
      `http://localhost:3001/api/blocks/${id}`,
      formData,
      {
        withCredentials: true,
      }
    );
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw error;
  }
};

export const deleteRequest = async () => {
  try {
    const response = await axios.get("http://localhost:3001/api/societies", {
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
    const response = await axios.get(`http://localhost:3001/api/blocks/${id}`, {
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
    const response = await axios.get(
      "http://localhost:3001/api/config/societies",
      {
        withCredentials: true, // Important to include cookies in the request
      }
    );
    console.log("Success", response);
    return response.data;
  } catch (err) {
    throw error;
  }
};

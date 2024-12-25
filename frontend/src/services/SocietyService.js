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
    throw err;
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
    throw err;
  }
};

export const updateRequest = async (id,formData) => {
  try {
    const response = await axios.post(`${apiUrl}/societies/${id}`, formData,{
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
    const response = await axios.get(`${apiUrl}/societies`, {
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
    const response = await axios.get(
      `${apiUrl}/societies/${id}`,
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

export const getCity = async (selectedState) => {
  try {
    const response = await axios.get(
      `${apiUrl}/config/city?state=${selectedState}`,
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

export const getState = async (selectedCountry) => {
  try {
    const response = await axios.get(
      `${apiUrl}/config/state?country=${selectedCountry}`,
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

export const getCountry = async () => {
  try {
    const response = await axios.get(
      `${apiUrl}/config/country`,
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

export const getStaticValues = async () => {
  try {
    const response = await axios.get(`${apiUrl}/config/staticvalue`,
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

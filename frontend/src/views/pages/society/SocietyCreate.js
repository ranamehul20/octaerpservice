import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CAlert,
  CFormSelect,
  CImage,
} from "@coreui/react";
import axios from "axios";
import { createRequest,getCity,getState, getCountry } from "../../../services/SocietyService";

const SocietyCreate = () => {
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    establishment: "",
    type: "",
    logo: null,
    registrationNumber: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await getCountry();
        if (response.code === 200 && !response.error) {
          setCountries(response.results);
        } else {
          console.error("Error fetching countries:", response.message);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Fetch states when a country is selected
  useEffect(() => {
    const fetchStates = async () => {
      if (selectedCountry) {
        try {
          const response = await getState(selectedCountry);
          if (response.code === 200 && !response.error) {
            setStates(response.results); // Adjust this based on your API response structure
          } else {
            console.error("Error fetching states:", response.message);
          }
        } catch (error) {
          console.error("Error fetching states:", error);
        }
      } else {
        setStates([]); // Reset states if no country is selected
      }
    };

    fetchStates();
  }, [selectedCountry]);

  // Fetch city when a state is selected
  useEffect(() => {
    const fetchCity = async () => {
      if (selectedState) {
        try {
          const response = await getCity(selectedState);
          if (response.code === 200 && !response.error) {
            setCities(response.results); // Adjust this based on your API response structure
          } else {
            console.error("Error fetching city:", response.message);
          }
        } catch (error) {
          console.error("Error fetching city:", error);
        }
      } else {
        setCities([]); // Reset states if no country is selected
      }
    };

    fetchCity();
  }, [selectedState]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountrySelect = (e) => {
    setSelectedCountry(e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStateSelect = (e) => {
    setSelectedState(e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCitySelect = (e) => {
    setSelectedCity(e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, logo: file });
    setPreviewLogo(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await createRequest(formData);
      if (response.code === 200 && !response.error) {
        setSuccess(true);
        setFormData({
          name: "",
          street: "",
          locality: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
          establishment: "",
          type: "",
          logo: null,
          registrationNumber: "",
        });
        setPreviewLogo(null);
      }else{
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to create society. Please try again.");
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Create Society</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CFormLabel htmlFor="name" className="col-sm-2 col-form-label">
                  Society Name
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Society Name"
                    value={formData.fname}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="street"
                  className="col-sm-2 col-form-label"
                >
                  Address Line 1
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    placeholder="Address Line 1"
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="locality"
                  className="col-sm-2 col-form-label"
                >
                  Locality
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="locality"
                    name="locality"
                    value={formData.locality}
                    placeholder="Locality"
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="country"
                  className="col-sm-2 col-form-label"
                >
                  Country
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleCountrySelect}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CFormLabel htmlFor="state" className="col-sm-2 col-form-label">
                  State
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleStateSelect}
                    disabled={!selectedCountry}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CFormLabel htmlFor="city" className="col-sm-2 col-form-label">
                  City
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleCitySelect}
                    disabled={!selectedState}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="zipCode"
                  className="col-sm-2 col-form-label"
                >
                  Zip code
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="tel"
                    id="zipCode"
                    name="zipCode"
                    placeholder="Zip Code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="establishment"
                  className="col-sm-2 col-form-label"
                >
                  Establishment Date
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="Date"
                    id="establishment"
                    name="establishment"
                    placeholder="Establishment Date"
                    value={formData.establishment}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="type" className="col-sm-2 col-form-label">
                  Society Type
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="">Select Society Type</option>
                    <option key="1" value="1">
                      Tenament
                    </option>
                    <option key="2" value="2">
                      Flat
                    </option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="registrationNumber"
                  className="col-sm-2 col-form-label"
                >
                  Registration Number
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    placeholder="Registration Number"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="logo" className="col-sm-2 col-form-label">
                  Logo
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="file"
                    id="logo"
                    name="logo"
                    onChange={handleLogoChange}
                    accept="image/*"
                  />
                </CCol>
              </CRow>
              {previewLogo && (
                <CRow className="mb-3">
                  <CCol sm={2}></CCol>
                  <CCol sm={10}>
                    <CImage
                      src={previewLogo}
                      alt="Logo Preview"
                      width={200}
                      className="mb-2"
                    />
                  </CCol>
                </CRow>
              )}
              <CButton type="submit" color="primary">
                Submit
              </CButton>
            </CForm>
            {error && (
              <CAlert color="danger" className="mt-3">
                {error}
              </CAlert>
            )}
            {success && (
              <CAlert color="success" className="mt-3">
                Society created successfully!
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default SocietyCreate;

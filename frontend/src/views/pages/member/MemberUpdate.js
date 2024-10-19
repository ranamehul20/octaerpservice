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
} from "@coreui/react";
import {
  getStaticValues,
  getCountry,
  getCity,
  getState,
} from "../../../services/SocietyService";
import {
  createRequest,
  getSocietyRequest,
  getBlockRequest,
  getHouseRequest,
  viewRequest
} from "../../../services/MemberService";

const MemberUpdate = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    isDefaultPassword: true,
    firstname: "",
    lastname: "",
    phoneNumber: "",
    dateOfBirth: "",
    blockNumber: "",
    houseNumber: "",
    societyId: "",
    totalMembers: "",
    street: "",
    locality: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState("");
  const [staticValues, setStaticValues] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState("");

  // Function to fetch existing user details
  const fetchUserDetails = async () => {
    try {
      const response = await viewRequest(id);
      if(response.code === 200 && !response.error) {
        const data = response.results;
        const res= {...data.settings, ...data};
        setFormData(res);
        setSelectedCountry(data.country);
        setSelectedState(data.state);
        setSelectedCity(data.city);
      }
    } catch (error) {
      console.error('Failed to fetch society details:', error);
    }
  };

  // Fetch societies on component mount
  const fetchStaticValues = async () => {
    try {
      const response = await getStaticValues();
      if (response.code === 200 && !response.error) {
        setStaticValues(response.results);
      } else {
        console.error("Error fetching static values:", response.error);
      }
    } catch (error) {
      console.error("Error fetching static values:", error);
    }
  };
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

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const response = await getSocietyRequest();
        if (response.code === 200 && !response.error) {
          setSocieties(response.results);
        } else {
          console.error("Error fetching societies:", response.error);
        }
      } catch (error) {
        console.error("Error fetching societies:", error);
      }
    };


    fetchSocieties();
    fetchStaticValues();
    fetchCountries();
    fetchUserDetails();
}, []);

  // Fetch block on component mount
  useEffect(() => {
    const fetchBlocks = async () => {
      if (selectedSociety) {
        try {
          const response = await getBlockRequest(selectedSociety);
          if (response.code === 200 && !response.error) {
            setBlocks(response.results);
          } else {
            console.error("Error fetching blocks:", response.error);
          }
        } catch (error) {
          console.error("Error fetching blocks:", error);
        }
      }
    };
    fetchBlocks();
  }, [selectedSociety]);

  // Fetch house on component mount
  useEffect(() => {
    const fetchHouse = async () => {
      if (selectedBlock) {
        try {
          const response = await getHouseRequest(selectedBlock);
          if (response.code === 200 && !response.error) {
            setHouses(response.results);
          } else {
            console.error("Error fetching house:", response.error);
          }
        } catch (error) {
          console.error("Error fetching house:", error);
        }
      }
    };
    fetchHouse();
  }, [selectedBlock]);

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

  const handleRoleSelect = (e) => {
    setSelectedRoles(e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocietySelect = (e) => {
    setSelectedSociety(e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlockSelect = (e) => {
    setSelectedBlock(e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHouseSelect = (e) => {
    setSelectedHouse(e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await createRequest(formData);
      setSuccess(true);
      setFormData({
        email: "",
        password: "",
        role: "",
        isDefaultPassword: "",
        firstname: "",
        lastname: "",
        phoneNumber: "",
        dateOfBirth: "",
        blockNumber: "",
        houseNumber: "",
        societyId: "",
        totalMembers: "",
        street: "",
        locality: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      });
    } catch (err) {
      setError("Failed to create house. Please try again.");
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Create Members</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="firstname"
                  className="col-sm-2 col-form-label"
                >
                  First Name <span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    placeholder="Enter first name"
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="lastname"
                  className="col-sm-2 col-form-label"
                >
                  Last Name <span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    placeholder="Enter last name"
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="email" className="col-sm-2 col-form-label">
                  Email <span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter Email Id"
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="phoneNumber"
                  className="col-sm-2 col-form-label"
                >
                  Phone Number
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    placeholder="Enter phone number"
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="role" className="col-sm-2 col-form-label">
                  Role <span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleRoleSelect}
                  >
                    <option value="">Select Role</option>
                    {staticValues &&
                      staticValues.userTypes &&
                      Object.keys(staticValues.userTypes).map((key) => (
                        <option key={key} value={key}>
                          {staticValues.userTypes[key]}
                        </option>
                      ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="dateOfBirth"
                  className="col-sm-2 col-form-label"
                >
                  Date Of Birth
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="Date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    placeholder="Select Date of birth"
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="societyId"
                  className="col-sm-2 col-form-label"
                >
                  Society <span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="societyId"
                    name="societyId"
                    value={formData.societyId}
                    onChange={handleSocietySelect}
                  >
                    <option value="">Select Society</option>
                    {societies.map((society) => (
                      <option key={society._id} value={society._id}>
                        {society.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="blockNumber"
                  className="col-sm-2 col-form-label"
                >
                  Block <span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="blockNumber"
                    name="blockNumber"
                    value={formData.blockNumber}
                    onChange={handleBlockSelect}
                    disabled={!selectedSociety}
                  >
                    <option value="">Select Block</option>
                    {blocks.map((block) => (
                      <option key={block._id} value={block._id}>
                        {block.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="houseNumber"
                  className="col-sm-2 col-form-label"
                >
                  House Number <span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="houseNumber"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleHouseSelect}
                    disabled={!selectedBlock}
                  >
                    <option value="">Select House</option>
                    {houses.map((house) => (
                      <option key={house._id} value={house._id}>
                        {house.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="totalMembers"
                  className="col-sm-2 col-form-label"
                >
                  Total Members <span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="totalMembers"
                    name="totalMembers"
                    value={formData.totalMembers}
                    placeholder="Enter total members"
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
                  />
                </CCol>
              </CRow>
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
                Member details updated successfully!
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default MemberUpdate;

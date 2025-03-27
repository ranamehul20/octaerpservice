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
import {
  createRequest,
  getCity,
  getState,
  getCountry,
} from "../../../services/SocietyService";

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
    maintenanceAmount: "",
    maintenanceFrequency: "",
    dueDay: "",
    latePaymentPenalty: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    bankName: "",
    bankBranch: "",
    bankAccountNumber: "",
    bankIFSCCode: "",
    gstApplicable: "no", // Default to no
    gstPercentage: "",
  });
  const [showGstInput, setShowGstInput] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const handleGstChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, gstApplicable: value });
    setShowGstInput(value === "yes");
  };

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

  const handleMaintenanceFreqSelect = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, logo: file });
    setPreviewLogo(URL.createObjectURL(file));
  };

  // Handle input change and restrict to numbers only
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only numbers using a regular expression
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisabled(true);
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
          maintenanceAmount: "",
          maintenanceFrequency: "",
          dueDay: "",
          latePaymentPenalty: "",
        });
        setPreviewLogo(null);
        setIsDisabled(false);
      } else {
        console.log("error", response);
        setError(response.errors);
        setIsDisabled(false);
      }
    } catch (err) {
      console.log("error", err.response.data.errors);
      setError(err.response.data.errors);
      setIsDisabled(false);
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CForm onSubmit={handleSubmit}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Create Society</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CFormLabel htmlFor="name" className="col-sm-2 col-form-label">
                  Society Name <span className="required-asterisk">*</span>
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
                  Address Line 1 <span className="required-asterisk">*</span>
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
                  Locality <span className="required-asterisk">*</span>
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
                  Country <span className="required-asterisk">*</span>
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
                  State <span className="required-asterisk">*</span>
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
                  City <span className="required-asterisk">*</span>
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
                  Zip code <span className="required-asterisk">*</span>
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
                  Society Type <span className="required-asterisk">*</span>
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
            </CCardBody>
          </CCard>

          <CCard className="mt-4">
            <CCardHeader>Contact Person Details</CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CFormLabel htmlFor="contactName" className="col-sm-2 col-form-label">
                  Name (As Per PAN)<span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="contactName"
                    name="contactName"
                    placeholder="Enter Contact Person Name"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="contactEmail" className="col-sm-2 col-form-label">
                  Email Id<span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    placeholder="Enter Contact Person email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="contactPhone" className="col-sm-2 col-form-label">
                  Phone<span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="contactPhone"
                    name="contactPhone"
                    placeholder="Enter Contact Phone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <CCard className="mt-4">
            <CCardHeader>Bank Details</CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CFormLabel htmlFor="bankName" className="col-sm-2 col-form-label">
                  Bank Name<span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="bankName"
                    name="bankName"
                    placeholder="Enter Bank Name"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="bankBranch" className="col-sm-2 col-form-label">
                  Branch Name<span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="bankBranch"
                    name="bankBranch"
                    placeholder="Enter Branch Name"
                    value={formData.bankBranch}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="bankAccountNumber" className="col-sm-2 col-form-label">
                  Account Number<span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    placeholder="Enter Account Number"
                    value={formData.bankAccountNumber}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="bankIFSCCode" className="col-sm-2 col-form-label">
                  IFSC Code<span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="bankIFSCCode"
                    name="bankIFSCCode"
                    placeholder="Enter IFSC Code"
                    value={formData.bankIFSCCode}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* New Section: Maintenance Settings */}
          <CCard className="mt-4">
            <CCardHeader>Maintenance Settings</CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CFormLabel htmlFor="maintenanceAmount" className="col-sm-2 col-form-label">
                  Maintenance Amount<span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="maintenanceAmount"
                    name="maintenanceAmount"
                    placeholder="Enter maintenance amount"
                    value={formData.maintenanceAmount}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CFormLabel htmlFor="maintenanceFrequency" className="col-sm-2 col-form-label">
                  Maintenance Frequency <span className="required-asterisk">*</span>
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="maintenanceFrequency"
                    name="maintenanceFrequency"
                    value={formData.maintenanceFrequency}
                    onChange={handleMaintenanceFreqSelect}
                    required
                  >
                    <option value="">Select</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CFormLabel htmlFor="dueDay" className="col-sm-2 col-form-label">Due Date <span className="required-asterisk">*</span></CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="dueDay"
                    name="dueDay"
                    placeholder="Due Days of the month like 1,2,3"
                    value={formData.dueDay}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CFormLabel htmlFor="latePaymentPenalty" className="col-sm-2 col-form-label">
                  Late Payment Penalty
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="number"
                    id="latePaymentPenalty"
                    name="latePaymentPenalty"
                    placeholder="Enter late payment penalty"
                    value={formData.latePaymentPenalty}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CFormLabel htmlFor="gstApplicable" className="col-sm-2 col-form-label">
                  Add GST in Bill?
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect id="gstApplicable" name="gstApplicable" value={formData.gstApplicable} onChange={handleGstChange}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              {showGstInput && (
                <CRow className="mb-3">
                  <CFormLabel htmlFor="gstPercentage" className="col-sm-2 col-form-label">
                    GST Percentage
                  </CFormLabel>
                  <CCol sm={10}>
                    <CFormInput
                      type="number"
                      id="gstPercentage"
                      name="gstPercentage"
                      placeholder="Enter GST Percentage"
                      value={formData.gstPercentage}
                      onChange={(e) => setFormData({ ...formData, gstPercentage: e.target.value })}
                      required
                    />
                  </CCol>
                </CRow>
              )}
              <CButton type="submit" color="primary" disabled={isDisabled}>
                Submit
              </CButton>
            </CCardBody>
          </CCard>
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
        </CForm>
      </CCol>
    </CRow>
  );
};

export default SocietyCreate;

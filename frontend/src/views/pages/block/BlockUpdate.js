import React, { useEffect,useState } from 'react'
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
  CFormSelect,CImage
} from '@coreui/react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom';
import { getSocietyRequest, updateRequest, viewRequest } from '../../../services/BlockService';

const BlockUpdate = () => {
  const { id } = useParams(); 
  const [formData, setFormData] = useState({
    name: '',
    totalHouse: '',
    societyId: ''
  })
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  // Function to fetch existing society details
  const fetchBlockDetails = async () => {
    try {
      const response = await viewRequest(id);
      if(response.code === 200 && !response.error) {
        const data = response.results;
      Object.keys(formData).forEach(key => {
        formData[key]=data[key];
        if(key === 'societyId'){
          formData[key]=data[key]._id;
        }
      });
      // formData.societyId=data.societyId._id;
      setSelectedSociety(data.societyId._id);
      }
    } catch (error) {
      console.error('Failed to fetch block details:', error);
    }
  };

  const fetchSocieties = async () => {
    try {
      const response = await getSocietyRequest();
      if (response.code === 200 && !response.error) {
        setSocieties(response.results);
      } else {
        console.error('Error fetching societies:', response.error);
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  useEffect(() => {
    fetchSocieties();
    fetchBlockDetails();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSocietySelect = (e) => {
    setSelectedSociety(e.target.value)
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsDisabled(true);
    try {
      const res = await updateRequest(id,formData);
      if(res.code === 200 && !res.error){
        setSuccess(true);
        setIsDisabled(false);
      }else{
        setError(res.message);
        setIsDisabled(false);
      }
    } catch (err) {
      setError(err.response.data.errors)
      setIsDisabled(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Edit Block</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CFormLabel htmlFor="name" className="col-sm-2 col-form-label">Block Name <span className="required-asterisk">*</span></CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Block Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="totalHouse" className="col-sm-2 col-form-label">Total House</CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="totalHouse"
                    name="totalHouse"
                    value={formData.totalHouse}
                    placeholder="Total House"
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="societyId" className="col-sm-2 col-form-label">Society <span className="required-asterisk">*</span></CFormLabel>
                <CCol sm={10}>
                <CFormSelect
                  id="societyId"
                  name="societyId"
                  value={formData.societyId}
                  onChange={handleSocietySelect}>
                  <option value="">Select Society</option>
                  {societies.map(society => (
                    <option key={society._id} value={society._id}>
                      {society.name}
                    </option>
                  ))}
                </CFormSelect>
                </CCol>
              </CRow>
              <CButton type="submit" color="primary" disabled={isDisabled}>Submit</CButton>
            </CForm>
            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}
            {success && <CAlert color="success" className="mt-3">Block created successfully!</CAlert>}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default BlockUpdate
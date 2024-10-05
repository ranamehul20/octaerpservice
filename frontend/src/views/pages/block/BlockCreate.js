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
import { createRequest, getSocietyRequest } from '../../../services/BlockService'

const BlockCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    totalHouse: '',
    societyId: ''
  })
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState('');
  
 // Fetch societies on component mount
 useEffect(() => {
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

  fetchSocieties();
}, []);

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
    try {
      const res = await createRequest(formData);
      if(res.code === 200 && !res.error){
        setSuccess(true)
        setFormData({ 
          name: '',
          totalHouse: '',
          societyId: ''
        })
      }else{
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to create block. Please try again.')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Create Block</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CFormLabel htmlFor="name" className="col-sm-2 col-form-label">Block Name</CFormLabel>
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
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="societyId" className="col-sm-2 col-form-label">Society</CFormLabel>
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
              <CButton type="submit" color="primary">Submit</CButton>
            </CForm>
            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}
            {success && <CAlert color="success" className="mt-3">Block created successfully!</CAlert>}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default BlockCreate
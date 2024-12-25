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
  CFormSelect
} from '@coreui/react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom';
import { updateRequest, viewRequest,getBlockRequest,getSocietyRequest } from '../../../services/HouseService';

const HouseUpdate = () => {
    const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    totalMembers: 0,
    totalChildren: 0,
    totalAdults: 0,
    blockId: '',
    societyId: ''
  })
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  // Function to fetch existing society details
  const fetchHouseDetails = async () => {
    try {
      const response = await viewRequest(id);
      if(response.code === 200 && !response.error) {
        const data = response.results;
        Object.keys(formData).forEach(key => {
        formData[key]=data[key];
        if(key === 'societyId'){
          formData[key]=data[key]._id;
        }
        if(key === 'blockId'){
            formData[key]=data[key]._id;
        }
      });
      // formData.societyId=data.societyId._id;
      setSelectedSociety(data.societyId._id);
      setSelectedBlock(data.blockId._id);
      }else{
        console.error("Failed to fetch house details:".response.message);
      }
    } catch (error) {
      console.error('Failed to fetch house details:', error);
    }
  };

  useEffect(() => {
    fetchHouseDetails();
  }, [id]);
  
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

// Fetch block on component mount
useEffect(() => {
  const fetchBlocks = async () => {
    if(selectedSociety){
    try {
      const response = await getBlockRequest(selectedSociety);
      if (response.code === 200 &&!response.error) {
        setBlocks(response.results);
      } else {
        console.error('Error fetching blocks:', response.error);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  }
  };
  fetchBlocks();
}, [selectedSociety]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSocietySelect = (e) => {
    setSelectedSociety(e.target.value)
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleBlockSelect = (e) => {
    setSelectedBlock(e.target.value)
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
      }
      else{
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
            <strong>Edit House</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
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
              <CRow className="mb-3">
                <CFormLabel htmlFor="blockId" className="col-sm-2 col-form-label">Block <span className="required-asterisk">*</span></CFormLabel>
                <CCol sm={10}>
                <CFormSelect
                  id="blockId"
                  name="blockId"
                  value={formData.blockId}
                  onChange={handleBlockSelect}
                  disabled={!selectedSociety}
                  >
                  <option value="">Select Block</option>
                  {blocks.map(block => (
                    <option key={block._id} value={block._id}>
                      {block.name}
                    </option>
                  ))}
                </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="name" className="col-sm-2 col-form-label">House Number <span className="required-asterisk">*</span></CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="name"
                    name="name"
                    placeholder="House Number"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="totalMembers" className="col-sm-2 col-form-label">Type <span className="required-asterisk">*</span></CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="type"
                    name="type"
                    value={formData.type}
                    placeholder="House Type like 2BHK, 3BHK"
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="totalMembers" className="col-sm-2 col-form-label">Total Members</CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="totalMembers"
                    name="totalMembers"
                    value={formData.totalMembers}
                    placeholder="Total Members"
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="totalChildren" className="col-sm-2 col-form-label">Total Children</CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="totalChildren"
                    name="totalChildren"
                    value={formData.totalChildren}
                    placeholder="Total Children"
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="totalAdults" className="col-sm-2 col-form-label">Total Adults</CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="totalAdults"
                    name="totalAdults"
                    value={formData.totalAdults}
                    placeholder="Total Adults"
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CButton type="submit" color="primary" disabled={isDisabled}>Submit</CButton>
            </CForm>
            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}
            {success && <CAlert color="success" className="mt-3">House updated successfully!</CAlert>}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default HouseUpdate
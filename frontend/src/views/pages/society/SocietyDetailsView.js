// src/components/SocietyDetails.js
import React, { useEffect, useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton } from '@coreui/react';
import { viewRequest } from '../../../services/SocietyService';

const SocietyDetailsView = () => {
    const navigate = useNavigate();
  const { id } = useParams(); // Get the society ID from the route parameter
  const [society, setSociety] = useState(null);

  useEffect(() => {
    // Fetch society details from the backend API
    const fetchSocietyDetails = async () => {
      try {
        const response = await viewRequest(id);
        if(response.code===200 && !response.error){
          setSociety(response.results);
        }else{
          console.error('Error fetching society details:', response.message);
        }
      } catch (error) {
        console.error('Error fetching society details:', error);
      }
    };

    fetchSocietyDetails();
  }, [id]);

  if (!society) return <p>Loading...</p>; // Show loading text until society data is fetched


  const handleEdit = (id) => {
    navigate(`/society/edit/${id}`); // Redirect to the edit page
  };

  return (
    <CRow>
      <CCol xs="12" md="8" className="offset-md-2">
        <CCard>
          <CCardHeader>
            <h3>Society Details</h3>
          </CCardHeader>
          <CCardBody>
            {/* Display Society Information */}
            <p><strong>Society Name:</strong> {society.name}</p>
            <p><strong>Society Type:</strong> {society.type==1 ? 'Tenament' : 'Flat' }</p>
            <p><strong>Address:</strong> {society.street} {society.locality} </p>
            <p><strong>City:</strong> {society.city}</p>
            <p><strong>State:</strong> {society.state}</p>
            <p><strong>Country:</strong> {society.country}</p>
            <p><strong>Zip Code:</strong> {society.zipCode}</p>
            <p><strong>Registration Number:</strong> {society.settings.registrationNumber}</p>
            <p><strong>Established Date:</strong> {society.establishment}</p>
            {/* Display Society Logo */}
            {society.logo && (
              <div style={{ marginTop: '20px' }}>
                <img src={`http://localhost:3001/${society.logo}`} alt="Society Logo" style={{ width: '200px', height: '200px', borderRadius: '10px' }} />
              </div>
            )}
            
            <div style={{ marginTop: '20px' }}>
              {/* Optional Edit Button to Navigate to Edit Page */}
              <CButton color="primary" onClick={() => handleEdit(society._id)}>
                Edit Society
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default SocietyDetailsView;

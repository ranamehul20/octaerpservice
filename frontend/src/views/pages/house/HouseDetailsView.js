// src/components/SocietyDetails.js
import React, { useEffect, useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton } from '@coreui/react';
import { viewRequest } from '../../../services/HouseService';

const HouseDetailsView = () => {
    const navigate = useNavigate();
  const { id } = useParams(); // Get the society ID from the route parameter
  const [house, setHouse] = useState(null);

  useEffect(() => {
    // Fetch society details from the backend API
    const fetchHouseDetails = async () => {
      try {
        const response = await viewRequest(id);
        setHouse(response.results);
      } catch (error) {
        console.error('Error fetching house details:', error);
      }
    };

    fetchHouseDetails();
  }, [id]);

  if (!house) return <p>Loading...</p>; // Show loading text until society data is fetched


  const handleEdit = (id) => {
    navigate(`/house/edit/${id}`); // Redirect to the edit page
  };

  return (
    <CRow>
      <CCol xs="12" md="8" className="offset-md-2">
        <CCard>
          <CCardHeader>
            <h3>House Details</h3>
          </CCardHeader>
          <CCardBody>
            {/* Display Society Information */}
            <p><strong>House Number:</strong> {house.name}</p>
            <p><strong>Total Members:</strong> {house.totalMember} </p>
            <p><strong>Total Adults:</strong> {house.totalAdults} </p>
            <p><strong>Total Children:</strong> {house.totalChildren} </p>
            <p><strong>Block:</strong> {house.blockId.name} </p>
            <p><strong>Society:</strong> {house.societyId.name} </p>
            <div style={{ marginTop: '20px' }}>
              {/* Optional Edit Button to Navigate to Edit Page */}
              <CButton color="primary" onClick={() => handleEdit(house._id)}>
                Edit House
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default HouseDetailsView;
// src/components/SocietyDetails.js
import React, { useEffect, useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton } from '@coreui/react';
import { viewRequest } from '../../../services/BlockService';

const BlockDetailsView = () => {
    const navigate = useNavigate();
  const { id } = useParams(); // Get the society ID from the route parameter
  const [block, setBlock] = useState(null);

  useEffect(() => {
    // Fetch society details from the backend API
    const fetchBlockDetails = async () => {
      try {
        const response = await viewRequest(id);
        if(response.code===200 && !response.error){
          setBlock(response.results);
        }else{
          console.error('Error fetching block details:', response.message);
        }
      } catch (error) {
        console.error('Error fetching block details:', error);
      }
    };

    fetchBlockDetails();
  }, [id]);

  if (!block) return <p>Loading...</p>; // Show loading text until society data is fetched


  const handleEdit = (id) => {
    navigate(`/block/edit/${id}`); // Redirect to the edit page
  };

  return (
    <CRow>
      <CCol xs="12" md="8" className="offset-md-2">
        <CCard>
          <CCardHeader>
            <h3>Block Details</h3>
          </CCardHeader>
          <CCardBody>
            {/* Display Society Information */}
            <p><strong>Block Number:</strong> {block.name}</p>
            <p><strong>Total House:</strong> {block.totalHouse} </p>
            <p><strong>Society:</strong> {block.societyId.name} </p>
            <div style={{ marginTop: '20px' }}>
              {/* Optional Edit Button to Navigate to Edit Page */}
              <CButton color="primary" onClick={() => handleEdit(block._id)}>
                Edit Block
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default BlockDetailsView;
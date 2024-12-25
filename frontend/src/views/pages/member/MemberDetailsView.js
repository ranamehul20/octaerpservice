// src/components/SocietyDetails.js
import React, { useEffect, useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton } from '@coreui/react';
import { viewRequest } from '../../../services/MemberService';

const MemberDetailsView = () => {
    const navigate = useNavigate();
  const { id } = useParams(); // Get the society ID from the route parameter
  const [member, setMember] = useState(null);

  useEffect(() => {
    // Fetch society details from the backend API
    const fetchMemberDetails = async () => {
      try {
        const response = await viewRequest(id);
        setMember(response.results);
      } catch (error) {
        console.error('Error fetching member details:', error);
      }
    };

    fetchMemberDetails();
  }, [id]);

  if (!member) return <p>Loading...</p>; // Show loading text until society data is fetched


  const handleEdit = (id) => {
    navigate(`/members/edit/${id}`); // Redirect to the edit page
  };

  return (
    <CRow>
      <CCol xs="12" md="8" className="offset-md-2">
        <CCard>
          <CCardHeader>
            <h3>Member Details</h3>
          </CCardHeader>
          <CCardBody>
            {/* Display Society Information */}
            <p><strong>Name:</strong> {member.name}</p>
            <p><strong>Email:</strong> {member.email} </p>
            <p><strong>Phone Number:</strong> {member.phoneNumber} </p>
            <p><strong>House Number :</strong> {member.houseName} </p>
            <p><strong>Block:</strong> {member.blockName} </p>
            <p><strong>Society:</strong> {member.societyName} </p>
            <p><strong>Type:</strong> {member.roleName} </p>
            <div style={{ marginTop: '20px' }}>
              {/* Optional Edit Button to Navigate to Edit Page */}
              <CButton color="primary" onClick={() => handleEdit(member._id)}>
                Edit Member
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default MemberDetailsView;
import React,{useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton } from '@coreui/react';
import { viewRequest } from '../../services/MemberService';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [member, setMember] = useState({firstname:"",lastname:"",email:"",phoneNumber:"",houseName:"",blockName:"",societyName:"",roleName:""});
  const id = sessionStorage.getItem('userId');
// Fetch society details from the backend API
const fetchMemberDetails = async () => {
  try {
    const response = await viewRequest(id);
    setMember(response.results);
  } catch (error) {
    console.error('Error fetching member details:', error);
  }
};
  useEffect(() => {
    fetchMemberDetails();
  },[]);
  return (
    <CRow>
      <CCol xs="12" md="8" className="offset-md-2">
        <CCard>
          <CCardHeader>
            <h3>Profile Details</h3>
          </CCardHeader>
          <CCardBody>
            {/* Display Profile Information */}
            <p><strong>Name:</strong> {member.name}</p>
            <p><strong>Email:</strong> {member.email} </p>
            <p><strong>Phone Number:</strong> {member.phoneNumber} </p>
            <p><strong>Date of Birth:</strong> {member.dateOfBirth} </p>
            <p><strong>Type:</strong> {member.roleName} </p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}

export default Profile

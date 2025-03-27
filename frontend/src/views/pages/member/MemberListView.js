import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CSpinner,
  CAlert,
  CContainer,
  CButton,
} from "@coreui/react";
import DataTable from "react-data-table-component";
import { Modal, Button } from "react-bootstrap";
import { listRequest } from "../../../services/MemberService";

const MemberListView = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchMembers = async () => {
    try {
      const response = await listRequest();
      if (response.code === 200 && !response.error) {
        setMembers(Array.isArray(response.results.user) ? response.results.user : []);
      } else {
        setError("Failed to fetch members. Please try again later.");
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch members. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  if (loading) {
    return (
      <CRow className="justify-content-center">
        <CCol xs="auto">
          <CSpinner color="primary" />
        </CCol>
      </CRow>
    );
  }

  if (error) {
    return <CAlert color="danger">{error}</CAlert>;
  }

  const handleDelete = async (id) => {
    // Call your API to delete the product here
    // Example:
    // await axios.delete(`/api/products/${id}`);

    // Remove the product from the state
    // setProducts(products.filter(product => product.id !== id));
    setDeleteModal(false);
  };

  const confirmDelete = (id) => {
    setMemberToDelete(id);
    setDeleteModal(true);
  };

  const handleView = (id) => {
    navigate(`/members/details/${id}`); // Redirect to the product detail page
  };

  const handleEdit = (id) => {
    navigate(`/members/edit/${id}`); // Redirect to the edit page
  };

  const handleCreate = () => {
    console.log("Create");
    navigate("/members/create");
  };

  const filteredMember = members.filter((member) =>
  `${member.firstname} ${member.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
);


  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
      sortable: false,
    },
    {
      name: "Name",
      selector: (row) => `${row.firstName} ${row.lastName}`,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Phone Number",
      selector: (row) => row.phone,
      sortable: true,
    },
    {
      name: "Block",
      selector: (row) => row.blockNumber,
    },
    {
      name: "Society",
      selector: (row) => row.societyId,
    },
    {
      name: "Type",
      selector: (row) => row.userType,
      sortable: true,
    },
    {
      name: "Action",
      selector: null,
      sortable: false,
      cell: (row) => (
        <div>
          <CButton
            color="info"
            onClick={() => handleView(row._id)}
            className="mt-2 me-2 mb-2"
          >
            View
          </CButton>
          <CButton
            color="warning"
            className="mt-2 me-2 mb-2"
            onClick={() => handleEdit(row._id)}
          >
            Edit
          </CButton>
          <CButton
            color="danger"
            className="mb-2"
            onClick={() => confirmDelete(row._id)}
          >
            Delete
          </CButton>
        </div>
      ),
    },
  ];

  return (
    <CContainer>
      <CCard className="mb-4">
        <CCardHeader>Member List</CCardHeader>

        <CCardBody>
          <div className="d-flex justify-content-end mb-3">
            <CButton color="primary" onClick={handleCreate} className="mb-3">
              Create Member
            </CButton>
          </div>
          <div className="d-flex justify-content-end mb-3">
            <CFormInput
              className="mb-3"
              type="text"
              placeholder="Search by first name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "300px", marginTop: "10px" }}
            />
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-center">No records found</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredMember}
              pagination
              highlightOnHover
              striped
              responsive
            />
          )}
        </CCardBody>
      </CCard>
      <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
        <Modal.Header onClose={() => setDeleteModal(false)}>
          <Modal.Title>Delete Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this Member?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={() => handleDelete(memberToDelete)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </CContainer>
  );
};

export default MemberListView;

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CSpinner,
  CAlert,CContainer,
  CButton,CModal,CModalHeader,CModalTitle,CModalBody,CModalFooter
} from "@coreui/react";
import axios from "axios";
import DataTable from 'react-data-table-component';
import { Modal,Button } from 'react-bootstrap';
import { listRequest } from "../../../services/BlockService";

const BlockListView = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    fetchBlock();
  }, []);

  const fetchBlock = async () => {
    try {
      const response = await listRequest();
      if (response.code === 200 && !response.error) {
        setBlocks(response.results);
      } else {
        setError("Failed to fetch societies. Please try again later.");
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch societies. Please try again later.");
      setLoading(false);
    }
  };

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
    setBlockToDelete(id);
    setDeleteModal(true);
  };

  const handleView = (id) => {
    navigate(`/block/details/${id}`); // Redirect to the product detail page
  };

  const handleEdit = (id) => {
    navigate(`/block/edit/${id}`); // Redirect to the edit page
  };

  const handleCreate = () => {
    console.log('Create');
    navigate('/block/create');
  };
  
  const filteredBlocks = blocks.filter(block =>
    block.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: '#',
      cell: (row, index) => index + 1,
      sortable: false,
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Society',
      selector: row => row.society,
      sortable: true,
    },
    {
      name: 'Action',
      selector: null,
      sortable: false,
      cell: (row) => (
        <div>
          <CButton 
            color="info" 
            onClick={() => handleView(row._id)} 
            className="mt-2 me-2 mb-2"
          >View</CButton>
          <CButton color="warning" className="mt-2 me-2 mb-2"  onClick={() => handleEdit(row._id)}>Edit</CButton>
          <CButton color="danger" className="mb-2" onClick={() => confirmDelete(row._id)}>Delete</CButton>
        </div>
      ),
    }
  ];

  return (
    <CContainer>
<CCard className="mb-4">
      <CCardHeader>Block List</CCardHeader>


      <CCardBody>
      <div className="d-flex justify-content-end mb-3">
      <CButton color="primary" onClick={handleCreate} className="mb-3">
          Create Block
        </CButton>
        </div>
        <div className="d-flex justify-content-end mb-3">
        <CFormInput 
        className="mb-3"
          type="text" 
          placeholder="Search by block name..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '300px', marginTop: '10px' }}
        />
        </div>
        
        {loading ? (
          <div>Loading...</div>
        ) : blocks.length === 0 ? (
          <div className="text-center">No records found</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredBlocks}
            pagination
            highlightOnHover
            striped
            responsive
          />
        )}
      </CCardBody>
    </CCard>
    <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
      <Modal.Header onClose={() => setDeleteModal(false)} >
        <Modal.Title>Delete Block</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this block?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setDeleteModal(false)}>
          Close
        </Button>
        <Button variant="danger" onClick={() => handleDelete(blockToDelete)}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
    </CContainer>
  );
};

export default BlockListView;

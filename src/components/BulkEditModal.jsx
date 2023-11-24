import React, { useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { updateInvoice } from "../redux/invoicesSlice";

const BulkEditModal = ({ showModal, closeModal, invoices }) => {
  const dispatch = useDispatch();
  const [editedChanges, setEditedChanges] = useState([]);

  const handleCellEdit = (id, field, value) => {
    const existingIndex = editedChanges.findIndex(
      (change) => change.id === id && change.field === field
    );

    if (existingIndex !== -1) {
      const updatedChanges = [...editedChanges];
      updatedChanges[existingIndex] = { id, field, value };
      setEditedChanges(updatedChanges);
    } else {
      setEditedChanges((prevChanges) => [...prevChanges, { id, field, value }]);
    }
  };

  const handleSaveChanges = () => {
    console.log(editedChanges);
    const errors = [];
  
    editedChanges.forEach((change) => {
      const { id, field, value } = change;

      if (!value) {
        errors.push(`Invoice with ID ${id}: ${field} cannot be empty`);
        return; 
      }

      switch (field) {
        case "dateOfIssue":
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            errors.push(`Invoice with ID ${id}: Due date should be in the format yyyy-mm-dd`);
          }
          break;
        
        case "billTo":
          if (!/^[a-zA-Z]+$/.test(value)) {
            errors.push(`Invoice with ID ${id}: Billed to must contain only alphabets`);
          }
          break;
        case "billToEmail":
          if (!value.endsWith("@gmail.com")) {
            errors.push(`Invoice with ID ${id}: Email should end with @gmail.com`);
          }
          break;
        case "total":
          if (!/^\d+\.\d{2}$/.test(value)) {
            errors.push(`Invoice with ID ${id}: Subtotal should be numeric with two decimals`);
          }
          break;
        default:
          break;
      }
    });
  
    if (errors.length > 0) {
      alert(`Validation errors:\n${errors.join("\n")}`);
      return;
    }
  
    editedChanges.forEach((change) => {
      const { id, field, value } = change;
      const updatedInvoice = { id, [field]: value };
      dispatch(updateInvoice({ id, updatedInvoice }));
    });
  
    setEditedChanges([]);
    closeModal();
  };
  
  const handleCancel = () => {
    setEditedChanges([]);
    closeModal();
  };

  return (
    <Modal show={showModal} onHide={handleCancel}  size="lg">
<Modal.Header closeButton>
        <Modal.Title>Bulk Edit Invoices</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover responsive >
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Billed to</th>
              <th>Email</th>
              <th>Subtotal</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  {invoice.invoiceNumber}
                </td>
                <td>{invoice.id}</td>
                <td>{invoice.currentDate}</td>
                <td
                  contentEditable
                  onBlur={(e) => handleCellEdit(invoice.id, "billTo", e.target.innerText)}
                >
                  {invoice.billTo}
                </td>
                <td
                  contentEditable
                  onBlur={(e) =>
                    handleCellEdit(invoice.id, "billToEmail", e.target.innerText)
                  }
                >
                  {invoice.billToEmail}
                </td>
                <td
                  contentEditable
                  onBlur={(e) =>
                    handleCellEdit(invoice.id, "total", e.target.innerText)
                  }
                >
                  {invoice.total}
                </td>
                <td
                  contentEditable
                  onBlur={(e) => handleCellEdit(invoice.id, "dateOfIssue", e.target.innerText)}
                >
                  {invoice.dateOfIssue}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkEditModal;

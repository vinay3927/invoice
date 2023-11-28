import React, { useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { updateInvoice } from "../redux/invoicesSlice";
import ItemsModal from "./ItemsModal"; 

const BulkEditModal = ({ showModal, closeModal, invoices, onHide }) => {
  const dispatch = useDispatch();
  const [editedChanges, setEditedChanges] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

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

const handleShowItems = (invoiceId) => {
  const selectedInvoice = invoices.find((invoice) => invoice.id === invoiceId);
  setSelectedItems(selectedInvoice.items);
  setSelectedInvoice(invoiceId);
  setShowItemsModal(true);
};

  const handleCloseItems = () => {
    setSelectedInvoice(null);
    setShowItemsModal(false);
  };

  const handleSaveChanges = () => {
    const errors = [];
    const changesToDispatch = [];
  
    // Calculate subtotal and add it to edited changes
    if (selectedItems && selectedItems.id) {
      let subtotal = 0;
  
      for (const item of selectedItems.value) {
        const itemPrice = parseFloat(item.itemPrice) || 0;
        const itemQuantity = parseInt(item.itemQuantity) || 0;
        subtotal += itemPrice * itemQuantity;
      }
  
      const subtotalChange = {
        id: selectedItems.id,
        field: "subTotal",
        value: subtotal.toFixed(2),
      };
  
      changesToDispatch.push(subtotalChange);
    }
  
    changesToDispatch.forEach((change) => {
      const { id, field, value } = change;
  
      switch (field) {
        case "subTotal":
          const taxRate = parseFloat(
            editedChanges.find(
              (item) => item.id === id && item.field === "taxRate"
            )?.value || invoices.find((invoice) => invoice.id === id)?.taxRate || 0
          );
  
          const discountRate = parseFloat(
            editedChanges.find(
              (item) => item.id === id && item.field === "discountRate"
            )?.value || invoices.find((invoice) => invoice.id === id)?.discountRate || 0
          );
  
          const subTotal = parseFloat(value);
          const taxAmount = (subTotal * (taxRate / 100)).toFixed(2);
          const discountAmount = (subTotal * (discountRate / 100)).toFixed(2);
          const totalAmount = (
            subTotal +
            parseFloat(taxAmount) -
            parseFloat(discountAmount)
          ).toFixed(2);
  
          const taxRateChange = { id, field: "taxRate", value: taxRate.toString() };
          const discountRateChange = { id, field: "discountRate", value: discountRate.toString() };
          const taxAmountChange = { id, field: "taxAmount", value: taxAmount };
          const discountAmountChange = { id, field: "discountAmount", value: discountAmount };
          const totalAmountChange = { id, field: "total", value: totalAmount };
  
          changesToDispatch.push(
            taxRateChange,
            discountRateChange,
            taxAmountChange,
            discountAmountChange,
            totalAmountChange
          );
          break;
  
        default:
          break;
      }
    });
  
    // Validate and add all changes to editedChanges
    editedChanges.forEach((change) => {
      const { id, field, value } = change;
  
      if (!value) {
        errors.push(`Invoice with ID ${id}: ${field} cannot be empty`);
        return;
      }
  
      switch (field) {
        case "dateOfIssue":
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            errors.push(
              `Invoice with ID ${id}: Due date should be in the format yyyy-mm-dd`
            );
          }
          break;
        case "billTo":
          if (!/^[a-zA-Z\s]+$/.test(value)) {
            errors.push(
              `Invoice with ID ${id}: Billed to must contain only alphabets and spaces`
            );
          }
          break;
        case "billToEmail":
          if (!value.endsWith("@gmail.com")) {
            errors.push(
              `Invoice with ID ${id}: Email should end with @gmail.com`
            );
          }
          break;
        default:
          break;
      }
  
      changesToDispatch.push(change);
    });
  
    if (errors.length > 0) {
      alert(`Validation errors:\n${errors.join("\n")}`);
      return;
    }

    changesToDispatch.push(selectedItems);
    // Dispatch all changes at once
    Promise.all(
      changesToDispatch.map(async (change) => {
        const { id, field, value } = change;
        const updatedInvoice = { id, [field]: value };
        await dispatch(updateInvoice({ id, updatedInvoice }));
      })
    );
  
    setEditedChanges([]);
    onHide();
    closeModal();
  };
  

  const handleCancel = () => {
    setEditedChanges([]);
    closeModal();
  };

  return (    <div>
      <Modal show={showModal} onHide={handleCancel} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Bulk Edit Invoices</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Billed To</th>
                <th>Bill To Email</th>
                <th>Bill To Address</th>
                <th>Bill From</th>
                <th>Bill From Email</th>
                <th>Bill From Address</th>
                <th>Due Date</th>
                <th>Tax Rate</th>
                <th>Discount %</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.id}</td>
                  <td>{invoice.currentDate}</td>
                  <td
                    contentEditable
                    onBlur={(e) =>
                      handleCellEdit(invoice.id, "billTo", e.target.innerText)
                    }
                  >
                    {invoice.billTo}
                  </td>
                  <td
                    contentEditable
                    onBlur={(e) =>
                      handleCellEdit(
                        invoice.id,
                        "billToEmail",
                        e.target.innerText
                      )
                    }
                  >
                    {invoice.billToEmail}
                  </td>
                  <td
                    contentEditable
                    onBlur={(e) =>
                      handleCellEdit(
                        invoice.id,
                        "billToAddress",
                        e.target.innerText
                      )
                    }
                  >
                    {invoice.billToAddress}
                  </td>
                  <td
                    contentEditable
                    onBlur={(e) =>
                      handleCellEdit(invoice.id, "billFrom", e.target.innerText)
                    }
                  >
                    {invoice.billFrom}
                  </td>
                  <td
                    contentEditable
                    onBlur={(e) =>
                      handleCellEdit(
                        invoice.id,
                        "billFromEmail",
                        e.target.innerText
                      )
                    }
                  >
                    {invoice.billFromEmail}
                  </td>
                  <td
                    contentEditable
                    onBlur={(e) =>
                      handleCellEdit(
                        invoice.id,
                        "billFromAddress",
                        e.target.innerText
                      )
                    }
                  >
                    {invoice.billFromAddress}
                  </td>
                  <td
                    contentEditable
                    onBlur={(e) =>
                      handleCellEdit(
                        invoice.id,
                        "dateOfIssue",
                        e.target.innerText
                      )
                    }
                  >
                    {invoice.dateOfIssue}
                  </td>
                  <td
                    contentEditable
                    onBlur={(e) =>
                      handleCellEdit(invoice.id, "taxRate", e.target.innerText)
                    }
                  >
                    {invoice.taxRate}
                  </td>
                  <td
                    contentEditable
                    onBlur={(e) =>
                      handleCellEdit(
                        invoice.id,
                        "discountRate",
                        e.target.innerText
                      )
                    }
                  >
                    {invoice.discountRate}
                  </td>
                  <td>
                    <Button
                      variant="info"
                      onClick={() => handleShowItems(invoice.id)}
                    >
                      Items
                    </Button>
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

      <ItemsModal
        showItemsModal={showItemsModal}
        handleCloseItems={handleCloseItems}
        items={selectedItems}
        selectedInvoiceId={selectedInvoice}
        onSaveChanges={(editedItems) => setSelectedItems(editedItems)}
      />
    </div>
  );
};

export default BulkEditModal;

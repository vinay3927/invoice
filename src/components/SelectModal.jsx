import React, { useState, useEffect } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import BulkEditModal from "./BulkEditModal";
import { deleteInvoice } from "../redux/invoicesSlice";

const SelectModal = ({ show, onHide, invoiceList }) => {
  const dispatch = useDispatch();

  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  useEffect(() => {
    if (selectAll) {
      setSelectedInvoices(invoiceList.map((invoice) => invoice.id));
    } else {
      setSelectedInvoices([]);
    }
  }, [selectAll, invoiceList]);

  const handleInvoiceSelect = (invoiceId) => {
    if (selectedInvoices.includes(invoiceId)) {
      setSelectedInvoices(selectedInvoices.filter((id) => id !== invoiceId));
    } else {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleEditSelected = () => {
    setShowBulkEditModal(true);
  };

  const handleDeleteClick = (invoiceId) => {
    dispatch(deleteInvoice(invoiceId));
  };

  const handleDeleteSelected = () => {
    selectedInvoices.forEach((invoiceId) => {
      handleDeleteClick(invoiceId);
    });
    setSelectedInvoices([]);
  };

  const handleCloseBulkEditModal = () => {
    setShowBulkEditModal(false);
  };

  const handleSaveChanges = () => {
    handleCloseBulkEditModal();
  };

  const handleRowClick = (invoiceId) => {
    handleInvoiceSelect(invoiceId);
  };

  return (
    <>
      <Modal show={show && !showBulkEditModal} onHide={onHide} size="lg">
        <Modal.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Invoice No.</th>
                <th>Bill To</th>
                <th>Due Date</th>
                <th>Total Amt.</th>
              </tr>
            </thead>
            <tbody>
              {invoiceList.map((invoice) => (
                <tr key={invoice.id} onClick={() => handleRowClick(invoice.id)}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => handleInvoiceSelect(invoice.id)}
                    />
                  </td>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.billTo}</td>
                  <td>{invoice.dateOfIssue}</td>
                  <td>
                    {invoice.currency}
                    {invoice.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDeleteSelected}>
            Delete Selected
          </Button>
          <Button variant="primary" onClick={handleEditSelected}>
            Edit Selected
          </Button>
        </Modal.Footer>
      </Modal>

      {showBulkEditModal && (
        <BulkEditModal
          showModal={true}
          onHide={onHide}
          closeModal={handleCloseBulkEditModal}
          onSaveChanges={handleSaveChanges} 
          invoices={invoiceList.filter((invoice) =>
            selectedInvoices.includes(invoice.id)
          )}
        />
      )}
    </>
  );
};

export default SelectModal;

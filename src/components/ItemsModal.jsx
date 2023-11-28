import React, { useState, useEffect } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";

const ItemsModal = ({ showItemsModal, handleCloseItems, items, selectedInvoiceId, onSaveChanges }) => {
  const [editedItems, setEditedItems] = useState([]);

  useEffect(() => {
    if (Array.isArray(items)) {
      setEditedItems(items.map((item) => ({ ...item })));
    }
  }, [items]);
  
  const handleItemEdit = (itemId, field, value) => {
    const updatedItems = editedItems.map((item) => {
      if (item.itemId === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    });

    setEditedItems(updatedItems);
  };

  const handleAddRow = () => {
    const newId = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    const newEmptyItem = {
      itemId: newId,
      itemName: "",
      itemDescription: "",
      itemPrice: "1.00",
      itemQuantity: 1,
    };

    setEditedItems([...editedItems, newEmptyItem]);
  };

  const handleDeleteRow = (itemId) => {
    const updatedItems = editedItems.filter((item) => item.itemId !== itemId);
    setEditedItems(updatedItems);
  };

  const handleSaveChanges = () => {
    const transformedItems = ({
      id: selectedInvoiceId,
      field: "items",
      value: editedItems,
    });
  
    onSaveChanges(transformedItems);
    handleCloseItems();
  };
  
  return (
    <Modal show={showItemsModal} onHide={handleCloseItems} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Items</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Item Name</th>
              <th>Item Description</th>
              <th>Item Price</th>
              <th>Item Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {editedItems.map((item, index) => (
              <tr key={index}>
                <td>{item.itemId}</td>
                <td
                  contentEditable
                  onBlur={(e) =>
                    handleItemEdit(item.itemId, "itemName", e.target.innerText)
                  }
                  dangerouslySetInnerHTML={{ __html: item.itemName }}
                />
                <td
                  contentEditable
                  onBlur={(e) =>
                    handleItemEdit(
                      item.itemId,
                      "itemDescription",
                      e.target.innerText
                    )
                  }
                  dangerouslySetInnerHTML={{ __html: item.itemDescription }}
                />
                <td
                  contentEditable
                  onBlur={(e) =>
                    handleItemEdit(item.itemId, "itemPrice", e.target.innerText)
                  }
                  dangerouslySetInnerHTML={{ __html: item.itemPrice }}
                />
                <td
                  contentEditable
                  onBlur={(e) =>
                    handleItemEdit(
                      item.itemId,
                      "itemQuantity",
                      e.target.innerText
                    )
                  }
                  dangerouslySetInnerHTML={{ __html: item.itemQuantity }}
                />
                <td>
                  <Button variant="link" onClick={() => handleDeleteRow(item.itemId)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleAddRow}>
          Add Item
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ItemsModal;

import React, { useState } from 'react';

const ReceiptItem = ({ onAddItem, editingItem }) => {
  
  const [name, setName] = useState(editingItem?.name || '');
  const [price, setPrice] = useState(editingItem?.price || '');
  const [quantity, setQuantity] = useState(editingItem?.quantity || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseInt(quantity, 10);

    if (isNaN(parsedPrice) || isNaN(parsedQuantity) || parsedPrice < 0 || parsedQuantity < 1) {
      alert("Please enter valid price and quantity.");
      return;
    }

    onAddItem({ name, price: parsedPrice, quantity: parsedQuantity });
    setName('');
    setPrice('');
    setQuantity(1);
};

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <input
        type="text"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
        step="0.01"
        required
      />
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        min="1"
        required
      />
      <button type="submit">
        {editingItem ? 'Update Item' : 'Add Item'}
      </button>
    </form>
  );
};

export default ReceiptItem;
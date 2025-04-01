import React, { useState } from 'react';
import ReceiptItem from './ReceiptItem';
import ReceiptPreview from './ReceiptPreview';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const ReceiptForm = () => {
  const [items, setItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [method, setMethod] = useState('email');

  const [storeInfo, setStoreInfo] = useState({
    storeName: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    logo: null,
    currency: 'PHP',
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const handleStoreInfoChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo({ ...storeInfo, [name]: value });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setStoreInfo({ ...storeInfo, logo: reader.result }); // Convert to base64
      };
      reader.onerror = () => alert("Error uploading logo.");
    }
  };  

  const handleCurrencyChange = (e) => {
    setStoreInfo({ ...storeInfo, currency: e.target.value });
  };

  const handleAddItem = (item) => {
    if (editingIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editingIndex] = item;
      setItems(updatedItems);
      setEditingIndex(null);
    } else {
      setItems([...items, item]);
    }
  };

  const handleEditItem = (index) => {
    setEditingIndex(index);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleGenerateReceipt = () => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setReceiptData({ items, total, storeInfo });
  };

  const resetForm = () => {
    setStoreInfo({
      storeName: '',
      storeAddress: '',
      storePhone: '',
      storeEmail: '',
      logo: null,
      currency: 'PHP',
    });
    setItems([]);
    setReceiptData(null);
    setLogoPreview(null);
  };

  const handleSendReceipt = async (recipient, method) => {
    if (!recipient.trim()) {
      alert("Recipient cannot be empty!");
      return;
    }
  
    try {
      alert(`Receipt sent to ${recipient} via ${method}`);
    } catch (error) {
      alert("Failed to send receipt!");
    }
  };
  

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Receipt Generator</h2>
      
      <div className="space-y-4">
        <input type="text" name="storeName" placeholder="Store Name" value={storeInfo.storeName} onChange={handleStoreInfoChange} className="w-full p-2 border rounded" />
        <input type="text" name="storeAddress" placeholder="Store Address" value={storeInfo.storeAddress} onChange={handleStoreInfoChange} className="w-full p-2 border rounded" />
        <input type="text" name="storePhone" placeholder="Store Phone" value={storeInfo.storePhone} onChange={handleStoreInfoChange} className="w-full p-2 border rounded" />
        <input type="email" name="storeEmail" placeholder="Store Email" value={storeInfo.storeEmail} onChange={handleStoreInfoChange} className="w-full p-2 border rounded" />

        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" onChange={handleLogoUpload} className="border p-2" />
          {logoPreview && <img src={logoPreview} alt="Logo Preview" className="w-12 h-12 object-cover rounded" />}
        </div>

        <div className="flex gap-2">
          <label className="font-semibold">Currency:</label>
          <select name="currency" value={storeInfo.currency} onChange={handleCurrencyChange} className="border p-2 rounded">
            <option value="USD">USD ($)</option>
            <option value="PHP">PESO (₱)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>
      </div>

      <ReceiptItem onAddItem={handleAddItem} editingItem={editingIndex !== null ? items[editingIndex] : null} />

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between p-2 border rounded">
            <span>{item.name} - {storeInfo.currency} {item.price} x {item.quantity}</span>
            <div className="space-x-2">
              <button onClick={() => handleEditItem(index)} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
              <button onClick={() => handleDeleteItem(index)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={handleGenerateReceipt} className="w-full bg-blue-500 text-white p-2 rounded">Generate Receipt</button>
        <button onClick={resetForm} className="w-full bg-gray-500 text-white p-2 rounded">Reset Form</button>
      </div>

      {/* Receipt Preview Section - Only Show When Receipt is Generated */}
      {receiptData && (
        <ReceiptPreview 
          items={receiptData.items} 
          total={receiptData.total} 
          storeInfo={receiptData.storeInfo} 
          onSend={handleSendReceipt}
          onSend={handleSendReceipt} 
          recipient={recipient} 
          setRecipient={setRecipient}  
          method={method} 
          setMethod={setMethod} 
        />
      )}

    </div>
  );
};

export default ReceiptForm;

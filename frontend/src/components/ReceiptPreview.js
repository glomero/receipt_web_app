import React, { useState } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import ReceiptPDF from './ReceiptPDF';
import axios from 'axios';

const ReceiptPreview = ({ items, total, storeInfo, onSend, recipient, setRecipient, method, setMethod }) => {
  const [loading, setLoading] = useState(false); // Loading state
  const [sent, setSent] = useState(false);
  const [file, setFile] = useState(null); // Fix: Define `file`
  const allowedExtensions = ['jpg', 'jpeg', 'png'];
  const [content, setContent] = useState({}); // Fix: Define `content`

  // File validation function
  const validateFile = (file) => {
    if (!file) {
      console.error("❌ No file selected.");
      return false;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      console.error("❌ Not a valid image extension:", file.name);
      alert("Invalid file type! Please upload JPG, JPEG, or PNG.");
      return false;
    }

    console.log("✅ Valid image file:", file.name);
    return true;
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  // Handle sending receipt
  const handleSendReceipt = async () => {
    if (!recipient.trim()) {
      alert("Recipient cannot be empty!");
      return;
    }

    setLoading(true); // Start loading

    try {
      // Generate the PDF as a blob
      const blob = await pdf(<ReceiptPDF storeInfo={storeInfo} items={items} total={total} />).toBlob();

      // Create a FormData object
      const content = { items, total, storeInfo }; 
      const formData = new FormData();
      formData.append('recipient', recipient);
      formData.append('method', method);
      formData.append('content', JSON.stringify(content)); 
      formData.append('pdf', blob, 'receipt.pdf'); // Fix: Use generated PDF blob

      // Send the request
      await axios.post('http://localhost:5000/send-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSent(true);
      alert('Receipt sent successfully!');
    } catch (error) {
      alert(`Error: ${error.response?.data?.error || 'Server error'}`);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="receipt-preview">
      <h3>Receipt Preview</h3>

      {/* PDF Preview */}
      <div style={{ width: '100%', height: '500px', marginBottom: '20px' }}>
        <PDFViewer width="100%" height="100%">
          <ReceiptPDF storeInfo={storeInfo} items={items} total={total} />
        </PDFViewer>
      </div>

      {/* Store Information */}
      <div className="store-info-preview">
        <h4>{storeInfo.storeName}</h4>
        <p>{storeInfo.storeAddress}</p>
        <p>Phone: {storeInfo.storePhone}</p>
        <p>Email: {storeInfo.storeEmail}</p>
      </div>

      {/* Receipt Details */}
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>₱ {item.price.toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td>₱ {(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p><strong>Total: ₱ {total ? total.toFixed(2) : "0.00"}</strong></p>

      {/* Send Receipt Form */}
      <div className="send-receipt">
        <input
          type="text"
          placeholder="Recipient Email/Phone"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
          disabled={loading}
        />
        <select value={method} onChange={(e) => setMethod(e.target.value)} disabled={loading}>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
        <button onClick={handleSendReceipt} disabled={loading}>
          {loading ? <div className="loading-spinner"></div> : 'Send Receipt'}
        </button>
      </div>
    </div>
  );
};

export default ReceiptPreview;

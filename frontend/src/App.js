import React from 'react';
import ReceiptForm from './components/ReceiptForm'; // Import the ReceiptForm component
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Receiptify</h1>
      <ReceiptForm /> {/* Render the ReceiptForm component */}
    </div>
  );
}

export default App;
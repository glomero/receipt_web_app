import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({

  container: { padding: 20 },
  logo: { width: 100, height: 50, marginBottom: 10 }, // Adjust size as needed
  
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'left',
  },
  logoContainer: {
    alignItems: 'center', // Properly centers the logo
    marginBottom: 10,
  },
  logo: {
    width: 50,
  },
  storeInfo: {
    fontSize: 12,
    marginBottom: 10,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    padding: 5,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  total: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
  },
});

// Helper function for currency symbol
const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: '$',
    PESO: 'Php',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
  };
  return symbols[currency] || '';
};

const ReceiptPDF = ({ storeInfo, items, total }) => {
  const currencySymbol = getCurrencySymbol(storeInfo.currency);

  return (
    <Document>
      <Page size="A4" style={styles.container}>
        {/* Store Information */}
        {storeInfo.logo && (
          <View style={styles.logoContainer}>
            <Image src={storeInfo.logo} style={styles.logo} />
          </View>
        )}

        <Text style={styles.header}>{storeInfo.storeName}</Text>
        <Text style={styles.storeInfo}>{storeInfo.storeAddress}</Text>
        <Text style={styles.storeInfo}>Phone: {storeInfo.storePhone}</Text>
        <Text style={styles.storeInfo}>Email: {storeInfo.storeEmail}</Text>

        

        {/* Receipt Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Item</Text>
            <Text style={styles.tableCell}>Price</Text>
            <Text style={styles.tableCell}>Quantity</Text>
            <Text style={styles.tableCell}>Total</Text>
          </View>

          {/* Table Rows */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.name}</Text>
              <Text style={styles.tableCell}>
                {currencySymbol} {item.price.toFixed(2)}
              </Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>
                {currencySymbol} {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Total Amount */}
        <Text style={styles.total}>
          Total: {currencySymbol} {total.toFixed(2)}
        </Text>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;

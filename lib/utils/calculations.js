// Calculate service item total
export const calculateServiceTotal = (quantity, unitPrice, discount = 0) => {
  const subtotal = quantity * unitPrice;
  const discountAmount = subtotal * (discount / 100);
  return subtotal - discountAmount;
};

// Calculate quotation/invoice totals
export const calculateTotals = (services, taxRate = 18) => {
  const subtotal = services.reduce((sum, service) => {
    return sum + calculateServiceTotal(service.quantity, service.unitPrice, service.discount);
  }, 0);
  
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
};

// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date, format = 'long') => {
  const options = format === 'long' 
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  
  return new Date(date).toLocaleDateString('en-IN', options);
};

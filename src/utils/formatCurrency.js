export const formatCurrency = (amount, currency = 'USD') => {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

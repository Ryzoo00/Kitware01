export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (number, locale = 'en-IN') => {
  if (number === null || number === undefined) return '';
  
  return new Intl.NumberFormat(locale).format(number);
};

export const formatPercent = (value, locale = 'en-IN') => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

export default formatCurrency;

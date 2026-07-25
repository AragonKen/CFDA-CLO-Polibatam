const Currency = {
  USD: 1,
  IDR: 15852.99,
  AED: 3.67,
  EUR: 0.95,
}

export const calculateAmountCurrency = (defaultCurrency, newCurrency, amount) => {
  return ((amount / Currency[defaultCurrency]) * Currency[newCurrency]).toFixed(2)
}
